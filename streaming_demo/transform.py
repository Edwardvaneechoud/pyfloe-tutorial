"""
transform.py — pyfloe processing pipelines.

Two pipelines, two execution models:

1. Stream (flat loop)  — live processing via filter + with_column + foreach.
   No plan tree, no optimizer. Constant memory.

2. LazyFrame (volcano) — analytical summary with join + group_by + agg.
   Full plan tree, hash join, optimizer.
"""

from __future__ import annotations

from typing import Callable, Iterator, List

import pyfloe as pf

from producer import COLUMNS

DEPLOYS = pf.LazyFrame(
    [
        {"deploy_id": "deploy-a1b2", "deployer": "alice", "version": "v2.3.1"},
        {"deploy_id": "deploy-c3d4", "deployer": "bob", "version": "v2.3.0"},
        {"deploy_id": "deploy-e5f6", "deployer": "carol", "version": "v2.2.9"},
    ]
)

STREAM_CODE = """\
pf.Stream.from_iter(source, columns=COLUMNS)
    .filter(pf.col("status") >= 400)
    .with_column("is_server_error", pf.col("status") >= 500)
    .foreach(callback)"""

SUMMARY_CODE = """\
pf.from_iter(lambda: iter(error_records))
    .with_column("latency_s", pf.col("latency_ms") / 1000)
    .join(DEPLOYS, on="deploy_id")
    .group_by("path", "deployer")
    .agg(
        pf.col("latency_s").mean().alias("avg_latency_s"),
        pf.col("status").count().alias("error_count"),
    )
    .sort("error_count", ascending=False)"""


def build_stream(source: Iterator[dict]) -> pf.Stream:
    return (
        pf.Stream.from_iter(source, columns=COLUMNS)
        .filter(pf.col("status") >= 400)
        .with_column("is_server_error", pf.col("status") >= 500)
    )


def build_summary(error_records: List[dict]) -> pf.LazyFrame:
    return (
        pf.from_iter(lambda: iter(error_records))
        .with_column("latency_s", pf.col("latency_ms") / 1000)
        .join(DEPLOYS, on="deploy_id")
        .group_by("path", "deployer")
        .agg(
            pf.col("latency_s").mean().alias("avg_latency_s"),
            pf.col("status").count().alias("error_count"),
        )
        .sort("error_count", ascending=False)
    )
