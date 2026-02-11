from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView, ArticleViewSet, CommentViewSet, ArticleCommentViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r"articles", ArticleViewSet, basename="article")
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"chat", ChatMessageViewSet, basename="chat")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
    path("articles/<int:article_pk>/comments/", ArticleCommentViewSet.as_view({"get": "list", "post": "create"}), name="article-comments"),
]
