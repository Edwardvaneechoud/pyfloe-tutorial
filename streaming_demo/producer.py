"""
producer.py — Simulated infinite HTTP log stream.

The generator never terminates by default. Pass limit=N to cap it.
Each record is a dict with: ts, method, path, status, latency_ms, deploy_id.

This is the "data source" in a streaming pipeline. In production this
would be a Kafka topic, a log file tail, or an API polling loop.
"""

from __future__ import annotations

import random
import time
from datetime import datetime, timedelta
from typing import Iterator, Optional

ENDPOINTS = [
    "/api/users", "/api/orders", "/api/products",
    "/api/checkout", "/api/search", "/api/auth/login",
    "/api/auth/refresh", "/api/inventory", "/healthz",
]
METHODS = ["GET", "GET", "GET", "POST", "POST", "PUT", "DELETE"]
STATUS_CODES = [200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503]
STATUS_WEIGHTS = [50, 10, 5, 3, 8, 4, 2, 8, 3, 4, 3]
DEPLOY_IDS = ["deploy-a1b2", "deploy-c3d4", "deploy-e5f6"]
COLUMNS = ["ts", "method", "path", "status", "latency_ms", "deploy_id"]


def http_log_stream(
    *, limit: Optional[int] = None, delay: float = 0.0
) -> Iterator[dict]:
    """Yield HTTP log records forever (or up to *limit*).

    5xx responses get higher simulated latency (~1500ms avg).
    """
    count = 0
    base_time = datetime.now()
    while limit is None or count < limit:
        ts = base_time + timedelta(
            milliseconds=count * random.uniform(0.5, 5.0)
        )
        status = random.choices(STATUS_CODES, weights=STATUS_WEIGHTS, k=1)[0]
        if status >= 500:
            latency = max(50, int(random.gauss(1500, 400)))
        else:
            latency = max(5, int(random.gauss(120, 80)))

        yield {
            "ts": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "method": random.choice(METHODS),
            "path": random.choice(ENDPOINTS),
            "status": status,
            "latency_ms": round(latency, 2),
            "deploy_id": random.choice(DEPLOY_IDS),
        }
        if delay > 0:
            time.sleep(delay)
        count += 1
