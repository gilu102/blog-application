from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, CurrentUserView, TagViewSet, ArticleViewSet, CommentViewSet,
    ArticleCommentViewSet, ChatMessageViewSet, PasswordResetRequestView, HumanVerifyView,
)

router = DefaultRouter()
router.register(r"tags", TagViewSet, basename="tag")
router.register(r"articles", ArticleViewSet, basename="article")
router.register(r"comments", CommentViewSet, basename="comment")
router.register(r"chat", ChatMessageViewSet, basename="chat")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("verify-human/", HumanVerifyView.as_view(), name="verify_human"),
    path("", include(router.urls)),
    path("articles/<int:article_pk>/comments/", ArticleCommentViewSet.as_view({"get": "list", "post": "create"}), name="article-comments"),
]
