from rest_framework import permissions

def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.groups.filter(name="Admin").exists())

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)

class IsAdminOrCommentOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        return obj.user == request.user
