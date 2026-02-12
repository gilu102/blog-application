from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("blog", "0002_chat_rating")]

    operations = [
        migrations.CreateModel(
            name="SystemTrackingLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("log_type", models.CharField(max_length=32)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=500)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
