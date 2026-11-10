from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeliveryZoneViewSet, CartView, AddToCartView, UpdateCartItemView,
    RemoveCartItemView, ClearCartView, SyncCartView, OrderCreateView,
    CustomerOrderListView, CustomerOrderDetailView, CustomerOrderCancelView,
    AdminOrderViewSet
)

router = DefaultRouter()
router.register(r'delivery-zones', DeliveryZoneViewSet, basename='delivery_zone')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin_orders')

urlpatterns = [
    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart_view'),
    path('cart/items/', AddToCartView.as_view(), name='cart_add_item'),
    path('cart/items/<int:item_id>/', UpdateCartItemView.as_view(), name='cart_update_item'),
    path('cart/items/<int:item_id>/remove/', RemoveCartItemView.as_view(), name='cart_remove_item'),
    path('cart/clear/', ClearCartView.as_view(), name='cart_clear'),
    path('cart/sync/', SyncCartView.as_view(), name='cart_sync'),

    # Order endpoints
    path('orders/', CustomerOrderListView.as_view(), name='customer_orders'),
    path('orders/create/', OrderCreateView.as_view(), name='order_create'),
    path('orders/<str:order_number>/', CustomerOrderDetailView.as_view(), name='customer_order_detail'),
    path('orders/<str:order_number>/cancel/', CustomerOrderCancelView.as_view(), name='customer_order_cancel'),

    path('', include(router.urls)),
]
