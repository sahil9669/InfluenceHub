"""Train the two-tower model from labeled campaign/creator pairs."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import torch
from torch import nn

from two_tower import FeatureVocabulary, ModelConfig, TwoTowerModel, make_batch


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
    with path.open("r", encoding="utf-8") as source:
        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f"Invalid JSON on line {line_number}: {error}") from error
            if not isinstance(row.get("campaign"), dict) or not isinstance(row.get("creator"), dict):
                raise ValueError(f"Line {line_number} must contain campaign and creator objects")
            label = float(row.get("label", -1))
            if not 0.0 <= label <= 1.0:
                raise ValueError(f"Line {line_number} label must be between 0 and 1")
            if not row["campaign"].get("product_category"):
                raise ValueError(f"Line {line_number} campaign.product_category is required")
            if not row["creator"].get("influencer_type"):
                raise ValueError(f"Line {line_number} creator.influencer_type is required")
            row["label"] = label
            rows.append(row)
    return rows


def train(
    rows: list[dict[str, Any]],
    output_path: Path,
    epochs: int = 40,
    batch_size: int = 64,
    learning_rate: float = 0.003,
    embedding_dim: int = 32,
    seed: int = 7,
) -> Path:
    if len(rows) < 2:
        raise ValueError("Training needs at least two labeled campaign/creator pairs.")
    labels = [row["label"] for row in rows]
    if not any(label >= 0.5 for label in labels) or not any(label < 0.5 for label in labels):
        raise ValueError(
            "Training needs positive and negative or lower-rated pairs. "
            "Unshown pairs are unknown, not negative examples."
        )

    torch.manual_seed(seed)
    vocabulary = FeatureVocabulary.from_rows(rows)
    config = ModelConfig(
        vocabulary_size=max(1, len(vocabulary.categories)),
        embedding_dim=embedding_dim,
    )
    model = TwoTowerModel(config)
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    criterion = nn.BCEWithLogitsLoss()
    device = torch.device("cpu")
    model.to(device)

    campaigns = [row["campaign"] for row in rows]
    creators = [row["creator"] for row in rows]
    targets = torch.tensor([row["label"] for row in rows], dtype=torch.float32, device=device)

    for _ in range(epochs):
        order = torch.randperm(len(rows))
        model.train()
        for start in range(0, len(rows), batch_size):
            indices = order[start : start + batch_size].tolist()
            batch = make_batch(
                [campaigns[index] for index in indices],
                [creators[index] for index in indices],
                vocabulary,
                device,
            )
            predictions = model(batch)
            loss = criterion(predictions, targets[indices])
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(
        {
            "state_dict": model.state_dict(),
            "vocabulary": vocabulary.to_dict(),
            "config": config.to_dict(),
        },
        output_path,
    )
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, required=True, help="Labeled JSONL training pairs")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("artifacts/two_tower.pt"),
        help="Path for the trained model checkpoint",
    )
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=0.003)
    parser.add_argument("--embedding-dim", type=int, default=32)
    args = parser.parse_args()

    rows = read_jsonl(args.data)
    saved_path = train(
        rows,
        args.output,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        embedding_dim=args.embedding_dim,
    )
    print(f"Saved trained two-tower model to {saved_path}")


if __name__ == "__main__":
    main()
