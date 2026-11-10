from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Brand, Product, ProductImage, ProductReview
from .serializers import (
    CategorySerializer, BrandSerializer, ProductImageSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductAdminSerializer,
    ProductReviewSerializer
)
from apps.accounts.permissions import IsAdminOrStaff

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    pagination_class = None
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return Category.objects.all().prefetch_related('subcategories', 'products')
        return Category.objects.filter(is_active=True, parent=None).prefetch_related('subcategories', 'products')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]


class BrandViewSet(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    pagination_class = None
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff:
            return Brand.objects.all()
        return Brand.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]


class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'sku', 'brand__name', 'category__name']
    ordering_fields = ['selling_price', 'created_at', 'stock_quantity', 'name']

    def get_queryset(self):
        # Admin can view all including inactive
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff and self.request.query_params.get('admin') == 'true':
            qs = Product.objects.all()
        else:
            qs = Product.objects.filter(is_active=True)

        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(Q(category__slug=category_param) | Q(category__parent__slug=category_param))

        brand_param = self.request.query_params.get('brand')
        if brand_param:
            qs = qs.filter(brand__slug=brand_param)

        min_price = self.request.query_params.get('min_price')
        if min_price:
            qs = qs.filter(selling_price__gte=min_price)

        max_price = self.request.query_params.get('max_price')
        if max_price:
            qs = qs.filter(selling_price__lte=max_price)

        in_stock = self.request.query_params.get('in_stock')
        if in_stock == 'true':
            qs = qs.filter(stock_quantity__gt=0)

        discount_only = self.request.query_params.get('has_discount')
        if discount_only == 'true':
            qs = qs.filter(discount_price__gt=0, discount_price__isnull=False)

        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(is_featured=True)

        bestseller = self.request.query_params.get('bestseller')
        if bestseller == 'true':
            qs = qs.filter(is_bestseller=True)

        new_arrival = self.request.query_params.get('new_arrival')
        if new_arrival == 'true':
            qs = qs.filter(is_new_arrival=True)

        # Custom sort handling
        sort_by = self.request.query_params.get('sort')
        if sort_by == 'price_asc':
            qs = qs.order_by('selling_price')
        elif sort_by == 'price_desc':
            qs = qs.order_by('-selling_price')
        elif sort_by == 'newest':
            qs = qs.order_by('-created_at')
        elif sort_by == 'bestseller':
            qs = qs.order_by('-is_bestseller', '-created_at')

        return qs.select_related('category', 'brand').prefetch_related('images', 'reviews')

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_admin_or_staff and self.request.query_params.get('admin') == 'true':
            return ProductAdminSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductAdminSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:8]
        serializer = ProductListSerializer(related_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrStaff])
    def upload_image(self, request, slug=None):
        product = self.get_object()
        image_file = request.FILES.get('image')
        image_url = request.data.get('image_url', '')
        is_feature = request.data.get('is_feature', 'false').lower() in ('true', '1')

        if not image_file and not image_url:
            return Response({"detail": "Provide either an image file or image_url."}, status=status.HTTP_400_BAD_REQUEST)

        if is_feature:
            product.images.update(is_feature=False)

        img = ProductImage.objects.create(
            product=product,
            image=image_file,
            image_url=image_url,
            is_feature=is_feature
        )
        return Response(ProductImageSerializer(img).data, status=status.HTTP_201_CREATED)


class SearchSuggestionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response([])

        products = Product.objects.filter(
            Q(name__icontains=query) | Q(category__name__icontains=query) | Q(sku__icontains=query),
            is_active=True
        )[:8]

        results = [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "price": float(p.current_price),
                "image": p.primary_image_url,
                "category": p.category.name,
                "unit": p.get_unit_display()
            }
            for p in products
        ]
        return Response(results)


class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer

    def get_queryset(self):
        return ProductReview.objects.filter(product__slug=self.kwargs.get('product_slug'), is_approved=True)

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        from apps.orders.models import Order
        user = self.request.user
        product = Product.objects.get(slug=self.kwargs.get('product_slug'))
        
        # Check if verified purchase
        has_purchased = Order.objects.filter(
            user=user,
            status=Order.Status.DELIVERED,
            items__product=product
        ).exists()

        serializer.save(
            user=user,
            product=product,
            is_verified_purchase=has_purchased,
            is_approved=True
        )
