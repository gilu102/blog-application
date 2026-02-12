from django.contrib import admin
from .models import Tag, Article, Comment, ArticleRating, ChatMessage, SystemTrackingLog, UploadedFile

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


@admin.register(SystemTrackingLog)
class SystemTrackingLogAdmin(admin.ModelAdmin):
    list_display = ["log_type", "email", "ip_address", "created_at"]
    list_filter = ["log_type"]
    search_fields = ["email", "ip_address"]


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ["name", "file", "uploaded_by", "uploaded_at"]
