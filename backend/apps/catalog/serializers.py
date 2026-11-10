from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductReview

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url',
            'icon_name', 'parent', 'order', 'is_active', 'subcategories', 'products_count'
        ]
        read_only_fields = ['id', 'slug']

    def get_subcategories(self, obj):
        # Only nest 1 level to avoid recursion
        if obj.parent is None:
            subs = obj.subcategories.filter(is_active=True)
            return [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "slug": sub.slug,
                    "order": sub.order,
                    "products_count": sub.products.filter(is_active=True).count()
                }
                for sub in subs
            ]
        return []


class BrandSerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'logo_url', 'is_active', 'products_count']
        read_only_fields = ['id', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.CharField(read_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'url', 'is_feature', 'display_order']
        read_only_fields = ['id', 'url']


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.__str__', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'product', 'user', 'user_name', 'rating', 'title', 'comment', 'is_verified_purchase', 'created_at']
        read_only_fields = ['id', 'user', 'user_name', 'is_verified_purchase', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    primary_image_url = serializers.CharField(read_only=True)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_name', 'category_slug',
            'brand', 'brand_name', 'description', 'selling_price', 'discount_price',
            'current_price', 'has_discount', 'discount_percentage', 'unit', 'unit_value',
            'stock_quantity', 'low_stock_threshold', 'is_in_stock', 'is_low_stock',
            'is_out_of_stock', 'primary_image_url', 'average_rating', 'review_count',
            'is_featured', 'is_bestseller', 'is_new_arrival', 'is_active', 'created_at'
        ]


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['specifications', 'barcode', 'images', 'reviews']

    def get_reviews(self, obj):
        approved = obj.reviews.filter(is_approved=True)
        return ProductReviewSerializer(approved, many=True).data


class ProductAdminSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image_url = serializers.CharField(read_only=True)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
