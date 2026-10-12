import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const scriptPath = path.resolve(
  "src/wagtail_show_hidden_characters/static/wagtail_show_hidden_characters/js/draftail-show-hidden-characters.js",
);
const script = fs.readFileSync(scriptPath, "utf8");

const createReactStub = () => ({
  createElement(type, props, ...children) {
    return { type, props: props || {}, children };
  },
  useEffect(effect) {
    effect();
  },
  useState(initialValue) {
    return [
      typeof initialValue === "function" ? initialValue() : initialValue,
      vi.fn(),
    ];
  },
});

const loadScript = () => {
  const registeredPlugins = [];

  window.React = createReactStub();
  window.draftail = {
    registerPlugin(plugin, category) {
      registeredPlugins.push({ plugin, category });
    },
  };

  window.eval(script);

  return registeredPlugins;
};

beforeEach(() => {
  document.body.innerHTML = "";
  document.body.className = "";
  window.localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete window.React;
  delete window.DraftJS;
  delete window.draftail;
  delete window.showHiddenCharactersDraftailPlugins;
});

describe("Draftail plugin registration", () => {
  it("registers the decorator, toggle, and insert controls once", () => {
    const firstLoad = loadScript();
    const secondLoad = loadScript();

    expect(firstLoad.map(({ category, plugin }) => [category, plugin.type])).toEqual([
      ["decorators", "show-hidden-characters"],
      ["controls", "show-hidden-characters-toggle"],
      ["controls", "insert-non-breaking-space"],
      ["controls", "insert-soft-hyphen"],
    ]);
    expect(secondLoad).toEqual([]);
  });

  it("marks spaces, non-breaking spaces, soft hyphens, and line breaks", () => {
    const registeredPlugins = loadScript();
    const decorator = registeredPlugins.find(
      ({ plugin }) => plugin.type === "show-hidden-characters",
    ).plugin;
    const ranges = [];

    decorator.strategy(
      {
        getText: () => "a b\u00a0c\u00add\n",
      },
      (start, end) => ranges.push([start, end]),
    );

    expect(ranges).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ]);
  });
});

describe("toggle control", () => {
  it("persists state, updates the body class, and emits a change event", () => {
    const registeredPlugins = loadScript();
    const toggle = registeredPlugins.find(
      ({ plugin }) => plugin.type === "show-hidden-characters-toggle",
    ).plugin;
    const listener = vi.fn();

    window.addEventListener("show-hidden-characters:change", listener);
    const control = toggle.inline();
    const event = { preventDefault: vi.fn() };

    control.props.onMouseDown(event);

    expect(control.type).toBe("button");
    expect(control.props.name).toBe("show-hidden-characters-toggle");
    expect(control.props["aria-pressed"]).toBe("false");
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem("wagtail.showHiddenCharacters")).toBe(
      "true",
    );
    expect(document.body.classList).toContain("show-hidden-characters-enabled");
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { enabled: true } }),
    );
  });
});

describe("insert controls", () => {
  it("inserts a non-breaking space through DraftJS", () => {
    const content = { getSelectionAfter: () => "selection-after" };
    const replaceText = vi.fn(() => content);
    const push = vi.fn(() => "next-state");
    const forceSelection = vi.fn(() => "selected-state");
    const onChange = vi.fn();

    window.DraftJS = {
      EditorState: { forceSelection, push },
      Modifier: { replaceText },
    };
    const registeredPlugins = loadScript();
    const insert = registeredPlugins.find(
      ({ plugin }) => plugin.type === "insert-non-breaking-space",
    ).plugin;
    const control = insert.inline({
      getEditorState: () => ({
        getCurrentContent: () => "current-content",
        getCurrentInlineStyle: () => "current-style",
        getSelection: () => "selection",
      }),
      onChange,
    });
    const event = { preventDefault: vi.fn() };

    control.props.onMouseDown(event);

    expect(control.type).toBe("button");
    expect(control.props["aria-label"]).toContain("Insert non-breaking space");
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(replaceText).toHaveBeenCalledWith(
      "current-content",
      "selection",
      "\u00a0",
      "current-style",
    );
    expect(push).toHaveBeenCalledWith(
      expect.anything(),
      content,
      "insert-characters",
    );
    expect(forceSelection).toHaveBeenCalledWith("next-state", "selection-after");
    expect(onChange).toHaveBeenCalledWith("selected-state");
  });
});
