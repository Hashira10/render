from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    SenderViewSet, RecipientGroupViewSet, RecipientViewSet, MessageViewSet,
    ClickLogViewSet, CredentialLogViewSet, track_click, capture_credentials,
    login_template_view, send_test_email, generate_email_view,
    signup_view, change_password_view, change_username_view, current_user_view,
    check_auth_view,
    # change_password_view  # ✅ Add authentication views
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Django API",
        default_version='v1',
        description="Документация API проекта",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="ten.olga.011@gmail.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register(r'senders', SenderViewSet, basename='sender')
router.register(r'recipient_groups', RecipientGroupViewSet, basename='recipient_groups')
router.register(r'recipients', RecipientViewSet)
router.register(r'messages', MessageViewSet, basename="messages")
router.register(r'click_logs', ClickLogViewSet)
router.register(r'credential_logs', CredentialLogViewSet)

urlpatterns = [
    path('api/', include(router.urls)), 
    path("track/<int:recipient_id>/<int:message_id>/<str:platform>/", track_click, name="track_click"),
    path("capture/<int:recipient_id>/<int:message_id>/<str:platform>/", capture_credentials, name="capture_credentials"),
    path("login-template/<int:recipient_id>/<int:message_id>/<str:platform>/", login_template_view, name="login_template"),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path("api/send_test_email/", send_test_email, name="send_test_email"),
    path('generate/', generate_email_view, name='generate_email'),

    path("signup/", signup_view, name="signup"),
    path("change-password/", change_password_view, name="change-password"),
    path('change-username/', change_username_view, name='change-username'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('check-auth/', check_auth_view, name='check_auth'),
    path('current-user/', current_user_view, name='current_user'),

]


