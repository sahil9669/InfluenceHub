# InfluenceHub recommendation engine

This is a small Python service for the machine-learning part of InfluenceHub. The main product remains MERN: React and Express/MongoDB own the app, authentication, and marketplace records. Express can call this local service for ranked recommendations.

## Model

There are separate campaign and creator towers. The campaign tower encodes product category, the compatible creator types selected by the platform taxonomy, and an optional follower range. The creator tower encodes the manually selected influencer type, a log-scaled follower count, and whether that count is known. Their normalized vectors are scored with a dot product. Missing follower counts stay `null` and are not treated as zero.

The endpoints can rank creators for a campaign and campaigns for a creator. A checkpoint is produced only after training on labeled campaign/creator pairs. Until then, the service reports cold_start and ranks by category compatibility and follower-range fit. That fallback is a transparent heuristic, not a trained model.

## Install and run

Use Python 3.13 or newer supported by the installed PyTorch release. From this folder, create a virtual environment, install requirements, then run:

    python -m venv .venv
    .venv\Scripts\activate
    python -m pip install -r requirements.txt
    uvicorn service:app --host 127.0.0.1 --port 8100

Health check: GET http://127.0.0.1:8100/health

The API binds to localhost for development. Keep it behind the Express backend when integrating the application; do not expose it directly to the public internet.

## API input

POST /recommendations/creators accepts a campaign and candidate creators. POST /recommendations/campaigns accepts a creator and candidate campaigns. Both return candidate IDs, scores, and whether scoring came from the trained model or cold-start fallback.

The campaign input includes product_category, target_creator_types, follower_min, and follower_max. The platform taxonomy should provide target_creator_types for a campaign. The creator input includes influencer_type and an optional follower_count. A missing Instagram lookup should remain missing; it must not be converted into zero followers. In cold-start mode, missing audience size receives a neutral fit score.

## Training data

The trainer consumes JSON Lines, one labeled pair per line. Each line has campaign, creator, and a label from 0 to 1. Example format:

    {"campaign":{"product_category":"skincare","target_creator_types":["beauty"],"follower_min":10000,"follower_max":100000},"creator":{"influencer_type":"beauty","follower_count":54000},"label":1}

An accepted application can be a strong positive; a decline can be a negative; an application can be used as a weaker positive if the training policy defines that. A pair that was never shown or judged is unknown, not negative. These are only schema examples, not real training records.

Train after collecting or curating labeled pairs:

    python train.py --data path\to\labeled_pairs.jsonl --output artifacts\two_tower.pt

Then restart the recommendation service to load the checkpoint. No trained weights are included because InfluenceHub currently has no labeled interactions.

## Integration contract

The Express service should authenticate the request, load the campaign and eligible creator/campaign candidates from MongoDB, and call this service. It should record recommendation impressions and later application outcomes so future training data comes from real platform events. The model service does not own account authentication or payment data.
