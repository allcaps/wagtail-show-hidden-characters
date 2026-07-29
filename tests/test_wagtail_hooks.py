from django.contrib.staticfiles import finders

from wagtail_show_hidden_characters.wagtail_hooks import (
    DRAFTAIL_SHOW_HIDDEN_CHARACTERS_CSS,
    DRAFTAIL_SHOW_HIDDEN_CHARACTERS_JS,
    InsertCharacterFeature,
    ShowHiddenCharactersFeature,
    register_show_hidden_characters_feature,
)


class FeatureRegistry:
    def __init__(self):
        self.plugins = {}

    def register_editor_plugin(self, editor, feature_name, plugin):
        self.plugins[(editor, feature_name)] = plugin


def test_register_show_hidden_characters_features():
    features = FeatureRegistry()

    register_show_hidden_characters_feature(features)

    assert set(features.plugins) == {
        ("draftail", "show-hidden-chars"),
        ("draftail", "insert-non-breaking-space"),
        ("draftail", "insert-soft-hyphen"),
    }


def test_show_hidden_characters_feature_constructs_draftail_options():
    feature = ShowHiddenCharactersFeature()
    options = {}

    feature.construct_options(options)

    assert options["decorators"] == [{"type": "show-hidden-characters"}]
    assert options["controls"] == [
        {
            "type": "show-hidden-characters-toggle",
            "icon": "view",
            "description": "Show hidden characters",
        }
    ]


def test_insert_character_feature_constructs_draftail_options():
    control = {
        "type": "insert-non-breaking-space",
        "label": "°",
        "description": "Insert non-breaking space",
    }
    feature = InsertCharacterFeature(control)
    options = {}

    feature.construct_options(options)

    assert options["controls"] == [control]


def test_static_assets_are_discoverable():
    assert finders.find(DRAFTAIL_SHOW_HIDDEN_CHARACTERS_JS)
    assert finders.find(DRAFTAIL_SHOW_HIDDEN_CHARACTERS_CSS)
