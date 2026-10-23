"""Feature-based two-tower retrieval model for campaign/creator matching."""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass
from typing import Any, Sequence

import torch
from torch import nn
from torch.nn import functional as F


def _category_key(value: Any) -> str:
    return str(value or "").strip().casefold()


def normalize_followers(value: Any) -> float:
    """Map follower counts to [0, 1] using a log scale."""
    count = max(0.0, float(value or 0))
    return min(1.0, math.log1p(count) / math.log1p(100_000_000))


@dataclass
class FeatureVocabulary:
    categories: dict[str, int]

    @classmethod
    def from_rows(cls, rows: Sequence[dict[str, Any]]) -> "FeatureVocabulary":
        names: set[str] = set()
        for row in rows:
            campaign = row["campaign"]
            creator = row["creator"]
            names.add(_category_key(campaign.get("product_category")))
            names.add(_category_key(creator.get("influencer_type")))
            for target in campaign.get("target_creator_types") or []:
                names.add(_category_key(target))
        names.discard("")
        return cls({"": 0, **{name: index for index, name in enumerate(sorted(names), start=1)}})

    def encode(self, value: Any) -> int:
        return self.categories.get(_category_key(value), 0)

    def to_dict(self) -> dict[str, int]:
        return dict(self.categories)

    @classmethod
    def from_dict(cls, value: dict[str, int]) -> "FeatureVocabulary":
        return cls({str(key): int(index) for key, index in value.items()})


@dataclass
class ModelConfig:
    vocabulary_size: int
    embedding_dim: int = 32
    hidden_dim: int = 64
    score_scale: float = 10.0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _follower_bounds(campaign: dict[str, Any]) -> list[float]:
    low = campaign.get("follower_min")
    high = campaign.get("follower_max")
    if low is None and high is None:
        return [0.0, 1.0]
    low_value = max(0.0, float(low or 0))
    high_value = max(low_value, float(high if high is not None else 100_000_000))
    return [normalize_followers(low_value), normalize_followers(high_value)]


def make_batch(
    campaigns: Sequence[dict[str, Any]],
    creators: Sequence[dict[str, Any]],
    vocabulary: FeatureVocabulary,
    device: torch.device,
) -> dict[str, torch.Tensor]:
    if len(campaigns) != len(creators):
        raise ValueError("campaigns and creators must contain the same number of pairs")

    target_lists: list[list[str]] = []
    for campaign in campaigns:
        targets = campaign.get("target_creator_types") or []
        if not targets:
            product_category = campaign.get("product_category")
            targets = [product_category] if product_category else []
        target_lists.append([str(value) for value in targets if value])

    width = max(1, max((len(values) for values in target_lists), default=0))
    target_indices = torch.zeros((len(campaigns), width), dtype=torch.long)
    for row_index, values in enumerate(target_lists):
        for column_index, value in enumerate(values[:width]):
            target_indices[row_index, column_index] = vocabulary.encode(value)

    return {
        "product_category": torch.tensor(
            [vocabulary.encode(campaign.get("product_category")) for campaign in campaigns],
            dtype=torch.long,
            device=device,
        ),
        "target_creator_types": target_indices.to(device),
        "follower_bounds": torch.tensor(
            [_follower_bounds(campaign) for campaign in campaigns],
            dtype=torch.float32,
            device=device,
        ),
        "creator_type": torch.tensor(
            [vocabulary.encode(creator.get("influencer_type")) for creator in creators],
            dtype=torch.long,
            device=device,
        ),
        "creator_followers": torch.tensor(
            [normalize_followers(creator.get("follower_count")) for creator in creators],
            dtype=torch.float32,
            device=device,
        ).unsqueeze(1),
        "creator_followers_known": torch.tensor(
            [creator.get("follower_count") is not None for creator in creators],
            dtype=torch.float32,
            device=device,
        ).unsqueeze(1),
    }


class TwoTowerModel(nn.Module):
    """Separate campaign and creator encoders joined by a dot-product score."""

    def __init__(self, config: ModelConfig, include_followers_known: bool = True) -> None:
        super().__init__()
        dimension = config.embedding_dim
        self.config = config
        self.include_followers_known = include_followers_known
        self.campaign_category_embedding = nn.Embedding(
            config.vocabulary_size, dimension, padding_idx=0
        )
        self.target_type_embedding = nn.Embedding(
            config.vocabulary_size, dimension, padding_idx=0
        )
        self.creator_type_embedding = nn.Embedding(
            config.vocabulary_size, dimension, padding_idx=0
        )
        self.campaign_tower = nn.Sequential(
            nn.Linear((dimension * 2) + 2, config.hidden_dim),
            nn.ReLU(),
            nn.Linear(config.hidden_dim, dimension),
        )
        self.creator_tower = nn.Sequential(
            nn.Linear(dimension + (2 if include_followers_known else 1), config.hidden_dim),
            nn.ReLU(),
            nn.Linear(config.hidden_dim, dimension),
        )

    def encode_campaign(self, batch: dict[str, torch.Tensor]) -> torch.Tensor:
        product = self.campaign_category_embedding(batch["product_category"])
        target_vectors = self.target_type_embedding(batch["target_creator_types"])
        mask = batch["target_creator_types"].ne(0).unsqueeze(-1)
        target_sum = (target_vectors * mask).sum(dim=1)
        target_count = mask.sum(dim=1).clamp(min=1)
        target_mean = target_sum / target_count
        features = torch.cat((product, target_mean, batch["follower_bounds"]), dim=1)
        return F.normalize(self.campaign_tower(features), p=2, dim=1)

    def encode_creator(self, batch: dict[str, torch.Tensor]) -> torch.Tensor:
        creator_type = self.creator_type_embedding(batch["creator_type"])
        features = [creator_type, batch["creator_followers"]]
        if self.include_followers_known:
            features.append(batch["creator_followers_known"])
        features = torch.cat(features, dim=1)
        return F.normalize(self.creator_tower(features), p=2, dim=1)

    def forward(self, batch: dict[str, torch.Tensor]) -> torch.Tensor:
        campaign_vector = self.encode_campaign(batch)
        creator_vector = self.encode_creator(batch)
        return (campaign_vector * creator_vector).sum(dim=1) * self.config.score_scale
