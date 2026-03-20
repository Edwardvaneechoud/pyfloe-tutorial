#!/usr/bin/env python3
"""
app.py — Terminal demo of pyfloe's Stream vs LazyFrame.

    cd streaming_demo
    python app.py

The stream runs forever. Press Ctrl+C to stop it and see the
LazyFrame summary (join + group_by + agg on the collected errors).
"""

from __future__ import annotations

import os
import sys
import time

from producer import http_log_stream
from transform import build_stream, build_summary, STREAM_CODE, SUMMARY_CODE

REFRESH_INTERVAL = 0.3


def _clear_and_move_home() -> None:
    sys.stdout.write("\033[H\033[J")
    sys.stdout.flush()


def _render_live(
    total: int,
    errors: int,
    elapsed: float,
    endpoint_stats: dict[str, dict],
) -> None:
    rps = total / elapsed if elapsed > 0 else 0
    err_rate = 100 * errors / max(total, 1)

    lines: list[str] = []
    lines.append("=" * 62)
    lines.append("  pyfloe Stream demo              (Ctrl+C to stop)")
    lines.append("=" * 62)
    lines.append("")
    lines.append("▸ STREAM PIPELINE (flat loop, constant memory)")
    lines.append("")
    lines.append(STREAM_CODE)
    lines.append("")
    lines.append(f"  Records: {total:>10,}    Errors: {errors:>8,} ({err_rate:.1f}%)")
    lines.append(f"  Throughput: {rps:>7,.0f} rec/s    Elapsed: {elapsed:.1f}s")
    lines.append("")

    if endpoint_stats:
        lines.append(
            f"  {'Endpoint':<22} {'Reqs':>8} {'Errors':>7} {'Err%':>6} {'Avg ms':>7}"
        )
        lines.append(f"  {'-' * 22} {'-' * 8} {'-' * 7} {'-' * 6} {'-' * 7}")
        for path in sorted(
            endpoint_stats, key=lambda p: endpoint_stats[p]["errors"], reverse=True
        ):
            s = endpoint_stats[path]
            pct = 100 * s["errors"] / max(s["count"], 1)
            avg = s["total_latency"] / max(s["count"], 1)
            lines.append(
                f"  {path:<22} {s['count']:>8,} {s['errors']:>7,} "
                f"{pct:>5.1f}% {avg:>7.0f}"
            )

    _clear_and_move_home()
    sys.stdout.write("\n".join(lines) + "\n")
    sys.stdout.flush()


def main() -> None:
    total = 0
    errors = 0
    error_records: list[dict] = []
    endpoint_stats: dict[str, dict] = {}
    t0 = time.perf_counter()
    last_render = 0.0

    def on_record(record: dict) -> None:
        nonlocal total, errors, last_render
        total += 1
        path = record["path"]
        is_5xx = record.get("is_server_error", False)

        if path not in endpoint_stats:
            endpoint_stats[path] = {"count": 0, "errors": 0, "total_latency": 0.0}
        s = endpoint_stats[path]
        s["count"] += 1
        s["total_latency"] += record["latency_ms"]

        if is_5xx:
            s["errors"] += 1
            errors += 1
            error_records.append(record)

        now = time.perf_counter()
        if now - last_render >= REFRESH_INTERVAL:
            last_render = now
            _render_live(total, errors, now - t0, endpoint_stats)

    stream = build_stream(http_log_stream())
    try:
        stream.foreach(on_record)
    except KeyboardInterrupt:
        pass

    elapsed = time.perf_counter() - t0
    _render_live(total, errors, elapsed, endpoint_stats)
    print()

    # ── LazyFrame summary ────────────────────────────────
    print("=" * 62)
    print()
    print("▸ LAZYFRAME PIPELINE (volcano tree, hash join + aggregation)")
    print()
    print(SUMMARY_CODE)
    print()

    server_errors = [r for r in error_records if r.get("is_server_error")]
    if not server_errors:
        print("  No 5xx errors to summarize.")
        return

    lf = build_summary(server_errors)

    print("  Query plan:")
    for line in lf.explain(optimized=True).splitlines():
        print(f"    {line}")

    t1 = time.perf_counter()
    result = lf.collect().to_pylist()
    t2 = time.perf_counter()

    print(f"\n  Executed in {(t2 - t1) * 1000:.1f}ms — {len(result)} rows\n")
    print(f"  {'Endpoint':<22} {'Deployer':<10} {'Errors':>7} {'Avg ms':>8}")
    print(f"  {'-' * 22} {'-' * 10} {'-' * 7} {'-' * 8}")
    for row in result[:15]:
        avg_ms = row["avg_latency_s"] * 1000
        print(
            f"  {row['path']:<22} {row['deployer']:<10} "
            f"{row['error_count']:>7,} {avg_ms:>8.0f}"
        )
    if len(result) > 15:
        print(f"  ... and {len(result) - 15} more rows")
    print()


if __name__ == "__main__":
    main()
