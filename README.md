# Build Your Own DataFrame

A hands-on course that takes apart a real dataframe engine — [pyfloe](https://github.com/Edwardvaneechoud/pyfloe) — and teaches you the architecture behind Polars, Spark, and every serious query engine.

## What you'll learn

- **Expression ASTs** — how `col("x") + col("y")` builds an inspectable tree
- **The Volcano model** — lazy evaluation with pull-based iterators
- **Plan nodes** — ScanNode, FilterNode, ProjectNode, JoinNode, AggNode
- **Hash joins & aggregation** — the algorithms powering real engines
- **Query optimization** — filter pushdown and column pruning
- **Streaming I/O** — constant-memory file reading with factory-based generators

## Course modules

1. **Introduction** — Meet pyfloe
2. **Module 1** — Context & Foundation
3. **Module 2** — Python Magic (Dunder Methods & Expression AST)
4. **Module 3** — The Engine Room (Plan Nodes & Batched Execution)
5. **Module 4** — Advanced Algorithms (Hashing, Grouping & Joins)
6. **Module 5** — The Query Optimizer (Capstone)
7. **Interlude** — Wiring It Together
8. **Interlude** — Why I Think This Is Interesting
9. **Deep Dive** — Streaming I/O
10. **Epilogue** — Where Do You Go From Here?

## Running locally

This is a static site — no build step required:

```bash
python -m http.server 8000
# Open http://localhost:8000
```

## Deploying to GitHub Pages

1. Go to **Settings > Pages** in your GitHub repository
2. Under **Source**, select **Deploy from a branch**
3. Select the branch and root (`/`) folder
4. Click **Save**

The site will be live at `https://<username>.github.io/build-your-own-dataframe/`

## About pyfloe

[pyfloe](https://github.com/Edwardvaneechoud/pyfloe) is a zero-dependency, lazy dataframe engine written in pure Python (~6,000 lines). It implements the same architectural patterns as Polars and Spark — expression trees, the Volcano execution model, hash joins, and a rule-based query optimizer — in a codebase small enough to read in an afternoon.
