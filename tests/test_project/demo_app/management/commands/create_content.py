from django.core.management.base import BaseCommand
from wagtail.models import Page, Site

from tests.test_project.demo_app.models import HomePage

HOME_BODY = """<h2>Hidden characters 👀</h2>
<p>This line has normal spaces between words.</p>
<p>This line has nonbreaking spaces: Wagtail CMS.</p>
<p>This word has a soft hyphen: char­acter.</p>
<p>This line has a soft return after this point:<br/>continued on the same paragraph.</p>
<h3>One beer and no list please?</h3>
<p>Starting a line with &quot;1.[space][something]&quot; will convert into a list. The workaround for a regular line is using a nonbreaking space:</p>
<p>1. beer</p>
<h3>Moar</h3>
<p>Final paragraph ends here.</p>"""


class Command(BaseCommand):
    help = "Create the example homepage content for the show hidden character demo."

    def handle(self, *args, **options):
        default_site = Site.objects.filter(is_default_site=True).first()
        homepage = self.get_homepage(default_site)
        created = homepage is None

        if homepage is None:
            root_page = Page.get_first_root_node()
            homepage = HomePage(title="Home", slug="home-2")
            root_page.add_child(instance=homepage)

            if default_site is None:
                default_site = Site.objects.create(
                    hostname="localhost",
                    root_page=homepage,
                    is_default_site=True,
                )
            else:
                default_site.root_page = homepage
                default_site.save(update_fields=["root_page"])

        homepage.title = "Home"
        homepage.draft_title = "Home"
        homepage.body = HOME_BODY
        homepage.save_revision().publish()

        if created:
            self.stdout.write(self.style.SUCCESS("Created homepage content."))
        else:
            self.stdout.write(self.style.SUCCESS("Updated homepage content."))

    def get_homepage(self, default_site):
        if default_site is not None:
            root_page = default_site.root_page.specific
            if isinstance(root_page, HomePage):
                return root_page

        return HomePage.objects.filter(slug="home").first()
