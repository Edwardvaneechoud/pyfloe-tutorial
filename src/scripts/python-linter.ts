import { type Diagnostic } from "@codemirror/lint";
import { type EditorView } from "@codemirror/view";

type PyodideInstance = any;

let pyodide: PyodideInstance | null = null;
let lintFnInstalled = false;

export function setPyodide(instance: PyodideInstance) {
  pyodide = instance;

  if (!lintFnInstalled) {
    lintFnInstalled = true;
    pyodide.runPython(`
def _cm_lint(code):
    import ast, json, builtins
    errors = []
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        errors.append({
            "line": e.lineno or 1,
            "col": e.offset or 0,
            "endCol": (e.end_offset or (e.offset or 0)) if hasattr(e, 'end_offset') else (e.offset or 0),
            "endLine": (e.end_lineno or (e.lineno or 1)) if hasattr(e, 'end_lineno') else (e.lineno or 1),
            "message": str(e.msg) if hasattr(e, 'msg') else str(e),
            "severity": "error"
        })
        return json.dumps(errors)

    always_defined = set(dir(builtins))
    always_defined |= {'__name__', '__file__', '__doc__', '__builtins__', '__spec__', '__loader__', '__package__'}
    # name -> earliest line where it's defined
    defined_at = {}
    imported_star = False

    def _mark(name, lineno):
        if name not in defined_at or lineno < defined_at[name]:
            defined_at[name] = lineno

    def _collect_targets(node, lineno):
        if isinstance(node, ast.Name):
            _mark(node.id, lineno)
        elif isinstance(node, (ast.Tuple, ast.List)):
            for elt in node.elts:
                _collect_targets(elt, lineno)
        elif isinstance(node, ast.Starred):
            _collect_targets(node.value, lineno)

    class NameCollector(ast.NodeVisitor):
        def visit_Import(self, node):
            for alias in node.names:
                _mark(alias.asname or alias.name.split('.')[0], node.lineno)
            self.generic_visit(node)

        def visit_ImportFrom(self, node):
            nonlocal imported_star
            for alias in node.names:
                if alias.name == '*':
                    imported_star = True
                else:
                    _mark(alias.asname or alias.name, node.lineno)
            self.generic_visit(node)

        def visit_FunctionDef(self, node):
            _mark(node.name, node.lineno)
            for decorator in node.decorator_list:
                self.visit(decorator)

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_ClassDef(self, node):
            _mark(node.name, node.lineno)
            for decorator in node.decorator_list:
                self.visit(decorator)

        def visit_Assign(self, node):
            for target in node.targets:
                _collect_targets(target, node.lineno)
            self.generic_visit(node)

        def visit_AnnAssign(self, node):
            if node.target:
                _collect_targets(node.target, node.lineno)
            self.generic_visit(node)

        def visit_AugAssign(self, node):
            _collect_targets(node.target, node.lineno)
            self.generic_visit(node)

        def visit_For(self, node):
            _collect_targets(node.target, node.lineno)
            self.generic_visit(node)

        def visit_AsyncFor(self, node):
            _collect_targets(node.target, node.lineno)
            self.generic_visit(node)

        def visit_With(self, node):
            for item in node.items:
                if item.optional_vars:
                    _collect_targets(item.optional_vars, node.lineno)
            self.generic_visit(node)

        def visit_AsyncWith(self, node):
            for item in node.items:
                if item.optional_vars:
                    _collect_targets(item.optional_vars, node.lineno)
            self.generic_visit(node)

        def visit_NamedExpr(self, node):
            _collect_targets(node.target, node.lineno)
            self.generic_visit(node)

        def visit_ExceptHandler(self, node):
            if node.name:
                _mark(node.name, node.lineno)
            self.generic_visit(node)

        def visit_comprehension(self, node):
            _collect_targets(node.target, node.lineno)
            self.generic_visit(node)

        def visit_Global(self, node):
            for name in node.names:
                _mark(name, node.lineno)

        def visit_Nonlocal(self, node):
            for name in node.names:
                _mark(name, node.lineno)

    NameCollector().visit(tree)

    if imported_star:
        return json.dumps(errors)

    def _is_defined(name, use_line):
        if name in always_defined:
            return True
        dl = defined_at.get(name)
        return dl is not None and dl <= use_line

    class NameChecker(ast.NodeVisitor):
        def visit_Name(self, node):
            if isinstance(node.ctx, ast.Load) and not _is_defined(node.id, node.lineno):
                end_col = node.col_offset + len(node.id)
                errors.append({
                    "line": node.lineno,
                    "col": node.col_offset,
                    "endLine": node.lineno,
                    "endCol": end_col,
                    "message": f"Undefined name '{node.id}'",
                    "severity": "error"
                })
            self.generic_visit(node)

        def visit_FunctionDef(self, node):
            for decorator in node.decorator_list:
                self.visit(decorator)

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_ClassDef(self, node):
            for decorator in node.decorator_list:
                self.visit(decorator)

    NameChecker().visit(tree)
    return json.dumps(errors)
`);
  }
}

interface LintResult {
  line: number;
  col: number;
  endLine: number;
  endCol: number;
  message: string;
  severity: "error" | "warning";
}

export function lintPython(view: EditorView): Diagnostic[] {
  if (!pyodide || !lintFnInstalled) return [];

  const code = view.state.doc.toString();
  if (!code.trim()) return [];

  try {
    const resultJson = pyodide.runPython(
      `_cm_lint(${JSON.stringify(code)})`
    );
    const results: LintResult[] = JSON.parse(resultJson);
    const diagnostics: Diagnostic[] = [];

    for (const r of results) {
      const fromLine = view.state.doc.line(Math.min(r.line, view.state.doc.lines));
      const toLine = view.state.doc.line(Math.min(r.endLine, view.state.doc.lines));
      const from = fromLine.from + Math.min(r.col, fromLine.length);
      const to = toLine.from + Math.min(r.endCol, toLine.length);

      diagnostics.push({
        from: Math.max(0, from),
        to: Math.max(from, to),
        severity: r.severity,
        message: r.message,
      });
    }

    return diagnostics;
  } catch {
    return [];
  }
}
