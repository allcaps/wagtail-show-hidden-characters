import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const scriptPath = path.resolve(
  "src/wagtail_show_hidden_characters/static/wagtail_show_hidden_characters/js/draftail-show-hidden-characters.js",
);
const script = fs.readFileSync(scriptPath, "utf8");

beforeEach(() => {
  document.body.innerHTML = "";
  document.body.className = "";
  window.localStorage.clear();
  window.React = {
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
  };
  window.draftail = {
    registerPlugin: vi.fn(),
  };
});

describe("toggle shortcut", () => {
  it("toggles state with Ctrl+Alt+I", () => {
    window.eval(script);

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        altKey: true,
        bubbles: true,
        code: "KeyI",
        ctrlKey: true,
        key: "i",
      }),
    );

    expect(window.localStorage.getItem("wagtail.showHiddenCharacters")).toBe(
      "true",
    );
    expect(document.body.classList).toContain("show-hidden-characters-enabled");
  });
});
