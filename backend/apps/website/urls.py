from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WebsiteSettingsView, HomepageBannerViewSet

router = DefaultRouter()
router.register(r'banners', HomepageBannerViewSet, basename='banner')

urlpatterns = [
    path('settings/', WebsiteSettingsView.as_view(), name='website_settings'),
    path('', include(router.urls)),
]
