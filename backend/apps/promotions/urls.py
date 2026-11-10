from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CouponValidateView, AdminCouponViewSet

router = DefaultRouter()
router.register(r'admin/coupons', AdminCouponViewSet, basename='admin_coupon')

urlpatterns = [
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon_validate'),
    path('', include(router.urls)),
]
