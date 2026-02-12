from rest_framework import permissions

def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.groups.filter(name="Admin").exists())

def is_creator(user):
    return user.is_authenticated and user.groups.filter(name="Editors").exists()

def can_manage_article(user, article):
    if is_admin(user):
        return True
    return is_creator(user) and article.author_id == user.id

class IsAdminOrCreatorOrReadOnly(permissions.BasePermission):
    """Articles: read all; create if Admin or Creator; update/delete if Admin or Creator-owner."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user) or is_creator(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return can_manage_article(request.user, obj)

class IsAdminOrCommentOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        return obj.user == request.user
