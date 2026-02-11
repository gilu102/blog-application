import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("blog", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="ArticleRating",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.PositiveSmallIntegerField()),
                ("article", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ratings", to="blog.article")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="article_ratings", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-id"], "unique_together": {("article", "user")}},
        ),
        migrations.CreateModel(
            name="ChatMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("content", models.TextField(max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chat_messages", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["created_at"]},
        ),
    ]
