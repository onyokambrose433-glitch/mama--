from django.db import models
from decimal import Decimal

class WebsiteSettings(models.Model):
    supermarket_name = models.CharField(max_length=150, default="Mama Shopping Center")
    tagline = models.CharField(
        max_length=255,
        default="Fresh Groceries, Everyday Essentials & Quality Supermarket Products Delivered"
    )
    logo = models.ImageField(upload_to='branding/', null=True, blank=True)
    logo_url = models.URLField(blank=True)
    favicon_url = models.URLField(blank=True)
    
    primary_phone = models.CharField(max_length=50, default="+256 700 000 000 / +256 770 000 000")
    primary_email = models.EmailField(default="orders@mamashoppingcenter.com")
    physical_address = models.CharField(
        max_length=255,
        default="Plot 24, Kampala Road, Kampala, Uganda"
    )
    business_hours = models.CharField(max_length=150, default="Monday - Sunday: 7:30 AM - 9:30 PM")
    
    announcement_text = models.CharField(
        max_length=255,
        default="🚚 Fresh deliveries daily across Kampala & surrounding areas! Order before 6:00 PM for same-day delivery."
    )
    announcement_is_active = models.BooleanField(default=True)
    free_delivery_threshold = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('100000.00'),
        help_text="UGX 100,000 threshold"
    )

    about_us = models.TextField(
        default="Mama Shopping Center is Kampala's premier single-owner neighborhood supermarket dedicated to providing authentic, freshly stocked groceries, butcher meat, dairy products, bakery goods, and household essentials at affordable prices. Every product is sourced directly and inspected for maximum quality and freshness."
    )
    delivery_policy = models.TextField(
        default="We deliver throughout Kampala Central, Nakawa, Makindye, Rubaga, Kawempe, Kira, Wakiso, and Entebbe. Orders placed between 7:30 AM and 6:00 PM are delivered the same day within 2-3 hours. Perishable and cold items are safely transported in insulated containers."
    )
    terms_and_conditions = models.TextField(
        default="Mama Shopping Center ensures that all products displayed on our platform are genuine supermarket stock. Prices are stated in Uganda Shillings (UGX). Orders may be confirmed upon placement or payment receipt."
    )
    privacy_policy = models.TextField(
        default="At Mama Shopping Center, your personal details, delivery addresses, and contact numbers are used strictly for fulfilling your grocery orders and account management. We never sell your personal data."
    )

    facebook_url = models.URLField(blank=True, default="https://facebook.com")
    twitter_url = models.URLField(blank=True, default="https://twitter.com")
    instagram_url = models.URLField(blank=True, default="https://instagram.com")
    whatsapp_number = models.CharField(max_length=30, blank=True, default="+256700000000")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Website Settings'

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(id=1)
        return settings

    def __str__(self):
        return f"{self.supermarket_name} Website Configuration"


class HomepageBanner(models.Model):
    class Position(models.TextChoices):
        HERO = 'hero', 'Hero Carousel Slide'
        PROMO_MID = 'promo_mid', 'Middle Promo Banner'
        PROMO_BOTTOM = 'promo_bottom', 'Bottom Special Banner'

    title = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=255, blank=True)
    badge = models.CharField(max_length=80, blank=True, help_text="e.g. 100% FRESH GUARANTEE, SUPERMARKET PRICES")
    image = models.ImageField(upload_to='banners/', null=True, blank=True)
    image_url = models.URLField(blank=True)
    cta_text = models.CharField(max_length=50, default="Shop Now")
    cta_link = models.CharField(max_length=150, default="/shop")
    position = models.CharField(max_length=30, choices=Position.choices, default=Position.HERO)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'display_order', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_position_display()})"
