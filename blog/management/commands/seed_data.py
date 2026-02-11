from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from blog.models import Article, Comment, Tag

class Command(BaseCommand):
    help = "Seed: 2 users, 2 articles, 2 comments per article"

    def handle(self, *args, **options):
        Tag.objects.get_or_create(name="Technology", defaults={})
        Tag.objects.get_or_create(name="News", defaults={})
        tech = Tag.objects.get(name="Technology")
        news = Tag.objects.get(name="News")
        admin_grp, _ = Group.objects.get_or_create(name="Admin")
        editors_grp, _ = Group.objects.get_or_create(name="Editors")
        users_grp, _ = Group.objects.get_or_create(name="Users")

        u_admin, created = User.objects.get_or_create(username="admin1", defaults={"email": "admin1@example.com", "is_staff": True, "is_superuser": True})
        if created:
            u_admin.set_password("password123")
            u_admin.save()
        admin_grp.user_set.add(u_admin)

        u_editor, created = User.objects.get_or_create(username="editor1", defaults={"email": "editor1@example.com"})
        if created:
            u_editor.set_password("password123")
            u_editor.save()
        editors_grp.user_set.add(u_editor)

        u_user, created = User.objects.get_or_create(username="reader1", defaults={"email": "reader1@example.com"})
        if created:
            u_user.set_password("password123")
            u_user.save()
        users_grp.user_set.add(u_user)

        a1, _ = Article.objects.get_or_create(title="First Article", defaults={"content": "First article content.", "author_name": "Editor One", "author": u_editor})
        a1.tags.add(tech)
        a2, _ = Article.objects.get_or_create(title="Second Article", defaults={"content": "Second article content.", "author_name": "Editor One", "author": u_editor})
        a2.tags.add(news)

        for art in [a1, a2]:
            Comment.objects.get_or_create(article=art, user=u_user, content="First comment.", defaults={})
            Comment.objects.get_or_create(article=art, user=u_editor, content="Second comment.", defaults={})

        self.stdout.write(self.style.SUCCESS("Seed data created."))
