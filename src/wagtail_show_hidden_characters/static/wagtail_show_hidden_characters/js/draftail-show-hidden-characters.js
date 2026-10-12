(function () {
  const React = window.React;
  const draftail = window.draftail;

  if (!React || !draftail) {
    return;
  }

  const STORAGE_KEY = "wagtail.showHiddenCharacters";
  const BODY_CLASS = "show-hidden-characters-enabled";
  const STATE_CHANGE_EVENT = "show-hidden-characters:change";
  const HIDDEN_CHARACTER_PATTERN = /[ \u00a0\u00ad\n]/g;
  const PLATFORM = `${window.navigator.platform} ${window.navigator.userAgent}`;
  const CURRENT_PLATFORM = /Mac|iPhone|iPad|iPod/.test(PLATFORM)
    ? "mac"
    : /Win/.test(PLATFORM)
      ? "windows"
      : /Linux|X11/.test(PLATFORM)
        ? "linux"
        : null;
  const registeredPlugins =
    (window.showHiddenCharactersDraftailPlugins =
      window.showHiddenCharactersDraftailPlugins || {});
  const TOGGLE_SHORTCUTS = {
    mac: "^ + \u2325 + I",
    windows: "Ctrl + Alt + I",
    linux: "Ctrl + Alt + I",
  };

  const MARKERS = {
    " ": { label: "Space", marker: "\u00b7", type: "space" },
    "\u00a0": { label: "Non-breaking space", marker: "\u00b0", type: "nbsp" },
    "\u00ad": { label: "Soft hyphen", marker: "\u00ac", type: "soft-hyphen" },
    "\n": { label: "Line break", marker: "\u21b5", type: "line-break" },
  };

  const isEnabled = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch (error) {
      return document.body.classList.contains(BODY_CLASS);
    }
  };

  const setEnabled = (enabled) => {
    if (document.body) {
      document.body.classList.toggle(BODY_CLASS, enabled);
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    } catch (error) {
      // Ignore storage errors; the current page state still updates.
    }

    window.dispatchEvent(
      new CustomEvent(STATE_CHANGE_EVENT, { detail: { enabled } }),
    );
    updateDocumentEndMarkers();
  };

  const getShortcutTitle = (label, shortcuts) => {
    const shortcut = CURRENT_PLATFORM ? shortcuts[CURRENT_PLATFORM] : null;

    return shortcut ? `${label}\n${shortcut}` : label;
  };

  const isShowHiddenCharactersShortcut = (event) =>
    event.ctrlKey &&
    event.altKey &&
    !event.shiftKey &&
    !event.metaKey &&
    !event.repeat &&
    (event.code === "KeyI" || event.key.toLowerCase() === "i");

  setEnabled(isEnabled());

  if (!document.body) {
    document.addEventListener("DOMContentLoaded", () => {
      setEnabled(isEnabled());
    });
  }

  const hiddenCharacterStrategy = (block, callback) => {
    const text = block.getText();
    let match;

    HIDDEN_CHARACTER_PATTERN.lastIndex = 0;
    while ((match = HIDDEN_CHARACTER_PATTERN.exec(text)) !== null) {
      callback(match.index, match.index + match[0].length);
    }
  };

  const HiddenCharacter = (props) => {
    const character = props.decoratedText;
    const marker = MARKERS[character] || {
      label: "Hidden character",
      marker: "?",
      type: "unknown",
    };

    return React.createElement(
      "span",
      {
        className: `show-hidden-character show-hidden-character--${marker.type}`,
        "data-hidden-character": marker.marker,
        title: marker.label,
      },
      props.children,
    );
  };

  const Icon = ({ name }) =>
    React.createElement(
      "svg",
      {
        className: `icon icon-${name}`,
        "aria-hidden": "true",
      },
      React.createElement("use", {
        href: `#icon-${name}`,
        xlinkHref: `#icon-${name}`,
      }),
    );

  function updateDocumentEndMarkers() {
    document.querySelectorAll(".Draftail-Editor").forEach((editor) => {
      const blocks = editor.querySelectorAll(".public-DraftStyleDefault-block");

      blocks.forEach((block) => {
        block.classList.remove("show-hidden-character-document-end");
      });

      blocks[blocks.length - 1]?.classList.add(
        "show-hidden-character-document-end",
      );
    });
  }

  const observeEditorChanges = () => {
    document
      .querySelectorAll("[data-draftail-editor-wrapper]")
      .forEach((wrapper) => {
        if (wrapper.dataset.showHiddenCharactersObserved) {
          return;
        }

        wrapper.dataset.showHiddenCharactersObserved = "true";
        new MutationObserver(updateDocumentEndMarkers).observe(wrapper, {
          childList: true,
          subtree: true,
        });
      });
  };

  const ToggleControl = () => {
    const [enabled, updateEnabled] = React.useState(isEnabled);
    const label = enabled ? "Hide hidden characters" : "Show hidden characters";
    const title = getShortcutTitle(label, TOGGLE_SHORTCUTS);
    const icon = enabled ? "no-view" : "view";

    React.useEffect(() => {
      const onChange = (event) => {
        updateEnabled(event.detail.enabled);
      };

      window.addEventListener(STATE_CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener(STATE_CHANGE_EVENT, onChange);
      };
    }, []);

    const onClick = () => {
      setEnabled(!isEnabled());
    };

    return React.createElement(
      "button",
      {
        type: "button",
        name: "show-hidden-characters-toggle",
        className: `Draftail-ToolbarButton show-hidden-characters-toggle${
          enabled ? " Draftail-ToolbarButton--active" : ""
        }`,
        "aria-label": title,
        "aria-pressed": enabled ? "true" : "false",
        "data-draftail-balloon": "up",
        tabIndex: -1,
        onMouseDown: (event) => {
          event.preventDefault();
          onClick();
        },
      },
      React.createElement(Icon, { name: icon }),
    );
  };

  const createInsertControl = (character, label, shortcuts) => {
    const InsertControl = (props) => {
      const DraftJS = window.DraftJS;
      const title = getShortcutTitle(label, shortcuts);

      const insertCharacter = () => {
        if (!DraftJS || !props.getEditorState || !props.onChange) {
          return;
        }

        const editorState = props.getEditorState();
        const content = DraftJS.Modifier.replaceText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          character,
          editorState.getCurrentInlineStyle(),
        );
        const nextState = DraftJS.EditorState.push(
          editorState,
          content,
          "insert-characters",
        );

        props.onChange(
          DraftJS.EditorState.forceSelection(
            nextState,
            content.getSelectionAfter(),
          ),
        );
        window.setTimeout(updateDocumentEndMarkers, 0);
      };

      return React.createElement(
        "button",
        {
          type: "button",
          className: "Draftail-ToolbarButton",
          "aria-label": title,
          "data-draftail-balloon": "up",
          tabIndex: -1,
          onMouseDown: (event) => {
            event.preventDefault();
            insertCharacter();
          },
        },
        React.createElement(
          "span",
          { className: "Draftail-ToolbarButton__label" },
          MARKERS[character].marker,
        ),
      );
    };

    return InsertControl;
  };

  const InsertNonBreakingSpaceControl = createInsertControl(
    "\u00a0",
    "Insert non-breaking space",
    {
      mac: "\u2325 + Space",
      windows: "Alt + 0160",
      linux: "Ctrl + Shift + U, 00A0",
    },
  );
  const InsertSoftHyphenControl = createInsertControl(
    "\u00ad",
    "Insert soft hyphen",
    {
      windows: "Alt + 0173",
      linux: "Ctrl + Shift + U, 00AD",
    },
  );

  if (!registeredPlugins.decorator) {
    draftail.registerPlugin(
      {
        type: "show-hidden-characters",
        strategy: hiddenCharacterStrategy,
        component: HiddenCharacter,
      },
      "decorators",
    );
    registeredPlugins.decorator = true;
  }

  if (!registeredPlugins.toggle) {
    draftail.registerPlugin(
      {
        type: "show-hidden-characters-toggle",
        inline: ToggleControl,
      },
      "controls",
    );
    registeredPlugins.toggle = true;
  }

  if (!registeredPlugins.nonBreakingSpace) {
    draftail.registerPlugin(
      {
        type: "insert-non-breaking-space",
        inline: InsertNonBreakingSpaceControl,
      },
      "controls",
    );
    registeredPlugins.nonBreakingSpace = true;
  }

  if (!registeredPlugins.softHyphen) {
    draftail.registerPlugin(
      {
        type: "insert-soft-hyphen",
        inline: InsertSoftHyphenControl,
      },
      "controls",
    );
    registeredPlugins.softHyphen = true;
  }

  if (!registeredPlugins.shortcut) {
    document.addEventListener("keydown", (event) => {
      if (!isShowHiddenCharactersShortcut(event)) {
        return;
      }

      event.preventDefault();
      setEnabled(!isEnabled());
    });
    registeredPlugins.shortcut = true;
  }

  const init = () => {
    observeEditorChanges();
    updateDocumentEndMarkers();
  };

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("w-draftail:init", init);
  window.setTimeout(init, 0);
})();
