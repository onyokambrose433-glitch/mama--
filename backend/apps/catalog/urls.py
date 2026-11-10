from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, ProductViewSet, SearchSuggestionsView, ProductReviewViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('products/search-suggestions/', SearchSuggestionsView.as_view(), name='search_suggestions'),
    path('products/<slug:product_slug>/reviews/', ProductReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='product_reviews'),
    path('', include(router.urls)),
]
