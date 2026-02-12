import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create a superuser from ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL env vars (if set and no superuser exists)."

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME", "").strip()
        password = os.environ.get("ADMIN_PASSWORD", "").strip()
        email = os.environ.get("ADMIN_EMAIL", "").strip()

        if not username or not password:
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f"User {username!r} already exists, skipping.")
            return

        User.objects.create_superuser(username=username, email=email or f"{username}@example.com", password=password)
        self.stdout.write(self.style.SUCCESS(f"Superuser {username!r} created."))
