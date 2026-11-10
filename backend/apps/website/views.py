from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from apps.accounts.permissions import IsAdminOrStaff
from apps.accounts.models import AuditLog
from .models import WebsiteSettings, HomepageBanner
from .serializers import WebsiteSettingsSerializer, HomepageBannerSerializer

class WebsiteSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = WebsiteSettingsSerializer

    def get_object(self):
        return WebsiteSettings.get_settings()

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            user=self.request.user,
            action="WEBSITE_SETTINGS_UPDATE",
            target_model="WebsiteSettings",
            target_id=str(instance.id),
            details=self.request.data
        )


class HomepageBannerViewSet(viewsets.ModelViewSet):
    serializer_class = HomepageBannerSerializer
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return HomepageBanner.objects.all()
        return HomepageBanner.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]
