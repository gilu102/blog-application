from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Article, Comment, Tag, ArticleRating, ChatMessage

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        g, _ = Group.objects.get_or_create(name="Users")
        g.user_set.add(user)
        return user

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]

class ArticleListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    author_username = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ["id", "title", "content", "publication_date", "author_name", "author_username", "tags"]

    def get_author_username(self, obj):
        return obj.author.username if obj.author else None

class ArticleDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    author_username = serializers.SerializerMethodField()
    tag_ids = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), write_only=True, required=False)

    class Meta:
        model = Article
        fields = ["id", "title", "content", "publication_date", "author_name", "author", "author_username", "tags", "tag_ids"]
        read_only_fields = ["publication_date", "author"]

    def get_author_username(self, obj):
        return obj.author.username if obj.author else None

    def create(self, validated_data):
        tag_ids = validated_data.pop("tag_ids", [])
        article = Article.objects.create(**validated_data)
        if tag_ids:
            article.tags.set(tag_ids)
        return article

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop("tag_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        return instance

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "article", "user", "user_name", "content", "comment_date"]
        read_only_fields = ["article", "user", "comment_date"]


class ArticleRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleRating
        fields = ["score"]
        read_only_fields = ["article", "user"]


class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "user", "user_name", "content", "created_at"]
        read_only_fields = ["user", "created_at"]
