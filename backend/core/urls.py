from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, UserViewSet, AuditLogViewSet, public_document_view, secure_endpoint
from .authentication.views import login_view, register_view, refresh_token_view, profile_view, change_password_view

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'users', UserViewSet, basename='user')
router.register(r'audit', AuditLogViewSet, basename='audit')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view),
    path('auth/register/', register_view),
    path('auth/refresh/', refresh_token_view),
    path('auth/profile/', profile_view),
    path('auth/change-password/', change_password_view),
    path('share/<str:token>/', public_document_view),
    path('secure/', secure_endpoint),
]
