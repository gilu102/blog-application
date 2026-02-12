from rest_framework import viewsets, filters, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.db.models import Avg

from .models import Article, Comment, ArticleRating, ChatMessage, Tag, SystemTrackingLog, UploadedFile
from .serializers import (
    UserRegisterSerializer, ArticleListSerializer, ArticleDetailSerializer,
    CommentSerializer, ArticleRatingSerializer, ChatMessageSerializer, TagSerializer,
    UploadedFileSerializer,
)
from .permissions import IsAdminOrCreatorOrReadOnly, IsAdminOrCommentOwner, IsAdminOrFileOwner

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = list(request.user.groups.values_list("name", flat=True))
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "groups": groups,
            "is_staff": request.user.is_staff,
        })


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrCreatorOrReadOnly]
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


def _tracking_meta(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    ip = (x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR")) or None
    ua = (request.META.get("HTTP_USER_AGENT") or "")[:500]
    return ip, ua


class PasswordResetRequestView(APIView):
    """Request password reset – send email with link, tracked."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        ip, ua = _tracking_meta(request)
        SystemTrackingLog.objects.create(
            log_type=SystemTrackingLog.LOG_TYPE_PASSWORD_RESET,
            email=email,
            ip_address=ip,
            user_agent=ua,
        )
        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_RESET_URL}?uid={uid}&token={token}"
            send_mail(
                subject="Gil's Blog – Password reset",
                message=f"Use this link to reset your password:\n{reset_url}\n\nLink is valid for 24 hours.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        return Response({"detail": "If this email is registered, you will receive reset instructions."})


class PasswordResetConfirmView(APIView):
    """Set new password using token from email link."""
    permission_classes = [AllowAny]

    def post(self, request):
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode

        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        if not uid or not token or not new_password:
            return Response(
                {"detail": "uid, token and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, User.DoesNotExist):
            return Response({"detail": "Invalid or expired link."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired link."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset. You can log in now."})


class HumanVerifyView(APIView):
    """Verify user is human – tracked for file system / security."""
    permission_classes = [AllowAny]

    def post(self, request):
        ip, ua = _tracking_meta(request)
        ua_safe = (ua or "")[:500]
        try:
            SystemTrackingLog.objects.create(
                log_type=SystemTrackingLog.LOG_TYPE_HUMAN_VERIFY,
                email=None,
                ip_address=ip if ip else None,
                user_agent=ua_safe,
            )
        except Exception:
            # GenericIPAddressField can reject "" or "localhost" etc. – save without IP
            SystemTrackingLog.objects.create(
                log_type=SystemTrackingLog.LOG_TYPE_HUMAN_VERIFY,
                email=None,
                ip_address=None,
                user_agent=ua_safe,
            )
        return Response({"detail": "Verification recorded."})


class UploadedFileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [IsAdminOrFileOwner]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
