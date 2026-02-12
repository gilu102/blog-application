import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Article, Tag, SystemTrackingLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(username="testuser", password="testpass123", email="test@example.com")


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.mark.django_db
class TestAuth:
    def test_register(self, api_client):
        r = api_client.post("/api/register/", {"username": "newuser", "password": "newpass123", "email": "new@example.com"})
        assert r.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username="newuser").exists()

    def test_login(self, api_client, user):
        r = api_client.post("/api/token/", {"username": "testuser", "password": "testpass123"})
        assert r.status_code == status.HTTP_200_OK
        assert "access" in r.data and "refresh" in r.data

    def test_me_requires_auth(self, api_client):
        r = api_client.get("/api/me/")
        assert r.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_returns_user(self, auth_client, user):
        r = auth_client.get("/api/me/")
        assert r.status_code == status.HTTP_200_OK
        assert r.data["username"] == user.username
        assert "groups" in r.data


@pytest.mark.django_db
class TestArticles:
    def test_list_articles(self, api_client):
        r = api_client.get("/api/articles/")
        assert r.status_code == status.HTTP_200_OK
        assert "results" in r.data or isinstance(r.data, list)

    def test_get_article(self, api_client, user):
        art = Article.objects.create(title="Test", content="Body", author_name="Test", author=user)
        r = api_client.get(f"/api/articles/{art.id}/")
        assert r.status_code == status.HTTP_200_OK
        assert r.data["title"] == "Test"


@pytest.mark.django_db
class TestPasswordReset:
    def test_request_reset_requires_email(self, api_client):
        r = api_client.post("/api/password-reset/", {})
        assert r.status_code == status.HTTP_400_BAD_REQUEST

    def test_request_reset_accepts_email(self, api_client):
        r = api_client.post("/api/password-reset/", {"email": "someone@example.com"})
        assert r.status_code == status.HTTP_200_OK
        assert SystemTrackingLog.objects.filter(log_type="password_reset").exists()

    def test_verify_human(self, api_client):
        r = api_client.post("/api/verify-human/", {})
        assert r.status_code == status.HTTP_200_OK
        assert SystemTrackingLog.objects.filter(log_type="human_verify").exists()


@pytest.mark.django_db
class TestChat:
    def test_list_chat_no_auth(self, api_client):
        r = api_client.get("/api/chat/")
        assert r.status_code == status.HTTP_200_OK

    def test_send_chat_requires_auth(self, api_client):
        r = api_client.post("/api/chat/", {"content": "Hi"})
        assert r.status_code == status.HTTP_401_UNAUTHORIZED
