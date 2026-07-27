from wagtail import hooks
from wagtail.admin.rich_text.editors.draftail.features import ControlFeature, Feature


DRAFTAIL_SHOW_HIDDEN_CHARACTERS_JS = (
    "wagtail_show_hidden_characters/js/draftail-show-hidden-characters.js"
)
DRAFTAIL_SHOW_HIDDEN_CHARACTERS_CSS = (
    "wagtail_show_hidden_characters/css/draftail-show-hidden-characters.css"
)


class ShowHiddenCharactersFeature(Feature):
    def construct_options(self, options):
        options.setdefault("decorators", []).append(
            {"type": "show-hidden-characters"}
        )
        ControlFeature(
            {
                "type": "show-hidden-characters-toggle",
                "icon": "view",
                "description": "Show hidden characters",
            }
        ).construct_options(options)


class InsertCharacterFeature(Feature):
    def __init__(self, control, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.control = control

    def construct_options(self, options):
        ControlFeature(self.control).construct_options(options)


@hooks.register("register_rich_text_features")
def register_show_hidden_characters_feature(features):
    features.register_editor_plugin(
        "draftail",
        "show-hidden-chars",
        ShowHiddenCharactersFeature(
            js=[DRAFTAIL_SHOW_HIDDEN_CHARACTERS_JS],
            css={
                "all": [DRAFTAIL_SHOW_HIDDEN_CHARACTERS_CSS],
            },
        ),
    )

    features.register_editor_plugin(
        "draftail",
        "insert-non-breaking-space",
        InsertCharacterFeature(
            {
                "type": "insert-non-breaking-space",
                "label": "°",
                "description": "Insert non-breaking space",
            },
            js=[DRAFTAIL_SHOW_HIDDEN_CHARACTERS_JS],
            css={
                "all": [DRAFTAIL_SHOW_HIDDEN_CHARACTERS_CSS],
            },
        ),
    )

    features.register_editor_plugin(
        "draftail",
        "insert-soft-hyphen",
        InsertCharacterFeature(
            {
                "type": "insert-soft-hyphen",
                "label": "¬",
                "description": "Insert soft hyphen",
            },
            js=[DRAFTAIL_SHOW_HIDDEN_CHARACTERS_JS],
            css={
                "all": [DRAFTAIL_SHOW_HIDDEN_CHARACTERS_CSS],
            },
        ),
    )
