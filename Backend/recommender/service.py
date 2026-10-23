"""Local HTTP service for bidirectional campaign/creator recommendations."""

from __future__ import annotations

import math
import os
from pathlib import Path
from typing import Any

import torch
from fastapi import FastAPI
from pydantic import BaseModel, Field

from two_tower import FeatureVocabulary, ModelConfig, TwoTowerModel, make_batch


MODEL_PATH = Path(os.environ.get("INFLUENCEHUB_MODEL_PATH", "artifacts/two_tower.pt"))
DEVICE = torch.device("cpu")


class Campaign(BaseModel):
    id: str
    product_category: str
    target_creator_types: list[str] = Field(default_factory=list)
    follower_min: int | None = Field(default=None, ge=0)
    follower_max: int | None = Field(default=None, ge=0)


class Creator(BaseModel):
    id: str
    influencer_type: str
    follower_count: int | None = Field(default=None, ge=0)


class CampaignRequest(BaseModel):
    campaign: Campaign
    creators: list[Creator]
    limit: int = Field(default=20, ge=1, le=100)


class CreatorRequest(BaseModel):
    creator: Creator
    campaigns: list[Campaign]
    limit: int = Field(default=20, ge=1, le=100)


class Recommendation:
    def __init__(self, candidate_id: str, score: float, source: str) -> None:
        self.candidate_id = candidate_id
        self.score = score
        self.source = source

    def to_dict(self) -> dict[str, Any]:
        return {
            "candidateId": self.candidate_id,
            "score": round(self.score, 6),
            "source": self.source,
        }


class Engine:
    def __init__(self) -> None:
        self.model: TwoTowerModel | None = None
        self.vocabulary: FeatureVocabulary | None = None
        if MODEL_PATH.exists():
            checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
            config = ModelConfig(**checkpoint["config"])
            self.vocabulary = FeatureVocabulary.from_dict(checkpoint["vocabulary"])
            state_dict = checkpoint["state_dict"]
            creator_input_size = state_dict["creator_tower.0.weight"].shape[1]
            model_has_known_flag = creator_input_size == config.embedding_dim + 2
            self.model = TwoTowerModel(config, include_followers_known=model_has_known_flag).to(DEVICE)
            self.model.load_state_dict(state_dict)
            self.model.eval()

    def rank(
        self,
        campaigns: list[Campaign],
        creators: list[Creator],
        candidate_ids: list[str],
        limit: int,
    ) -> tuple[str, list[dict[str, Any]]]:
        if len(campaigns) != len(creators) or len(creators) != len(candidate_ids):
            raise ValueError("campaigns, creators, and candidate_ids must be aligned")
        if not candidate_ids:
            return ("two_tower" if self.model else "cold_start", [])

        unknown_followers = any(creator.follower_count is None for creator in creators)
        can_use_model = self.model is not None and (
            self.model.include_followers_known or not unknown_followers
        )
        if can_use_model and self.vocabulary is not None:
            pairs_campaigns = [campaign.model_dump() for campaign in campaigns]
            pairs_creators = [creator.model_dump() for creator in creators]
            batch = make_batch(pairs_campaigns, pairs_creators, self.vocabulary, DEVICE)
            with torch.inference_mode():
                probabilities = torch.sigmoid(self.model(batch)).tolist()
            source = "two_tower"
            scored = [
                Recommendation(candidate_id, float(score), source)
                for candidate_id, score in zip(candidate_ids, probabilities)
            ]
        else:
            source = "cold_start"
            scored = [
                Recommendation(
                    candidate_ids[index],
                    self._cold_start_score(campaigns[index], creators[index]),
                    source,
                )
                for index in range(len(candidate_ids))
            ]

        return source, [
            item.to_dict()
            for item in sorted(scored, key=lambda item: (-item.score, item.candidate_id))[:limit]
        ]

    @staticmethod
    def _cold_start_score(campaign: Campaign, creator: Creator) -> float:
        targets = {value.strip().casefold() for value in campaign.target_creator_types if value.strip()}
        if not targets:
            targets = {campaign.product_category.strip().casefold()}
        category_fit = 1.0 if creator.influencer_type.strip().casefold() in targets else 0.0

        has_range = campaign.follower_min is not None or campaign.follower_max is not None
        if not has_range:
            return 0.9 if category_fit else 0.0

        low = max(0, campaign.follower_min or 0)
        high = max(low, campaign.follower_max if campaign.follower_max is not None else 100_000_000)
        if creator.follower_count is None:
            follower_fit = 0.5
        else:
            count = max(0, creator.follower_count)
            if low <= count <= high:
                follower_fit = 1.0
            else:
                boundary = low if count < low else high
                gap = abs(math.log1p(count) - math.log1p(boundary))
                follower_fit = math.exp(-gap / 2.0)
        return (0.8 * category_fit) + (0.2 * follower_fit)


engine = Engine()
app = FastAPI(title="InfluenceHub Recommendation Engine", version="0.1.0")


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "modelReady": engine.model is not None,
        "mode": "two_tower" if engine.model is not None else "cold_start",
    }


@app.post("/recommendations/creators")
def recommend_creators(request: CampaignRequest) -> dict[str, Any]:
    source, recommendations = engine.rank(
        [request.campaign] * len(request.creators),
        request.creators,
        [creator.id for creator in request.creators],
        request.limit,
    )
    return {"source": source, "recommendations": recommendations}


@app.post("/recommendations/campaigns")
def recommend_campaigns(request: CreatorRequest) -> dict[str, Any]:
    source, recommendations = engine.rank(
        request.campaigns,
        [request.creator] * len(request.campaigns),
        [campaign.id for campaign in request.campaigns],
        request.limit,
    )
    return {"source": source, "recommendations": recommendations}
