from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, CurrentUserView, ChangePasswordView,
    AddressViewSet, StaffViewSet, CustomerListView, CustomerStatusToggleView,
    AuditLogListView
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'admin/staff', StaffViewSet, basename='staff')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('admin/customers/', CustomerListView.as_view(), name='admin_customers'),
    path('admin/customers/<int:pk>/toggle-status/', CustomerStatusToggleView.as_view(), name='customer_status_toggle'),
    path('admin/audit-logs/', AuditLogListView.as_view(), name='audit_logs'),
    path('', include(router.urls)),
]
