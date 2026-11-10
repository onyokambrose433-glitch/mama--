from django.core.management.base import BaseCommand
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

from apps.website.models import WebsiteSettings, HomepageBanner
from apps.catalog.models import Category
from apps.orders.models import DeliveryZone
from apps.payments.models import PaymentMethodConfig
from apps.promotions.models import Coupon
from apps.support.models import FAQ

class Command(BaseCommand):
    help = 'Seeds initial foundational supermarket settings, categories, delivery zones, and payment methods.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Mama Shopping Center foundational data..."))

        # 1. Website Settings
        settings = WebsiteSettings.get_settings()
        settings.supermarket_name = "Mama Shopping Center"
        settings.tagline = "Fresh Supermarket Groceries, Quality Meats & Everyday Essentials Delivered Fast"
        settings.primary_phone = "+256 700 892 100 / +256 772 892 100"
        settings.primary_email = "orders@mamashoppingcenter.com"
        settings.physical_address = "Plot 24, Kampala Road, Central Division, Kampala, Uganda"
        settings.business_hours = "Monday – Sunday: 7:00 AM – 10:00 PM"
        settings.announcement_text = "🚚 Fresh deliveries daily across Kampala & surrounding areas! Free delivery on orders over UGX 100,000."
        settings.announcement_is_active = True
        settings.free_delivery_threshold = Decimal('100000.00')
        settings.about_us = (
            "Mama Shopping Center is Kampala's premier single-owner supermarket dedicated to providing "
            "fresh, authentic supermarket groceries, butcher meat, dairy products, bakery goods, and household essentials. "
            "We manage our own inventory and fleet to guarantee absolute freshness and speedy delivery straight to your doorstep."
        )
        settings.delivery_policy = (
            "We deliver throughout Kampala Central, Nakawa, Makindye, Rubaga, Kawempe, Kira, Wakiso, and Entebbe. "
            "Orders placed between 7:30 AM and 6:30 PM are delivered same-day within 2-3 hours. "
            "Perishable products are handled with temperature-controlled insulated bags to preserve freshness."
        )
        settings.terms_and_conditions = (
            "All products listed on Mama Shopping Center are guaranteed genuine supermarket inventory. "
            "Prices are listed in Uganda Shillings (UGX) inclusive of applicable taxes. "
            "Orders are confirmed upon placement and verified payment."
        )
        settings.privacy_policy = (
            "At Mama Shopping Center, your delivery details, contact numbers, and transaction records "
            "are stored securely and never shared with third-party advertisers."
        )
        settings.save()
        self.stdout.write(self.style.SUCCESS("✓ Website settings updated."))

        # 2. Homepage Banners
        if not HomepageBanner.objects.exists():
            HomepageBanner.objects.create(
                title="Fresh Groceries Delivered To Your Door",
                subtitle="Fresh fruits, vegetables, butcher-quality meats, dairy, and pantry essentials in Kampala.",
                badge="SAME-DAY KAMPALA DELIVERY",
                image_url="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
                cta_text="Shop Groceries",
                cta_link="/shop",
                position=HomepageBanner.Position.HERO,
                display_order=1
            )
            HomepageBanner.objects.create(
                title="Butcher & Fresh Farm Produce",
                subtitle="100% farm-fresh beef, goat meat, poultry, and organic greens inspected daily.",
                badge="100% FRESH GUARANTEE",
                image_url="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
                cta_text="Explore Fresh Foods",
                cta_link="/shop?category=meat-and-poultry",
                position=HomepageBanner.Position.HERO,
                display_order=2
            )
            HomepageBanner.objects.create(
                title="Everyday Household & Cleaning Essentials",
                subtitle="Stock up on detergents, paper goods, toiletries, and cleaning supplies at wholesale prices.",
                badge="BEST SUPERMARKET PRICES",
                image_url="https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=80",
                cta_text="Shop Household",
                cta_link="/shop?category=household-products",
                position=HomepageBanner.Position.PROMO_MID,
                display_order=1
            )
            self.stdout.write(self.style.SUCCESS("✓ Homepage banners created."))

        # 3. Categories (Suggested by User specifications)
        categories_data = [
            ("Groceries", "Pantry staples, rice, flour, cooking oil, spices, and cereals", "ShoppingBag"),
            ("Fruits and Vegetables", "Fresh local vegetables, leafy greens, and farm fruits", "Apple"),
            ("Meat and Poultry", "Prime beef, goat meat, chicken, and sausages", "Beef"),
            ("Fish and Seafood", "Fresh tilapia, Nile perch, dried fish, and seafood", "Fish"),
            ("Dairy and Eggs", "Fresh milk, yogurt, butter, cheese, and farm eggs", "Egg"),
            ("Beverages", "Juices, soda, water, tea, coffee, and energy drinks", "Coffee"),
            ("Bakery", "Freshly baked bread, buns, pastries, and cakes", "Croissant"),
            ("Snacks and Confectionery", "Biscuits, crisps, nuts, chocolates, and sweets", "Cookie"),
            ("Household Products", "Kitchen foil, storage containers, trash bags, and utensils", "Home"),
            ("Cleaning Supplies", "Detergents, disinfectants, bleaches, mops, and sponges", "Sparkles"),
            ("Personal Care", "Soaps, shampoo, toothpaste, skincare, and grooming", "HeartHandshake"),
            ("Baby Products", "Diapers, baby formula, wipes, and baby food", "Baby"),
            ("Electronics and Accessories", "Batteries, extension cables, bulbs, and kitchen appliances", "Tv"),
            ("Kitchenware", "Pots, pans, knives, cutlery, and kitchen accessories", "UtensilsCrossed"),
            ("Stationery", "Notebooks, pens, paper, school and office essentials", "BookOpen"),
        ]

        for order, (cat_name, cat_desc, icon) in enumerate(categories_data, start=1):
            Category.objects.get_or_create(
                name=cat_name,
                defaults={
                    "description": cat_desc,
                    "icon_name": icon,
                    "order": order,
                    "is_active": True
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(categories_data)} supermarket categories initialized."))

        # 4. Delivery Zones in Uganda
        delivery_zones_data = [
            ("Kampala Central (CBD, Nakasero, Kololo, Kamwokya)", Decimal('5000.00'), Decimal('20000.00'), Decimal('100000.00'), "1 – 2 hours", False, 1),
            ("Nakawa Division (Ntinda, Bugolobi, Naguru, Kiwatule, Luzira)", Decimal('6000.00'), Decimal('20000.00'), Decimal('100000.00'), "2 – 3 hours", False, 2),
            ("Makindye Division (Kansanga, Muyenga, Ggaba, Kibuli, Nsambya)", Decimal('7000.00'), Decimal('20000.00'), Decimal('120000.00'), "2 – 3 hours", False, 3),
            ("Rubaga Division (Mengo, Lungujja, Namirembe, Nateete, Busega)", Decimal('7000.00'), Decimal('20000.00'), Decimal('120000.00'), "2 – 3 hours", False, 4),
            ("Kawempe Division (Kalerwe, Bwaise, Komamboga, Kisaasi)", Decimal('7000.00'), Decimal('20000.00'), Decimal('120000.00'), "2 – 3 hours", False, 5),
            ("Wakiso & Kira (Kira, Namugongo, Kyaliwajjala, Kyanja, Gayaza)", Decimal('9000.00'), Decimal('30000.00'), Decimal('150000.00'), "3 – 4 hours", False, 6),
            ("Entebbe & Surrounds", Decimal('15000.00'), Decimal('50000.00'), None, "Same day (by 5:00 PM)", False, 7),
            ("In-Store Pickup (Mama Shopping Center - Plot 24 Kampala Rd)", Decimal('0.00'), Decimal('0.00'), None, "Ready in 45 minutes", True, 8),
        ]

        for name, fee, min_order, free_thresh, time_est, is_pickup, ord_num in delivery_zones_data:
            DeliveryZone.objects.get_or_create(
                name=name,
                defaults={
                    "delivery_fee": fee,
                    "min_order_amount": min_order,
                    "free_delivery_threshold": free_thresh,
                    "estimated_delivery_time": time_est,
                    "is_pickup": is_pickup,
                    "order": ord_num,
                    "is_active": True
                }
            )
        self.stdout.write(self.style.SUCCESS(f"✓ {len(delivery_zones_data)} delivery zones initialized."))

        # 5. Payment Methods
        payment_configs = [
            (
                PaymentMethodConfig.MethodType.MTN_MOMO,
                "MTN Mobile Money",
                (
                    "Pay via MTN MoMo Merchant / MoMoPay:\n"
                    "1. Dial *165*3#\n"
                    "2. Enter Merchant Code: 592811 (Mama Shopping Center)\n"
                    "3. Enter Order Total Amount\n"
                    "4. Enter Reference: Your Order Number\n"
                    "5. Enter your MTN MoMo PIN to complete the transaction."
                ),
                "592811",
                "Mama Shopping Center Ltd",
                ""
            ),
            (
                PaymentMethodConfig.MethodType.AIRTEL_MONEY,
                "Airtel Money",
                (
                    "Pay via Airtel Money Merchant Code:\n"
                    "1. Dial *185*9#\n"
                    "2. Enter Merchant Code: 1204892 (Mama Shopping Center)\n"
                    "3. Enter Amount\n"
                    "4. Enter Reference: Your Order Number\n"
                    "5. Enter Airtel Money PIN to confirm."
                ),
                "1204892",
                "Mama Shopping Center Ltd",
                ""
            ),
            (
                PaymentMethodConfig.MethodType.BANK_TRANSFER,
                "Bank Deposit / Direct Transfer",
                (
                    "Transfer directly to Mama Shopping Center bank account:\n"
                    "Bank: Stanbic Bank Uganda\n"
                    "Account Name: Mama Shopping Center Limited\n"
                    "Account Number: 9030018492019\n"
                    "Branch: Forest Mall / Kampala Main Branch\n"
                    "Swift: SBICUGKX\n"
                    "Please use your Order Number as payment reference."
                ),
                "9030018492019",
                "Mama Shopping Center Limited",
                "Stanbic Bank Uganda"
            ),
            (
                PaymentMethodConfig.MethodType.CASH_ON_DELIVERY,
                "Cash on Delivery",
                "Pay with cash directly to our Mama Shopping Center delivery courier upon receiving and inspecting your items.",
                "",
                "Mama Shopping Center Ltd",
                ""
            )
        ]

        for method, display_name, instructions, code, acct_name, bank in payment_configs:
            PaymentMethodConfig.objects.get_or_create(
                method_type=method,
                defaults={
                    "display_name": display_name,
                    "instructions": instructions,
                    "account_number_or_merchant_code": code,
                    "account_name": acct_name,
                    "bank_name": bank,
                    "is_enabled": True
                }
            )
        self.stdout.write(self.style.SUCCESS("✓ Payment methods initialized."))

        # 6. Initial Welcome Coupon
        Coupon.objects.get_or_create(
            code="MAMA10",
            defaults={
                "description": "10% Welcome Discount on your first grocery basket",
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": Decimal('10.00'),
                "min_purchase_amount": Decimal('30000.00'),
                "max_discount_amount": Decimal('20000.00'),
                "max_uses": 500,
                "start_date": timezone.now(),
                "end_date": timezone.now() + timedelta(days=90),
                "is_active": True
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Welcome coupon MAMA10 initialized."))

        # 7. FAQs
        faqs_data = [
            ("How fast is same-day delivery in Kampala?", "Orders confirmed before 6:00 PM are delivered same-day within 2 to 3 hours depending on your division.", "Ordering & Delivery", 1),
            ("What payment options are accepted?", "We accept MTN Mobile Money, Airtel Money, Direct Bank Deposit (Stanbic Bank), and Cash on Delivery.", "Payments", 2),
            ("How do you keep meat and dairy fresh during transit?", "All fresh meats, fish, milk, and frozen products are packed in temperature-controlled cooler boxes with ice packs.", "Product Quality", 3),
            ("Can I pick up my order in person?", "Yes! Choose 'In-Store Pickup' at checkout to collect your packed order from Plot 24 Kampala Road with zero delivery charge.", "Ordering & Delivery", 4),
            ("What if an item is missing or damaged?", "Our delivery riders verify each item with you upon delivery. If any product is unsatisfactory, we replace or refund it immediately.", "Returns & Refunds", 5),
        ]

        for q, a, cat, ord_n in faqs_data:
            FAQ.objects.get_or_create(
                question=q,
                defaults={
                    "answer": a,
                    "category": cat,
                    "order": ord_n,
                    "is_active": True
                }
            )
        self.stdout.write(self.style.SUCCESS("✓ Supermarket FAQs initialized."))

        self.stdout.write(self.style.SUCCESS("\n🎉 Mama Shopping Center initial data successfully seeded!"))
