# Wagtail Show Hidden Characters

Wagtail _Show Hidden Characters_ adds Draftail toolbar controls for working with 
invisible text characters in Wagtail rich text fields.

It provides three independent rich text features:

- `show-hidden-chars`, a button that shows/hides hidden characters in the editor.
- `insert-non-breaking-space`, a button for inserting a non-breaking space.
- `insert-soft-hyphen`, a button for inserting a soft hyphen.

Show Hidden Characters switched _on_ reveals:

- Heading levels `H1, H2, ...`
- Paragraphs `¶`
- Line-breaks `↵`
- Text end `#`
- Space `·`
- Non-breaking space `°`
- Soft-hyphen (also known as syllable hyphen, or discretionary hyphen ) `¬`

## Installation

Install with pip:

```bash
pip install wagtail-show-hidden-characters
```

Add `wagtail_show_hidden_characters` to `INSTALLED_APPS`.

```python
INSTALLED_APPS = [
    # ...
    "wagtail_show_hidden_characters",
]
```

Include the features on RichTextField explicitly:

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

You can also enable the features through `WAGTAILADMIN_RICH_TEXT_EDITORS`:

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

## Supported characters

The visibility feature displays these characters:

| Character | Unicode | Display marker |
| --- | --- | --- |
| Space | `U+0020` | `·` |
| Non-breaking space | `U+00A0` | `°` |
| Soft hyphen | `U+00AD` | `¬` |
| Line break | `U+000A` | `↵` |


The insert buttons include non-breaking space and soft hyphen. They do not
include a regular space because that is already available from the keyboard.
They do not include line break because Draftail already provides line-break
insertion.

The visibility feature also shows structural editor markers for block ends,
headings, and document end. Those markers are visual aids only and are not
insertable characters.

## Behavior

The show/hide state is stored in browser `localStorage`, so the editor remembers
the user's last visibility preference. The state is shared across all Draftail
rich text editors on the page.

Use `^ + ⌥ + I` on macOS or `Ctrl + Alt + I` on Windows and Linux to
toggle hidden-character visibility.

The insert buttons insert at the current Draftail selection. If text is
selected, the selected text is replaced, matching normal typing behavior.

Native keyboard input also works where the platform supports it:
non-breaking space is `Option + Space` on macOS, `Alt + 0160` on Windows, and
`Ctrl + Shift + U, 00A0` on Linux; soft hyphen is `Alt + 0173` on Windows and
`Ctrl + Shift + U, 00AD` on Linux.

Hidden-character markers are visual only. They are rendered as CSS decoration.
Draftail keeps its native cursor behavior and browser spellcheck still sees
words containing soft hyphens as single words.

The soft hyphen character is zero width, but the soft hyphen icon does occupy
space. This leads to strange cursor behaviour where the cursor position does
not go behind the icon.

For more detail on Wagtail Draftail extensions, see the official Wagtail docs:
https://docs.wagtail.org/en/stable/extending/extending_draftail.html

## Development and testing

Install the package with test dependencies:

```shell
uv venv
source .venv/bin/activate
uv pip install -e ".[test]"
```

Run the automated tests:

```shell
pytest
```

## Demo project

The `tests/test_project` Django/Wagtail project can be used for manual testing and demonstration.

```shell
python tests/test_project/manage.py migrate
python tests/test_project/manage.py createsuperuser
python tests/test_project/manage.py runserver
python tests/test_project/manage.py create_content
```

The homepage illustrates the glyphs and features.

## Releasing

Releases are published to PyPI by GitHub Actions when a `v*` tag is pushed.

Update the project version in `pyproject.toml`.

```shell
git add pyproject.toml
git commit -m "Release 0.1.1"
git tag -a v0.1.1 -m v0.1.1
git push
git push origin v0.1.1
```

The Git tag should be the package version with a `v` prefix. For example, `version = "0.1.1"` in `pyproject.toml` is released with tag `v0.1.1`.

You can also create the GitHub Release in the web UI after pushing the tag. If you create the tag through the GitHub Release UI, make sure the version bump commit is already on the target branch.

To build and inspect the package locally:

```shell
uv build
```

This writes the release artifacts to `dist/`. Before publishing, inspect the generated files and verify the package data is included:

```shell
tar -tf dist/wagtail_exact_crop-*.tar.gz
unzip -l dist/wagtail_exact_crop-*.whl
```
