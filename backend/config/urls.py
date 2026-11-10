from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import api_root_view

urlpatterns = [
    path('', api_root_view, name='api_root'),
    path('django-admin/', admin.site.urls),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.payments.urls')),
    path('api/', include('apps.promotions.urls')),
    path('api/', include('apps.website.urls')),
    path('api/', include('apps.support.urls')),
    path('api/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
