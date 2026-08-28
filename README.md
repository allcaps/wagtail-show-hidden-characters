# Wagtail Show Hidden Characters

Wagtail *Show Hidden Characters* adds Draftail toolbar controls for displaying
invisible characters and structural markers in Wagtail rich text fields.

It helps editors identify regular spaces, non-breaking spaces, soft hyphens,
line breaks, paragraph boundaries, heading levels, and empty trailing
paragraphs.

It provides three independently configurable rich text features:

* `show-hidden-chars`, a button that shows or hides hidden characters and
  structural markers in the editor.
* `insert-non-breaking-space`, a button that inserts a non-breaking space.
* `insert-soft-hyphen`, a button that inserts a soft hyphen.

## Installation

Install the package with pip:

```shell
pip install wagtail-show-hidden-characters
```

Add `wagtail_show_hidden_characters` to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    "wagtail_show_hidden_characters",
]
```

Enable the features on a `RichTextField`:

```python
from wagtail.fields import RichTextField


body = RichTextField(
    features=[
        "h2",
        "h3",
        "bold",
        "italic",
        "link",
        "show-hidden-chars",
        "insert-non-breaking-space",
        "insert-soft-hyphen",
    ],
    blank=True,
)
```

You can also enable the features through
`WAGTAILADMIN_RICH_TEXT_EDITORS`:

```python
WAGTAILADMIN_RICH_TEXT_EDITORS = {
    "default": {
        "WIDGET": "wagtail.admin.rich_text.DraftailRichTextArea",
        "OPTIONS": {
            "features": [
                "h2",
                "h3",
                "bold",
                "italic",
                "link",
                "show-hidden-chars",
                "insert-non-breaking-space",
                "insert-soft-hyphen",
            ],
        },
    },
}
```

## Supported characters and shortcuts

- Press `Control + Option + I` on macOS to toggle hidden-character visibility.  
- Press `Ctrl + Alt + I` on Windows and Linux.

The visibility feature displays the following invisible characters:

| Character          | Unicode  | Marker | macOS input      | Windows input   | Linux input                              |
| ------------------ | -------- | ------ | ---------------- | --------------- | ---------------------------------------- |
| Space              | `U+0020` | `·`    | `Space`          | `Space`         | `Space`                                  |
| Non-breaking space | `U+00A0` | `°`    | `Option + Space` | `Alt + 0160`    | `Ctrl + Shift + U`, `00A0`, then `Enter` |
| Soft hyphen        | `U+00AD` | `¬`    | n/a              | `Alt + 0173`    | `Ctrl + Shift + U`, `00AD`, then `Enter` |
| Line break         | `U+000A` | `↵`    | `Shift + Enter`  | `Shift + Enter` | `Shift + Enter`                          |

Character-entry shortcuts may depend on the operating system, keyboard layout,
numeric keypad, and configured input method.

The visibility feature also displays the following structural markers:

| Item         | Marker       | Input          |
| ------------ | ------------ |----------------|
| Paragraph    | `¶`          | `Enter`        |
| Heading      | `H1` to `H6` | `#` to `######` |
| Document end | `#`          | n/a            |

The document-end marker makes empty trailing paragraphs visible. Editors will
usually want to remove these paragraphs.

A soft hyphen is also called a syllable hyphen or discretionary hyphen.
A line break is also called a soft return.

## Behavior

The show/hide state is stored in browser `localStorage`, so the editor remembers
the user's last visibility preference. The state is shared across all Draftail
rich text editors on the page.

The insert buttons insert a character at the current Draftail selection. If text
is selected, the selected text is replaced. This matches normal text input
behavior.

Only non-breaking spaces and soft hyphens have insert buttons. Draftail already
provides a line break button. Paragraphs and headings use the standard Draftail
controls and keyboard input.

Toolbar button tooltips show the platform shortcut when one is available.

Hidden-character markers are visual only and are rendered as CSS decorations.
They do not change the stored rich text or its rendered HTML.

Because the markers are rendered with CSS, Draftail retains its native cursor
behavior. Browser spellcheck also continues to treat words containing soft
hyphens as single words.

The soft hyphen character itself has zero width, but its visible marker occupies
space. As a result, cursor movement around a displayed soft hyphen can feel
counterintuitive. This is a known limitation.

## Development and testing

Install the package with its Python and JavaScript test dependencies:

```shell
make install
```

Activate the virtual environment:

```shell
source .venv/bin/activate
```

Run all checks and tests:

```shell
make test
```

Fix code style:

```shell
make fix-codestyle
```

## Demo project

Use the `tests/test_project` Django/Wagtail project for manual testing and
demonstrations:

```shell
python tests/test_project/manage.py migrate
python tests/test_project/manage.py createsuperuser
python tests/test_project/manage.py create_content
python tests/test_project/manage.py runserver
```

The homepage illustrates the supported markers and rich text features.

## Release

Releases are published to PyPI by GitHub Actions when a `v*` tag is pushed.

Update the project version in `pyproject.toml`:

```shell
git add pyproject.toml
git commit -m "Release 0.1.1"
git tag v0.1.1
git push
git push origin v0.1.1
```

The Git tag must match the package version with a `v` prefix. For example,
`version = "0.1.1"` uses the tag `v0.1.1`.

You can create a GitHub Release in the web interface after pushing the tag. If
you create the tag through the GitHub Release interface, make sure the version
bump commit is already present on the target branch.

To build and inspect the package locally:

```shell
uv build
```

This writes the release artifacts to `dist/`. Before publishing, inspect the
generated files and verify that the package data is included:

```shell
tar -tf dist/wagtail_show_hidden_characters-*.tar.gz
unzip -l dist/wagtail_show_hidden_characters-*.whl
```
