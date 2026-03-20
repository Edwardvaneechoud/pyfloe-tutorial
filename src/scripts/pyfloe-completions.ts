import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";

interface MethodDef {
  label: string;
  type: string;
  detail?: string;
  info?: string;
}

const PYFLOE_TOP_LEVEL: MethodDef[] = [
  { label: "LazyFrame", type: "class", detail: "class", info: "Lazy dataframe with chainable transformations" },
  { label: "TypedLazyFrame", type: "class", detail: "class", info: "Generic typed lazy dataframe" },
  { label: "LazyGroupBy", type: "class", detail: "class", info: "Group-by handle for aggregation" },
  { label: "Stream", type: "class", detail: "class", info: "Push-based streaming processor" },
  { label: "Optimizer", type: "class", detail: "class", info: "Query plan optimizer" },
  { label: "Expr", type: "class", detail: "class", info: "Base expression type" },
  { label: "Col", type: "class", detail: "class", info: "Column reference expression" },
  { label: "Lit", type: "class", detail: "class", info: "Literal value expression" },
  { label: "LazySchema", type: "class", detail: "class", info: "Schema with column metadata" },
  { label: "ColumnSchema", type: "class", detail: "class", info: "Single column schema (name, dtype, nullable)" },
  { label: "Agg", type: "class", detail: "class", info: "Aggregation function constants (sum, mean, min, max, ...)" },
  { label: "Join", type: "class", detail: "class", info: "Join type constants (inner, left, full)" },
  { label: "DateTrunc", type: "class", detail: "class", info: "Date truncation unit constants" },
  { label: "col", type: "function", detail: "(name: str) -> Col", info: "Create a column reference" },
  { label: "lit", type: "function", detail: "(value: Any) -> Lit", info: "Create a literal value expression" },
  { label: "rank", type: "function", detail: "() -> RankExpr", info: "Rank window function" },
  { label: "dense_rank", type: "function", detail: "() -> RankExpr", info: "Dense rank window function" },
  { label: "row_number", type: "function", detail: "() -> RankExpr", info: "Row number window function" },
  { label: "when", type: "function", detail: "(condition: Expr, then_val) -> WhenExpr", info: "Conditional CASE expression" },
  { label: "read_csv", type: "function", detail: "(path, *, has_header=True, ...) -> LazyFrame", info: "Read CSV file into LazyFrame" },
  { label: "read_tsv", type: "function", detail: "(path, **kwargs) -> LazyFrame", info: "Read TSV file into LazyFrame" },
  { label: "read_jsonl", type: "function", detail: "(path, *, encoding='utf-8', ...) -> LazyFrame", info: "Read JSON Lines file into LazyFrame" },
  { label: "read_json", type: "function", detail: "(path, *, encoding='utf-8', ...) -> LazyFrame", info: "Read JSON file into LazyFrame" },
  { label: "read_fixed_width", type: "function", detail: "(path, *, widths, ...) -> LazyFrame", info: "Read fixed-width file into LazyFrame" },
  { label: "read_parquet", type: "function", detail: "(path, *, columns=None, ...) -> LazyFrame", info: "Read Parquet file into LazyFrame" },
  { label: "from_iter", type: "function", detail: "(source, *, columns=None, ...) -> LazyFrame", info: "Create LazyFrame from an iterable" },
  { label: "from_chunks", type: "function", detail: "(chunks, *, columns=None, ...) -> LazyFrame", info: "Create LazyFrame from chunked dicts" },
];

const LAZY_FRAME_METHODS: MethodDef[] = [
  { label: "select", type: "method", detail: "(*args: str | Expr) -> LazyFrame" },
  { label: "filter", type: "method", detail: "(predicate_or_col=None, ...) -> LazyFrame" },
  { label: "with_column", type: "method", detail: "(name_or_expr, expr=None) -> LazyFrame" },
  { label: "with_columns", type: "method", detail: "(*args: Expr, **kwargs: Expr) -> LazyFrame" },
  { label: "drop", type: "method", detail: "(*columns: str) -> LazyFrame" },
  { label: "rename", type: "method", detail: "(mapping: dict[str, str]) -> LazyFrame" },
  { label: "sort", type: "method", detail: "(*by: str, ascending=True) -> LazyFrame" },
  { label: "join", type: "method", detail: "(other, on=None, how='inner', ...) -> LazyFrame" },
  { label: "group_by", type: "method", detail: "(*columns: str, sorted=False) -> LazyGroupBy" },
  { label: "explode", type: "method", detail: "(column: str) -> LazyFrame" },
  { label: "pivot", type: "method", detail: "(index, on, values, agg='first') -> LazyFrame" },
  { label: "unpivot", type: "method", detail: "(id_columns, value_columns=None, ...) -> LazyFrame" },
  { label: "melt", type: "method", detail: "(...) -> LazyFrame", info: "Alias for unpivot" },
  { label: "union", type: "method", detail: "(other: LazyFrame) -> LazyFrame" },
  { label: "apply", type: "method", detail: "(func, columns=None, output_dtype=None) -> LazyFrame" },
  { label: "read", type: "method", detail: "(columns: str | list[str]) -> LazyFrame" },
  { label: "head", type: "method", detail: "(n: int = 5) -> LazyFrame" },
  { label: "optimize", type: "method", detail: "() -> LazyFrame" },
  { label: "collect", type: "method", detail: "(optimize=True) -> LazyFrame" },
  { label: "count", type: "method", detail: "(optimize=True) -> int" },
  { label: "to_pylist", type: "method", detail: "() -> list[dict]" },
  { label: "to_pydict", type: "method", detail: "() -> dict[str, list]" },
  { label: "to_tuples", type: "method", detail: "() -> list[tuple]" },
  { label: "to_batches", type: "method", detail: "(optimize=True) -> Iterator[list[dict]]" },
  { label: "to_csv", type: "method", detail: "(path, *, delimiter=',', header=True, ...) -> None" },
  { label: "to_tsv", type: "method", detail: "(path, **kwargs) -> None" },
  { label: "to_jsonl", type: "method", detail: "(path, *, encoding='utf-8') -> None" },
  { label: "to_json", type: "method", detail: "(path, *, encoding='utf-8', indent=None) -> None" },
  { label: "to_parquet", type: "method", detail: "(path, **kwargs) -> None" },
  { label: "display", type: "method", detail: "(n=20, max_col_width=30, optimize=True) -> None" },
  { label: "explain", type: "method", detail: "(optimized=False) -> str" },
  { label: "print_explain", type: "method", detail: "(optimized=False) -> None" },
  { label: "typed", type: "method", detail: "(row_type: type[T]) -> TypedLazyFrame[T]" },
  { label: "validate", type: "method", detail: "(row_type: type) -> LazyFrame" },
  { label: "schema", type: "property", detail: "-> LazySchema" },
  { label: "columns", type: "property", detail: "-> list[str]" },
  { label: "dtypes", type: "property", detail: "-> dict[str, type]" },
  { label: "is_materialized", type: "property", detail: "-> bool" },
  { label: "raw_data", type: "property", detail: "-> list[tuple]" },
];

const EXPR_METHODS: MethodDef[] = [
  { label: "alias", type: "method", detail: "(name: str) -> Expr" },
  { label: "cast", type: "method", detail: "(dtype: type) -> CastExpr" },
  { label: "is_null", type: "method", detail: "() -> UnaryExpr" },
  { label: "is_not_null", type: "method", detail: "() -> UnaryExpr" },
  { label: "is_in", type: "method", detail: "(values) -> UnaryExpr" },
  { label: "str", type: "property", detail: "-> StringAccessor", info: "String methods accessor" },
  { label: "dt", type: "property", detail: "-> DateTimeAccessor", info: "Datetime methods accessor" },
  { label: "sum", type: "method", detail: "() -> AggExpr" },
  { label: "mean", type: "method", detail: "() -> AggExpr" },
  { label: "min", type: "method", detail: "() -> AggExpr" },
  { label: "max", type: "method", detail: "() -> AggExpr" },
  { label: "count", type: "method", detail: "() -> AggExpr" },
  { label: "first", type: "method", detail: "() -> AggExpr" },
  { label: "last", type: "method", detail: "() -> AggExpr" },
  { label: "n_unique", type: "method", detail: "() -> AggExpr" },
  { label: "cumsum", type: "method", detail: "() -> CumExpr" },
  { label: "cummax", type: "method", detail: "() -> CumExpr" },
  { label: "cummin", type: "method", detail: "() -> CumExpr" },
  { label: "lag", type: "method", detail: "(n=1, default=None) -> OffsetExpr" },
  { label: "lead", type: "method", detail: "(n=1, default=None) -> OffsetExpr" },
];

const AGG_EXPR_METHODS: MethodDef[] = [
  ...EXPR_METHODS,
  { label: "over", type: "method", detail: "(partition_by=None, order_by=None) -> WindowExpr" },
];

const WINDOW_EXPR_METHODS: MethodDef[] = [
  { label: "alias", type: "method", detail: "(name: str) -> WindowExpr" },
];

const WHEN_EXPR_METHODS: MethodDef[] = [
  { label: "when", type: "method", detail: "(condition: Expr, then_val) -> WhenExpr" },
  { label: "otherwise", type: "method", detail: "(val) -> WhenExpr" },
  { label: "alias", type: "method", detail: "(name: str) -> Expr" },
];

const STRING_ACCESSOR_METHODS: MethodDef[] = [
  { label: "upper", type: "method", detail: "() -> UnaryExpr" },
  { label: "lower", type: "method", detail: "() -> UnaryExpr" },
  { label: "strip", type: "method", detail: "() -> UnaryExpr" },
  { label: "len", type: "method", detail: "() -> UnaryExpr" },
  { label: "title", type: "method", detail: "() -> UnaryExpr" },
  { label: "contains", type: "method", detail: "(pat: str) -> UnaryExpr" },
  { label: "startswith", type: "method", detail: "(prefix: str) -> UnaryExpr" },
  { label: "endswith", type: "method", detail: "(suffix: str) -> UnaryExpr" },
  { label: "replace", type: "method", detail: "(old: str, new: str) -> UnaryExpr" },
  { label: "slice", type: "method", detail: "(start=None, end=None) -> UnaryExpr" },
];

const DATETIME_ACCESSOR_METHODS: MethodDef[] = [
  { label: "year", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "month", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "day", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "hour", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "minute", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "second", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "microsecond", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "weekday", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "isoweekday", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "day_name", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "month_name", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "quarter", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "week", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "day_of_year", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "date", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "time", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "truncate", type: "method", detail: "(unit: DateTruncUnit) -> _DtUnaryExpr" },
  { label: "strftime", type: "method", detail: "(fmt: str) -> _DtUnaryExpr" },
  { label: "epoch_seconds", type: "method", detail: "() -> _DtUnaryExpr" },
  { label: "add_days", type: "method", detail: "(n: int) -> _DtUnaryExpr" },
  { label: "add_hours", type: "method", detail: "(n: int) -> _DtUnaryExpr" },
  { label: "add_minutes", type: "method", detail: "(n: int) -> _DtUnaryExpr" },
  { label: "add_seconds", type: "method", detail: "(n: int) -> _DtUnaryExpr" },
];

const LAZY_GROUP_BY_METHODS: MethodDef[] = [
  { label: "agg", type: "method", detail: "(*agg_exprs: AggExpr) -> LazyFrame" },
];

const STREAM_METHODS: MethodDef[] = [
  { label: "filter", type: "method", detail: "(predicate: Expr) -> Stream" },
  { label: "with_column", type: "method", detail: "(name_or_expr, expr=None) -> Stream" },
  { label: "select", type: "method", detail: "(*columns: str) -> Stream" },
  { label: "apply", type: "method", detail: "(func, columns=None) -> Stream" },
  { label: "collect", type: "method", detail: "() -> LazyFrame" },
  { label: "to_pylist", type: "method", detail: "() -> list[dict]" },
  { label: "to_csv", type: "method", detail: "(path, *, delimiter=',', header=True, ...) -> None" },
  { label: "to_jsonl", type: "method", detail: "(path, *, encoding='utf-8') -> None" },
  { label: "foreach", type: "method", detail: "(func: Callable[[dict], None]) -> None" },
  { label: "count", type: "method", detail: "() -> int" },
  { label: "take", type: "method", detail: "(n: int) -> list[dict]" },
  { label: "columns", type: "property", detail: "-> list[str]" },
  { label: "schema", type: "property", detail: "-> LazySchema" },
];

const LAZY_SCHEMA_METHODS: MethodDef[] = [
  { label: "column_names", type: "property", detail: "-> list[str]" },
  { label: "dtypes", type: "property", detail: "-> dict[str, type]" },
  { label: "select", type: "method", detail: "(columns: list[str]) -> LazySchema" },
  { label: "drop", type: "method", detail: "(columns: list[str]) -> LazySchema" },
  { label: "rename", type: "method", detail: "(mapping: dict[str, str]) -> LazySchema" },
  { label: "merge", type: "method", detail: "(other, suffix='right_') -> LazySchema" },
  { label: "with_column", type: "method", detail: "(name, dtype, nullable=True) -> LazySchema" },
  { label: "with_dtype", type: "method", detail: "(column, dtype) -> LazySchema" },
  { label: "from_data", type: "method", detail: "(columns, rows) -> LazySchema", info: "classmethod" },
  { label: "from_dicts", type: "method", detail: "(data: list[dict]) -> LazySchema", info: "classmethod" },
];

const COLUMN_SCHEMA_METHODS: MethodDef[] = [
  { label: "name", type: "property", detail: "-> str" },
  { label: "dtype", type: "property", detail: "-> type" },
  { label: "nullable", type: "property", detail: "-> bool" },
  { label: "with_name", type: "method", detail: "(name: str) -> ColumnSchema" },
  { label: "with_dtype", type: "method", detail: "(dtype: type) -> ColumnSchema" },
  { label: "with_nullable", type: "method", detail: "(nullable: bool) -> ColumnSchema" },
];

const AGG_CONSTANTS: MethodDef[] = [
  { label: "sum", type: "property", detail: ": AggFunc" },
  { label: "mean", type: "property", detail: ": AggFunc" },
  { label: "min", type: "property", detail: ": AggFunc" },
  { label: "max", type: "property", detail: ": AggFunc" },
  { label: "count", type: "property", detail: ": AggFunc" },
  { label: "first", type: "property", detail: ": AggFunc" },
  { label: "last", type: "property", detail: ": AggFunc" },
  { label: "n_unique", type: "property", detail: ": AggFunc" },
];

const JOIN_CONSTANTS: MethodDef[] = [
  { label: "inner", type: "property", detail: ": JoinHow" },
  { label: "left", type: "property", detail: ": JoinHow" },
  { label: "full", type: "property", detail: ": JoinHow" },
];

const DATE_TRUNC_CONSTANTS: MethodDef[] = [
  { label: "year", type: "property", detail: ": DateTruncUnit" },
  { label: "month", type: "property", detail: ": DateTruncUnit" },
  { label: "day", type: "property", detail: ": DateTruncUnit" },
  { label: "hour", type: "property", detail: ": DateTruncUnit" },
  { label: "minute", type: "property", detail: ": DateTruncUnit" },
];

const OPTIMIZER_METHODS: MethodDef[] = [
  { label: "optimize", type: "method", detail: "(plan: PlanNode) -> PlanNode" },
];

const LIST_METHODS: MethodDef[] = [
  { label: "append", type: "method", detail: "(object) -> None" },
  { label: "clear", type: "method", detail: "() -> None" },
  { label: "copy", type: "method", detail: "() -> list" },
  { label: "count", type: "method", detail: "(value) -> int" },
  { label: "extend", type: "method", detail: "(iterable) -> None" },
  { label: "index", type: "method", detail: "(value, start=0, stop=...) -> int" },
  { label: "insert", type: "method", detail: "(index, object) -> None" },
  { label: "pop", type: "method", detail: "(index=-1) -> object" },
  { label: "remove", type: "method", detail: "(value) -> None" },
  { label: "reverse", type: "method", detail: "() -> None" },
  { label: "sort", type: "method", detail: "(*, key=None, reverse=False) -> None" },
];

const DICT_METHODS: MethodDef[] = [
  { label: "clear", type: "method", detail: "() -> None" },
  { label: "copy", type: "method", detail: "() -> dict" },
  { label: "fromkeys", type: "method", detail: "(iterable, value=None) -> dict", info: "classmethod" },
  { label: "get", type: "method", detail: "(key, default=None) -> value" },
  { label: "items", type: "method", detail: "() -> dict_items" },
  { label: "keys", type: "method", detail: "() -> dict_keys" },
  { label: "pop", type: "method", detail: "(key, default=...) -> value" },
  { label: "popitem", type: "method", detail: "() -> (key, value)" },
  { label: "setdefault", type: "method", detail: "(key, default=None) -> value" },
  { label: "update", type: "method", detail: "(mapping_or_iterable, **kwargs) -> None" },
  { label: "values", type: "method", detail: "() -> dict_values" },
];

const STR_METHODS: MethodDef[] = [
  { label: "capitalize", type: "method", detail: "() -> str" },
  { label: "casefold", type: "method", detail: "() -> str" },
  { label: "center", type: "method", detail: "(width, fillchar=' ') -> str" },
  { label: "count", type: "method", detail: "(sub, start=0, end=...) -> int" },
  { label: "encode", type: "method", detail: "(encoding='utf-8', errors='strict') -> bytes" },
  { label: "endswith", type: "method", detail: "(suffix, start=0, end=...) -> bool" },
  { label: "expandtabs", type: "method", detail: "(tabsize=8) -> str" },
  { label: "find", type: "method", detail: "(sub, start=0, end=...) -> int" },
  { label: "format", type: "method", detail: "(*args, **kwargs) -> str" },
  { label: "format_map", type: "method", detail: "(mapping) -> str" },
  { label: "index", type: "method", detail: "(sub, start=0, end=...) -> int" },
  { label: "isalnum", type: "method", detail: "() -> bool" },
  { label: "isalpha", type: "method", detail: "() -> bool" },
  { label: "isascii", type: "method", detail: "() -> bool" },
  { label: "isdecimal", type: "method", detail: "() -> bool" },
  { label: "isdigit", type: "method", detail: "() -> bool" },
  { label: "isidentifier", type: "method", detail: "() -> bool" },
  { label: "islower", type: "method", detail: "() -> bool" },
  { label: "isnumeric", type: "method", detail: "() -> bool" },
  { label: "isprintable", type: "method", detail: "() -> bool" },
  { label: "isspace", type: "method", detail: "() -> bool" },
  { label: "istitle", type: "method", detail: "() -> bool" },
  { label: "isupper", type: "method", detail: "() -> bool" },
  { label: "join", type: "method", detail: "(iterable) -> str" },
  { label: "ljust", type: "method", detail: "(width, fillchar=' ') -> str" },
  { label: "lower", type: "method", detail: "() -> str" },
  { label: "lstrip", type: "method", detail: "(chars=None) -> str" },
  { label: "partition", type: "method", detail: "(sep) -> (str, str, str)" },
  { label: "removeprefix", type: "method", detail: "(prefix) -> str" },
  { label: "removesuffix", type: "method", detail: "(suffix) -> str" },
  { label: "replace", type: "method", detail: "(old, new, count=-1) -> str" },
  { label: "rfind", type: "method", detail: "(sub, start=0, end=...) -> int" },
  { label: "rindex", type: "method", detail: "(sub, start=0, end=...) -> int" },
  { label: "rjust", type: "method", detail: "(width, fillchar=' ') -> str" },
  { label: "rpartition", type: "method", detail: "(sep) -> (str, str, str)" },
  { label: "rsplit", type: "method", detail: "(sep=None, maxsplit=-1) -> list[str]" },
  { label: "rstrip", type: "method", detail: "(chars=None) -> str" },
  { label: "split", type: "method", detail: "(sep=None, maxsplit=-1) -> list[str]" },
  { label: "splitlines", type: "method", detail: "(keepends=False) -> list[str]" },
  { label: "startswith", type: "method", detail: "(prefix, start=0, end=...) -> bool" },
  { label: "strip", type: "method", detail: "(chars=None) -> str" },
  { label: "swapcase", type: "method", detail: "() -> str" },
  { label: "title", type: "method", detail: "() -> str" },
  { label: "translate", type: "method", detail: "(table) -> str" },
  { label: "upper", type: "method", detail: "() -> str" },
  { label: "zfill", type: "method", detail: "(width) -> str" },
];

const SET_METHODS: MethodDef[] = [
  { label: "add", type: "method", detail: "(elem) -> None" },
  { label: "clear", type: "method", detail: "() -> None" },
  { label: "copy", type: "method", detail: "() -> set" },
  { label: "difference", type: "method", detail: "(*others) -> set" },
  { label: "difference_update", type: "method", detail: "(*others) -> None" },
  { label: "discard", type: "method", detail: "(elem) -> None" },
  { label: "intersection", type: "method", detail: "(*others) -> set" },
  { label: "intersection_update", type: "method", detail: "(*others) -> None" },
  { label: "isdisjoint", type: "method", detail: "(other) -> bool" },
  { label: "issubset", type: "method", detail: "(other) -> bool" },
  { label: "issuperset", type: "method", detail: "(other) -> bool" },
  { label: "pop", type: "method", detail: "() -> object" },
  { label: "remove", type: "method", detail: "(elem) -> None" },
  { label: "symmetric_difference", type: "method", detail: "(other) -> set" },
  { label: "symmetric_difference_update", type: "method", detail: "(other) -> None" },
  { label: "union", type: "method", detail: "(*others) -> set" },
  { label: "update", type: "method", detail: "(*others) -> None" },
];

const TUPLE_METHODS: MethodDef[] = [
  { label: "count", type: "method", detail: "(value) -> int" },
  { label: "index", type: "method", detail: "(value, start=0, stop=...) -> int" },
];

const INT_METHODS: MethodDef[] = [
  { label: "bit_length", type: "method", detail: "() -> int" },
  { label: "bit_count", type: "method", detail: "() -> int" },
  { label: "to_bytes", type: "method", detail: "(length, byteorder, *, signed=False) -> bytes" },
  { label: "from_bytes", type: "method", detail: "(bytes, byteorder, *, signed=False) -> int", info: "classmethod" },
  { label: "as_integer_ratio", type: "method", detail: "() -> (int, int)" },
  { label: "conjugate", type: "method", detail: "() -> int" },
  { label: "real", type: "property", detail: "-> int" },
  { label: "imag", type: "property", detail: "-> int" },
];

const FLOAT_METHODS: MethodDef[] = [
  { label: "as_integer_ratio", type: "method", detail: "() -> (int, int)" },
  { label: "conjugate", type: "method", detail: "() -> float" },
  { label: "hex", type: "method", detail: "() -> str" },
  { label: "is_integer", type: "method", detail: "() -> bool" },
  { label: "fromhex", type: "method", detail: "(string) -> float", info: "classmethod" },
  { label: "real", type: "property", detail: "-> float" },
  { label: "imag", type: "property", detail: "-> float" },
];

const PYTHON_KEYWORDS: MethodDef[] = [
  { label: "False", type: "keyword", detail: "bool" },
  { label: "True", type: "keyword", detail: "bool" },
  { label: "None", type: "keyword", detail: "NoneType" },
  { label: "and", type: "keyword", detail: "keyword" },
  { label: "as", type: "keyword", detail: "keyword" },
  { label: "assert", type: "keyword", detail: "keyword" },
  { label: "async", type: "keyword", detail: "keyword" },
  { label: "await", type: "keyword", detail: "keyword" },
  { label: "break", type: "keyword", detail: "keyword" },
  { label: "class", type: "keyword", detail: "keyword" },
  { label: "continue", type: "keyword", detail: "keyword" },
  { label: "def", type: "keyword", detail: "keyword" },
  { label: "del", type: "keyword", detail: "keyword" },
  { label: "elif", type: "keyword", detail: "keyword" },
  { label: "else", type: "keyword", detail: "keyword" },
  { label: "except", type: "keyword", detail: "keyword" },
  { label: "finally", type: "keyword", detail: "keyword" },
  { label: "for", type: "keyword", detail: "keyword" },
  { label: "from", type: "keyword", detail: "keyword" },
  { label: "global", type: "keyword", detail: "keyword" },
  { label: "if", type: "keyword", detail: "keyword" },
  { label: "import", type: "keyword", detail: "keyword" },
  { label: "in", type: "keyword", detail: "keyword" },
  { label: "is", type: "keyword", detail: "keyword" },
  { label: "lambda", type: "keyword", detail: "keyword" },
  { label: "not", type: "keyword", detail: "keyword" },
  { label: "or", type: "keyword", detail: "keyword" },
  { label: "pass", type: "keyword", detail: "keyword" },
  { label: "raise", type: "keyword", detail: "keyword" },
  { label: "return", type: "keyword", detail: "keyword" },
  { label: "try", type: "keyword", detail: "keyword" },
  { label: "while", type: "keyword", detail: "keyword" },
  { label: "with", type: "keyword", detail: "keyword" },
  { label: "yield", type: "keyword", detail: "keyword" },
];

const PYTHON_BUILTINS: MethodDef[] = [
  { label: "print", type: "function", detail: "(*args, sep=' ', end='\\n', ...) -> None" },
  { label: "len", type: "function", detail: "(obj) -> int" },
  { label: "range", type: "function", detail: "(stop) / (start, stop, step) -> range" },
  { label: "type", type: "function", detail: "(object) -> type" },
  { label: "int", type: "function", detail: "(x=0) -> int" },
  { label: "float", type: "function", detail: "(x=0) -> float" },
  { label: "str", type: "function", detail: "(object='') -> str" },
  { label: "bool", type: "function", detail: "(x=False) -> bool" },
  { label: "list", type: "function", detail: "(iterable=()) -> list" },
  { label: "dict", type: "function", detail: "(**kwargs) -> dict" },
  { label: "set", type: "function", detail: "(iterable=()) -> set" },
  { label: "tuple", type: "function", detail: "(iterable=()) -> tuple" },
  { label: "abs", type: "function", detail: "(x) -> number" },
  { label: "all", type: "function", detail: "(iterable) -> bool" },
  { label: "any", type: "function", detail: "(iterable) -> bool" },
  { label: "bin", type: "function", detail: "(x) -> str" },
  { label: "callable", type: "function", detail: "(object) -> bool" },
  { label: "chr", type: "function", detail: "(i) -> str" },
  { label: "dir", type: "function", detail: "(object=...) -> list[str]" },
  { label: "divmod", type: "function", detail: "(a, b) -> (int, int)" },
  { label: "enumerate", type: "function", detail: "(iterable, start=0) -> enumerate" },
  { label: "eval", type: "function", detail: "(expression, ...) -> object" },
  { label: "filter", type: "function", detail: "(function, iterable) -> filter" },
  { label: "format", type: "function", detail: "(value, format_spec='') -> str" },
  { label: "frozenset", type: "function", detail: "(iterable=()) -> frozenset" },
  { label: "getattr", type: "function", detail: "(object, name, default=...) -> object" },
  { label: "globals", type: "function", detail: "() -> dict" },
  { label: "hasattr", type: "function", detail: "(object, name) -> bool" },
  { label: "hash", type: "function", detail: "(object) -> int" },
  { label: "hex", type: "function", detail: "(x) -> str" },
  { label: "id", type: "function", detail: "(object) -> int" },
  { label: "input", type: "function", detail: "(prompt='') -> str" },
  { label: "isinstance", type: "function", detail: "(object, classinfo) -> bool" },
  { label: "issubclass", type: "function", detail: "(cls, classinfo) -> bool" },
  { label: "iter", type: "function", detail: "(object) -> iterator" },
  { label: "locals", type: "function", detail: "() -> dict" },
  { label: "map", type: "function", detail: "(function, iterable, ...) -> map" },
  { label: "max", type: "function", detail: "(iterable, *, key=None, default=...) -> object" },
  { label: "min", type: "function", detail: "(iterable, *, key=None, default=...) -> object" },
  { label: "next", type: "function", detail: "(iterator, default=...) -> object" },
  { label: "oct", type: "function", detail: "(x) -> str" },
  { label: "open", type: "function", detail: "(file, mode='r', ...) -> IO" },
  { label: "ord", type: "function", detail: "(c) -> int" },
  { label: "pow", type: "function", detail: "(base, exp, mod=None) -> number" },
  { label: "repr", type: "function", detail: "(object) -> str" },
  { label: "reversed", type: "function", detail: "(seq) -> reversed" },
  { label: "round", type: "function", detail: "(number, ndigits=None) -> number" },
  { label: "sorted", type: "function", detail: "(iterable, *, key=None, reverse=False) -> list" },
  { label: "sum", type: "function", detail: "(iterable, start=0) -> number" },
  { label: "super", type: "function", detail: "() -> super" },
  { label: "vars", type: "function", detail: "(object=...) -> dict" },
  { label: "zip", type: "function", detail: "(*iterables) -> zip" },
  { label: "Exception", type: "class", detail: "class" },
  { label: "ValueError", type: "class", detail: "class" },
  { label: "TypeError", type: "class", detail: "class" },
  { label: "KeyError", type: "class", detail: "class" },
  { label: "IndexError", type: "class", detail: "class" },
  { label: "AttributeError", type: "class", detail: "class" },
  { label: "RuntimeError", type: "class", detail: "class" },
  { label: "StopIteration", type: "class", detail: "class" },
  { label: "NotImplementedError", type: "class", detail: "class" },
];

function toCompletions(defs: MethodDef[]): Completion[] {
  return defs.map((d) => ({
    label: d.label,
    type: d.type,
    detail: d.detail,
    info: d.info,
    boost: d.type === "method" ? 1 : d.type === "property" ? 0.5 : 0,
  }));
}

type TypeName = string;

const METHOD_MAP: Record<TypeName, Completion[]> = {
  LazyFrame: toCompletions(LAZY_FRAME_METHODS),
  TypedLazyFrame: toCompletions(LAZY_FRAME_METHODS),
  LazyGroupBy: toCompletions(LAZY_GROUP_BY_METHODS),
  Stream: toCompletions(STREAM_METHODS),
  Expr: toCompletions(EXPR_METHODS),
  Col: toCompletions(EXPR_METHODS),
  Lit: toCompletions(EXPR_METHODS),
  AggExpr: toCompletions(AGG_EXPR_METHODS),
  WindowExpr: toCompletions(WINDOW_EXPR_METHODS),
  WhenExpr: toCompletions(WHEN_EXPR_METHODS),
  CumExpr: toCompletions(AGG_EXPR_METHODS),
  OffsetExpr: toCompletions(AGG_EXPR_METHODS),
  RankExpr: toCompletions(AGG_EXPR_METHODS),
  LazySchema: toCompletions(LAZY_SCHEMA_METHODS),
  ColumnSchema: toCompletions(COLUMN_SCHEMA_METHODS),
  Agg: toCompletions(AGG_CONSTANTS),
  Join: toCompletions(JOIN_CONSTANTS),
  DateTrunc: toCompletions(DATE_TRUNC_CONSTANTS),
  Optimizer: toCompletions(OPTIMIZER_METHODS),
  StringAccessor: toCompletions(STRING_ACCESSOR_METHODS),
  DateTimeAccessor: toCompletions(DATETIME_ACCESSOR_METHODS),
  list: toCompletions(LIST_METHODS),
  dict: toCompletions(DICT_METHODS),
  str: toCompletions(STR_METHODS),
  set: toCompletions(SET_METHODS),
  tuple: toCompletions(TUPLE_METHODS),
  int: toCompletions(INT_METHODS),
  float: toCompletions(FLOAT_METHODS),
};

let pyodideInstance: any = null;
let inferFnInstalled = false;

export function setCompletionPyodide(instance: any) {
  pyodideInstance = instance;
  if (!inferFnInstalled) {
    inferFnInstalled = true;
    pyodideInstance.runPython(`
import sys, io, json

def _cm_exec_ns(code):
    _old_stdout, _old_stderr = sys.stdout, sys.stderr
    sys.stdout = io.StringIO()
    sys.stderr = io.StringIO()
    ns = {}
    try:
        exec(compile(code, "<editor>", "exec"), ns)
    except Exception:
        pass
    finally:
        sys.stdout = _old_stdout
        sys.stderr = _old_stderr
    return ns

def _cm_infer_type(code, expr):
    ns = _cm_exec_ns(code)
    try:
        obj = eval(expr, ns)
        return type(obj).__name__
    except Exception:
        return ""

def _cm_dir_completions(code, expr):
    ns = _cm_exec_ns(code)
    try:
        obj = eval(expr, ns)
        items = []
        for name in dir(obj):
            if name.startswith('_'):
                continue
            try:
                attr = getattr(obj, name)
                if callable(attr):
                    items.append({"label": name, "type": "method"})
                else:
                    items.append({"label": name, "type": "property"})
            except Exception:
                items.append({"label": name, "type": "variable"})
        return json.dumps(items)
    except Exception:
        return "[]"

def _cm_list_names(code):
    ns = _cm_exec_ns(code)
    names = []
    for name in ns:
        if name.startswith('_'):
            continue
        try:
            obj = ns[name]
            if callable(obj) and isinstance(obj, type):
                names.append({"label": name, "type": "class"})
            elif callable(obj):
                names.append({"label": name, "type": "function"})
            else:
                names.append({"label": name, "type": "variable"})
        except Exception:
            names.append({"label": name, "type": "variable"})
    return json.dumps(names)
`);
  }
}

function pyodideInferType(fullCode: string, expr: string): TypeName | null {
  if (!pyodideInstance || !inferFnInstalled) return null;
  try {
    const result: string = pyodideInstance.runPython(
      `_cm_infer_type(${JSON.stringify(fullCode)}, ${JSON.stringify(expr)})`
    );
    if (result) return result;
    return null;
  } catch {
    return null;
  }
}

function pyodideDirCompletions(fullCode: string, expr: string): Completion[] | null {
  if (!pyodideInstance || !inferFnInstalled) return null;
  try {
    const resultJson: string = pyodideInstance.runPython(
      `_cm_dir_completions(${JSON.stringify(fullCode)}, ${JSON.stringify(expr)})`
    );
    const items: { label: string; type: string }[] = JSON.parse(resultJson);
    if (items.length === 0) return null;
    return items.map((item) => ({
      label: item.label,
      type: item.type,
      boost: item.type === "method" ? 1 : item.type === "property" ? 0.5 : 0,
    }));
  } catch {
    return null;
  }
}

function pyodideListNames(fullCode: string): Completion[] {
  if (!pyodideInstance || !inferFnInstalled) return [];
  try {
    const resultJson: string = pyodideInstance.runPython(
      `_cm_list_names(${JSON.stringify(fullCode)})`
    );
    const items: { label: string; type: string }[] = JSON.parse(resultJson);
    return items.map((item) => ({
      label: item.label,
      type: item.type,
      boost: 2,
    }));
  } catch {
    return [];
  }
}

function getCodeBeforeCursorLine(fullText: string, cursorLine: number): string {
  const lines = fullText.split("\n");
  return lines.slice(0, cursorLine - 1).join("\n");
}

function getExprBeforeDot(textBefore: string): string | null {
  const varMatch = textBefore.match(/(\w+)\s*$/);
  if (varMatch) return varMatch[1];

  let depth = 0;
  let i = textBefore.length - 1;
  for (; i >= 0; i--) {
    const ch = textBefore[i];
    if (ch === ")" || ch === "]" || ch === "}") depth++;
    else if (ch === "(" || ch === "[" || ch === "{") {
      depth--;
      if (depth < 0) { i++; break; }
    } else if (depth === 0) {
      if (/[=;]/.test(ch) && textBefore[i - 1] !== "!" && textBefore[i - 1] !== "=" && textBefore[i - 1] !== "<" && textBefore[i - 1] !== ">") {
        i++;
        break;
      }
    }
  }
  if (i < 0) i = 0;
  const expr = textBefore.slice(i).trim();
  return expr || null;
}

export function pyfloeCompletion(context: CompletionContext): CompletionResult | null {
  const pos = context.pos;
  const line = context.state.doc.lineAt(pos);
  const textBefore = line.text.slice(0, pos - line.from);

  const fromImportRe = /from\s+pyfloe\s+import\s+(\w*)$/;
  const fromImportMatch = textBefore.match(fromImportRe);
  if (fromImportMatch) {
    const prefix = fromImportMatch[1];
    return {
      from: pos - prefix.length,
      options: toCompletions(PYFLOE_TOP_LEVEL),
      validFor: /^\w*$/,
    };
  }

  const moduleAccessRe = /(?:pf|pyfloe)\.(\w*)$/;
  const moduleMatch = textBefore.match(moduleAccessRe);
  if (moduleMatch) {
    const prefix = moduleMatch[1];
    return {
      from: pos - prefix.length,
      options: toCompletions(PYFLOE_TOP_LEVEL),
      validFor: /^\w*$/,
    };
  }

  const dotAccessRe = /\.(\w*)$/;
  const dotMatch = textBefore.match(dotAccessRe);
  if (dotMatch) {
    const prefix = dotMatch[1];
    const dotPos = textBefore.length - dotMatch[0].length;
    const beforeDot = textBefore.slice(0, dotPos);

    let typeName: TypeName | null = null;

    if (pyodideInstance && inferFnInstalled) {
      const codeBefore = getCodeBeforeCursorLine(
        context.state.doc.toString(),
        line.number
      );
      const exprStr = getExprBeforeDot(beforeDot);
      if (exprStr) {
        typeName = pyodideInferType(codeBefore, exprStr);
      }
    }

    if (typeName && METHOD_MAP[typeName]) {
      return {
        from: pos - prefix.length,
        options: METHOD_MAP[typeName],
        validFor: /^\w*$/,
      };
    }

    if (pyodideInstance && inferFnInstalled) {
      const codeBefore = getCodeBeforeCursorLine(
        context.state.doc.toString(),
        line.number
      );
      const exprStr = getExprBeforeDot(beforeDot);
      if (exprStr) {
        const dirOptions = pyodideDirCompletions(codeBefore, exprStr);
        if (dirOptions) {
          return {
            from: pos - prefix.length,
            options: dirOptions,
            validFor: /^\w*$/,
          };
        }
      }
    }

    if (!typeName && !(pyodideInstance && inferFnInstalled)) {
      return {
        from: pos - prefix.length,
        options: [
          ...toCompletions(LAZY_FRAME_METHODS),
          ...toCompletions(EXPR_METHODS),
        ],
        validFor: /^\w*$/,
      };
    }
  }

  const wordMatch = textBefore.match(/(\w+)$/);
  if (wordMatch && !textBefore.match(/\.\w*$/)) {
    const prefix = wordMatch[1];
    if (prefix.length < 2) return null;

    const options: Completion[] = [
      ...toCompletions(PYTHON_KEYWORDS).map((c) => ({ ...c, boost: -2 })),
      ...toCompletions(PYTHON_BUILTINS).map((c) => ({ ...c, boost: -1 })),
    ];

    const fullText = context.state.doc.toString();
    const codeBefore = getCodeBeforeCursorLine(fullText, line.number);

    const userVars = pyodideListNames(codeBefore);
    options.push(...userVars);

    const hasPyfloeImport = /(?:import\s+pyfloe|from\s+pyfloe\s+import|import\s+pyfloe\s+as)/.test(fullText);
    if (hasPyfloeImport) {
      options.push(...toCompletions(PYFLOE_TOP_LEVEL).map((c) => ({ ...c, boost: 1 })));
    }

    return {
      from: pos - prefix.length,
      options,
      validFor: /^\w*$/,
    };
  }

  return null;
}
