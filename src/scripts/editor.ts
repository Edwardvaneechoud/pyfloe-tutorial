import { EditorView, keymap, placeholder, tooltips } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  acceptCompletion,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from "@codemirror/commands";
import {
  indentOnInput,
  bracketMatching,
  syntaxHighlighting,
  HighlightStyle,
} from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { tags } from "@lezer/highlight";
import { pyfloeCompletion } from "./pyfloe-completions";
import { lintPython } from "./python-linter";

const catppuccinMocha = HighlightStyle.define([
  { tag: tags.keyword, color: "#CBA6F7" },
  { tag: tags.operator, color: "#89DCEB" },
  { tag: tags.special(tags.string), color: "#A6E3A1" },
  { tag: tags.string, color: "#A6E3A1" },
  { tag: tags.comment, color: "#6C7086", fontStyle: "italic" },
  { tag: tags.number, color: "#FAB387" },
  { tag: tags.bool, color: "#FAB387" },
  { tag: tags.null, color: "#FAB387" },
  { tag: tags.className, color: "#F9E2AF" },
  { tag: tags.definition(tags.variableName), color: "#89B4FA" },
  { tag: tags.function(tags.variableName), color: "#89B4FA" },
  { tag: tags.variableName, color: "#CDD6F4" },
  { tag: tags.definition(tags.function(tags.variableName)), color: "#89B4FA" },
  { tag: tags.propertyName, color: "#89B4FA" },
  { tag: tags.typeName, color: "#F9E2AF" },
  { tag: tags.self, color: "#F38BA8" },
  { tag: tags.paren, color: "#BAC2DE" },
  { tag: tags.squareBracket, color: "#BAC2DE" },
  { tag: tags.brace, color: "#BAC2DE" },
  { tag: tags.separator, color: "#A6ADC8" },
  { tag: tags.punctuation, color: "#A6ADC8" },
  { tag: tags.meta, color: "#F9E2AF" },
  { tag: tags.controlKeyword, color: "#CBA6F7" },
  { tag: tags.moduleKeyword, color: "#CBA6F7" },
  { tag: tags.operatorKeyword, color: "#CBA6F7" },
  { tag: tags.atom, color: "#FAB387" },
]);

const catppuccinTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1E1E2E",
      color: "#CDD6F4",
      fontSize: "14px",
      fontFamily: "var(--mono)",
    },
    ".cm-content": {
      caretColor: "#CDD6F4",
      padding: "16px 4px",
      lineHeight: "1.6",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#CDD6F4",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "#45475A",
      },
    ".cm-activeLine": {
      backgroundColor: "rgba(69, 71, 90, 0.3)",
    },
    ".cm-gutters": {
      backgroundColor: "#181825",
      color: "#585B70",
      border: "none",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(69, 71, 90, 0.3)",
      color: "#A6ADC8",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 12px",
      minWidth: "32px",
    },
    ".cm-matchingBracket": {
      backgroundColor: "rgba(137, 180, 250, 0.2)",
      outline: "1px solid rgba(137, 180, 250, 0.4)",
    },
    ".cm-tooltip": {
      backgroundColor: "#1E1E2E",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "6px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    },
    ".cm-tooltip.cm-tooltip-autocomplete": {
      "& > ul": {
        fontFamily: "var(--mono)",
        fontSize: "13px",
        maxHeight: "200px",
      },
      "& > ul > li": {
        padding: "4px 10px",
        color: "#CDD6F4",
      },
      "& > ul > li[aria-selected]": {
        backgroundColor: "#45475A",
        color: "#CDD6F4",
      },
    },
    ".cm-tooltip .cm-completionLabel": {
      color: "#CDD6F4",
    },
    ".cm-tooltip .cm-completionDetail": {
      color: "#6C7086",
      fontStyle: "italic",
      marginLeft: "8px",
    },
    ".cm-tooltip .cm-completionMatchedText": {
      textDecoration: "none",
      color: "#89B4FA",
      fontWeight: "600",
    },
    ".cm-completionIcon": {
      width: "1.2em",
      opacity: "0.7",
    },
    ".cm-completionIcon-function::after, .cm-completionIcon-method::after": {
      content: "'f'",
      color: "#89B4FA",
    },
    ".cm-completionIcon-class::after": {
      content: "'C'",
      color: "#F9E2AF",
    },
    ".cm-completionIcon-property::after": {
      content: "'p'",
      color: "#A6E3A1",
    },
    ".cm-completionIcon-variable::after": {
      content: "'v'",
      color: "#CBA6F7",
    },
    ".cm-scroller": {
      overflow: "auto",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-diagnostic-error": {
      borderLeft: "3px solid #F38BA8",
      paddingLeft: "8px",
      color: "#F38BA8",
      fontFamily: "var(--sans)",
      fontSize: "12px",
    },
    ".cm-diagnostic-warning": {
      borderLeft: "3px solid #F9E2AF",
      paddingLeft: "8px",
      color: "#F9E2AF",
      fontFamily: "var(--sans)",
      fontSize: "12px",
    },
    ".cm-lintRange-error": {
      backgroundImage: "none",
      textDecoration: "underline wavy #F38BA8",
      textUnderlineOffset: "3px",
    },
    ".cm-lintRange-warning": {
      backgroundImage: "none",
      textDecoration: "underline wavy #F9E2AF",
      textUnderlineOffset: "3px",
    },
    ".cm-tooltip-lint": {
      backgroundColor: "#1E1E2E",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "6px",
    },
  },
  { dark: true }
);

const pythonLinter = linter(lintPython, { delay: 500 });

export interface RunnerEditor {
  view: EditorView;
  getValue: () => string;
  setValue: (code: string) => void;
}

export function createEditor(
  parent: HTMLElement,
  initialCode: string,
  onRun: () => void
): RunnerEditor {
  const runKeymap = keymap.of([
    {
      key: "Mod-Enter",
      run: () => {
        onRun();
        return true;
      },
    },
    {
      key: "Tab",
      run: acceptCompletion,
    },
  ]);

  const state = EditorState.create({
    doc: initialCode,
    extensions: [
      catppuccinTheme,
      syntaxHighlighting(catppuccinMocha),
      python(),
      autocompletion({
        override: [pyfloeCompletion],
        activateOnTyping: true,
        maxRenderedOptions: 30,
      }),
      pythonLinter,
      closeBrackets(),
      bracketMatching(),
      indentOnInput(),
      history(),
      runKeymap,
      keymap.of([...closeBracketsKeymap, ...historyKeymap, indentWithTab, ...defaultKeymap]),
      placeholder("# Write your Python code here..."),
      EditorView.lineWrapping,
      tooltips({ parent: document.body }),
    ],
  });

  const view = new EditorView({ state, parent });

  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue: (code: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      });
    },
  };
}
