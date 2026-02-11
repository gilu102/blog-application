from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = "Create user groups: Admin, Editors, Users"

    def handle(self, *args, **options):
        for name in ["Admin", "Editors", "Users"]:
            Group.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS("Groups ready."))
