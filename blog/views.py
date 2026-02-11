from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db.models import Avg

from .models import Article, Comment, ArticleRating, ChatMessage
from .serializers import (
    UserRegisterSerializer, ArticleListSerializer, ArticleDetailSerializer,
    CommentSerializer, ArticleRatingSerializer, ChatMessageSerializer,
)
from .permissions import IsAdminOrReadOnly, IsAdminOrCommentOwner

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["title", "content", "author_name", "tags__name"]

    def get_serializer_class(self):
        if self.action in ["retrieve", "create", "update", "partial_update"]:
            return ArticleDetailSerializer
        return ArticleListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["get", "post"], permission_classes=[IsAuthenticatedOrReadOnly])
    def rating(self, request, pk=None):
        article = self.get_object()
        if request.method == "GET":
            agg = article.ratings.aggregate(avg=Avg("score"), count=article.ratings.count())
            user_rating = None
            if request.user.is_authenticated:
                r = article.ratings.filter(user=request.user).first()
                user_rating = r.score if r else None
            return Response({
                "average": round(agg["avg"] or 0, 1),
                "count": agg["count"] or 0,
                "user_rating": user_rating,
            })
        # POST
        ser = ArticleRatingSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        score = ser.validated_data["score"]
        if not 1 <= score <= 5:
            return Response({"score": ["Must be between 1 and 5."]}, status=status.HTTP_400_BAD_REQUEST)
        ArticleRating.objects.update_or_create(
            article=article, user=request.user, defaults={"score": score}
        )
        agg = article.ratings.aggregate(avg=Avg("score"), count=article.ratings.count())
        return Response({
            "average": round(agg["avg"] or 0, 1),
            "count": agg["count"] or 0,
            "user_rating": score,
        })

class ArticleCommentViewSet(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin, viewsets.mixins.CreateModelMixin):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects.filter(article_id=self.kwargs["article_pk"])

    def perform_create(self, serializer):
        serializer.save(article_id=self.kwargs["article_pk"], user=self.request.user)

class CommentViewSet(viewsets.GenericViewSet, viewsets.mixins.RetrieveModelMixin, viewsets.mixins.UpdateModelMixin, viewsets.mixins.DestroyModelMixin):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrCommentOwner]


class ChatMessageViewSet(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin, viewsets.mixins.CreateModelMixin):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        return ChatMessage.objects.all().order_by("-created_at")[:100]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
