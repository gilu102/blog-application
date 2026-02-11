from django.contrib import admin
from .models import Tag, Article, Comment, ArticleRating, ChatMessage

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name"]

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ["title", "author_name", "publication_date"]
    filter_horizontal = ["tags"]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["article", "user", "comment_date"]


@admin.register(ArticleRating)
class ArticleRatingAdmin(admin.ModelAdmin):
    list_display = ["article", "user", "score"]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ["user", "content", "created_at"]
