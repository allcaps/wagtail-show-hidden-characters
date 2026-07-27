from wagtail.admin.panels import FieldPanel
from wagtail.fields import RichTextField
from wagtail.models import Page


class HomePage(Page):
    body = RichTextField(
        blank=True,
        features=[
            "bold",
            "italic",
            "h2",
            "h3",
            "h4",
            "ol",
            "ul",
            "hr",
            "insert-non-breaking-space",
            "insert-soft-hyphen",
            "show-hidden-chars",
        ],
    )

    content_panels = Page.content_panels + [
        FieldPanel("body"),
    ]
