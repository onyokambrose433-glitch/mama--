from django.db import models
from django.utils.text import slugify
from django.conf import settings
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    image_url = models.URLField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name e.g. ShoppingBag, Apple, Beef, etc.")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    logo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    class UnitChoice(models.TextChoices):
        PIECE = 'piece', 'Piece / Item'
        KG = 'kg', 'Kilogram (kg)'
        G = 'g', 'Gram (g)'
        LITRE = 'litre', 'Litre (L)'
        ML = 'ml', 'Millilitre (ml)'
        PACKET = 'packet', 'Packet'
        CARTON = 'carton', 'Carton'
        BOTTLE = 'bottle', 'Bottle'
        BUNCH = 'bunch', 'Bunch'
        DOZEN = 'dozen', 'Dozen'
        TIN = 'tin', 'Tin'
        ROLL = 'roll', 'Roll'

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    sku = models.CharField(max_length=60, unique=True, help_text="Stock Keeping Unit")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField()
    
    # Financial fields in UGX
    cost_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'),
        help_text="Unit cost in UGX for real profit calculation"
    )
    selling_price = models.DecimalField(
        max_digits=12, decimal_places=2,
        help_text="Regular selling price in UGX"
    )
    discount_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Special offer price in UGX (optional)"
    )

    unit = models.CharField(max_length=20, choices=UnitChoice.choices, default=UnitChoice.PIECE)
    unit_value = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('1.00'), help_text="e.g. 1 kg, 500 g, 2 litre")

    # Inventory
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)
    barcode = models.CharField(max_length=100, blank=True)

    # Rich metadata
    specifications = models.JSONField(default=dict, blank=True, help_text="Key-value specifications e.g. Origin, Expiry, Ingredients")
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def current_price(self):
        if self.discount_price and self.discount_price > 0 and self.discount_price < self.selling_price:
            return self.discount_price
        return self.selling_price

    @property
    def has_discount(self):
        return bool(self.discount_price and self.discount_price > 0 and self.discount_price < self.selling_price)

    @property
    def discount_percentage(self):
        if self.has_discount and self.selling_price > 0:
            pct = ((self.selling_price - self.discount_price) / self.selling_price) * 100
            return round(pct)
        return 0

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock_quantity <= self.low_stock_threshold

    @property
    def is_out_of_stock(self):
        return self.stock_quantity <= 0

    @property
    def primary_image_url(self):
        primary = self.images.filter(is_feature=True).first() or self.images.first()
        if primary:
            return primary.url
        return None

    @property
    def average_rating(self):
        approved_reviews = self.reviews.filter(is_approved=True)
        if approved_reviews.exists():
            return round(approved_reviews.aggregate(models.Avg('rating'))['rating__avg'], 1)
        return 0.0

    @property
    def review_count(self):
        return self.reviews.filter(is_approved=True).count()


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    image_url = models.URLField(blank=True, help_text="Cloudinary or CDN link if external")
    is_feature = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_feature', 'display_order', 'id']

    @property
    def url(self):
        if self.image_url:
            return self.image_url
        if self.image:
            return self.image.url
        return ""

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)])
    title = models.CharField(max_length=150, blank=True)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user} - {self.product.name} ({self.rating}*)"
