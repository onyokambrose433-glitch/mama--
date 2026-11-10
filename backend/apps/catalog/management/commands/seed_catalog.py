from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.catalog.models import Category, Brand, Product, ProductImage
from apps.inventory.models import StockMovement

class Command(BaseCommand):
    help = 'Seeds authentic supermarket products with genuine Ugandan grocery details, prices, and stock.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding authentic supermarket stock...")

        # Brands
        brands_data = ["Jesa Farm", "Lato Dairy", "Pearl Rice", "Supreme", "Maganjo", "Mukwano", "Rwenzori", "Coca-Cola", "Omo", "Sunlight", "Local Farm Fresh"]
        brands = {}
        for b in brands_data:
            brand_obj, _ = Brand.objects.get_or_create(name=b)
            brands[b] = brand_obj

        # Authentic Products
        products = [
            # Dairy
            {
                "name": "Jesa Fresh Whole Milk 500ml",
                "sku": "DAI-JES-001",
                "category": "Dairy and Eggs",
                "brand": "Jesa Farm",
                "cost_price": Decimal("2200.00"),
                "selling_price": Decimal("2800.00"),
                "discount_price": Decimal("2500.00"),
                "unit": Product.UnitChoice.PACKET,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 48,
                "low_stock_threshold": 10,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Pure pasteurized fresh whole milk from Jesa Farm Dairy. Rich in calcium and natural proteins. Keep refrigerated below 4°C.",
                "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
                "specs": {"Volume": "500 ml", "Fat Content": "3.5%", "Origin": "Busunju, Uganda", "Shelf Life": "7 Days refrigerated"}
            },
            {
                "name": "Lato UHT Long Life Whole Milk 1 Litre",
                "sku": "DAI-LAT-002",
                "category": "Dairy and Eggs",
                "brand": "Lato Dairy",
                "cost_price": Decimal("4000.00"),
                "selling_price": Decimal("5000.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.CARTON,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 36,
                "low_stock_threshold": 8,
                "is_featured": True,
                "is_bestseller": False,
                "description": "UHT homogenized full cream milk in a convenient 1 Litre Tetra Pak. Does not require refrigeration until opened.",
                "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
                "specs": {"Volume": "1000 ml", "Storage": "Store in cool dry place", "Origin": "Mbarara, Uganda"}
            },
            {
                "name": "Farm Fresh Grade A Eggs (Tray of 30)",
                "sku": "DAI-EGG-030",
                "category": "Dairy and Eggs",
                "brand": "Local Farm Fresh",
                "cost_price": Decimal("12500.00"),
                "selling_price": Decimal("16000.00"),
                "discount_price": Decimal("14500.00"),
                "unit": Product.UnitChoice.CARTON,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 25,
                "low_stock_threshold": 5,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Clean, large, farm-fresh brown eggs directly sourced from inspected commercial poultry farms in Wakiso.",
                "image_url": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
                "specs": {"Quantity": "30 Eggs", "Grade": "Grade A Large", "Origin": "Wakiso, Uganda"}
            },
            # Groceries
            {
                "name": "Pearl Super Basmati Rice 2kg",
                "sku": "GRO-PRL-002",
                "category": "Groceries",
                "brand": "Pearl Rice",
                "cost_price": Decimal("13000.00"),
                "selling_price": Decimal("16500.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.PACKET,
                "unit_value": Decimal("2.00"),
                "stock_quantity": 40,
                "low_stock_threshold": 10,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Extra-long grain aromatic basmati rice. Non-sticky, fragrant, and carefully de-stoned for royal rice dishes and pilau.",
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
                "specs": {"Weight": "2 kg", "Grain Type": "Long Grain Basmati", "Origin": "Uganda"}
            },
            {
                "name": "Fortune Butto Refined Vegetable Cooking Oil 1 Litre",
                "sku": "GRO-OIL-001",
                "category": "Groceries",
                "brand": "Mukwano",
                "cost_price": Decimal("7500.00"),
                "selling_price": Decimal("9500.00"),
                "discount_price": Decimal("8900.00"),
                "unit": Product.UnitChoice.BOTTLE,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 50,
                "low_stock_threshold": 12,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Double-refined pure vegetable palm cooking oil enriched with Vitamin A. Cholestrol free, ideal for frying and cooking.",
                "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
                "specs": {"Volume": "1 Litre", "Enriched with": "Vitamin A", "Cholesterol": "0 mg"}
            },
            {
                "name": "Supreme All-Purpose Baking Flour 2kg",
                "sku": "GRO-FLR-002",
                "category": "Groceries",
                "brand": "Supreme",
                "cost_price": Decimal("6800.00"),
                "selling_price": Decimal("8500.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.PACKET,
                "unit_value": Decimal("2.00"),
                "stock_quantity": 30,
                "low_stock_threshold": 6,
                "is_featured": False,
                "is_bestseller": False,
                "description": "Finely milled pure wheat flour. Ideal for chapati, mandazi, cakes, bread, and pastries.",
                "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
                "specs": {"Weight": "2 kg", "Ingredients": "100% Wheat", "Manufacturer": "Bakhresa Group"}
            },
            # Meat and Poultry
            {
                "name": "Prime Beef Steak (Boneless) 1kg",
                "sku": "MEA-BF-001",
                "category": "Meat and Poultry",
                "brand": "Local Farm Fresh",
                "cost_price": Decimal("16000.00"),
                "selling_price": Decimal("22000.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.KG,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 18,
                "low_stock_threshold": 4,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Tender, boneless fresh beef cut from grass-fed cattle. Hand-inspected and prepared by our in-house butcher.",
                "image_url": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80",
                "specs": {"Weight": "1 kg", "Cut": "Top Sirloin / Tenderloin", "Halal Certified": "Yes"}
            },
            {
                "name": "Fresh Cleaned Whole Chicken 1.2kg",
                "sku": "MEA-CHK-001",
                "category": "Meat and Poultry",
                "brand": "Local Farm Fresh",
                "cost_price": Decimal("14000.00"),
                "selling_price": Decimal("19000.00"),
                "discount_price": Decimal("17500.00"),
                "unit": Product.UnitChoice.PIECE,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 20,
                "low_stock_threshold": 5,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Dressed, cleaned, and chilled whole broiler chicken. Perfect for roasting, stewing, or barbecuing.",
                "image_url": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80",
                "specs": {"Average Weight": "1.2 kg - 1.4 kg", "State": "Chilled / Fresh", "Halal": "Yes"}
            },
            # Fruits and Vegetables
            {
                "name": "Fresh Organic Red Onions 1kg",
                "sku": "VEG-ON-001",
                "category": "Fruits and Vegetables",
                "brand": "Local Farm Fresh",
                "cost_price": Decimal("3000.00"),
                "selling_price": Decimal("4500.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.KG,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 45,
                "low_stock_threshold": 10,
                "is_featured": False,
                "is_bestseller": True,
                "description": "Crisp and flavorful locally grown red bulb onions. Well-dried and selected for long pantry shelf life.",
                "image_url": "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
                "specs": {"Weight": "1 kg", "Origin": "Kabale / Mbale, Uganda"}
            },
            {
                "name": "Ripe Salad Tomatoes 1kg",
                "sku": "VEG-TOM-001",
                "category": "Fruits and Vegetables",
                "brand": "Local Farm Fresh",
                "cost_price": Decimal("3200.00"),
                "selling_price": Decimal("5000.00"),
                "discount_price": Decimal("4200.00"),
                "unit": Product.UnitChoice.KG,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 30,
                "low_stock_threshold": 8,
                "is_featured": True,
                "is_bestseller": True,
                "description": "Firm, juicy, vine-ripened red tomatoes. Ideal for salads, stews, sauces, and sandwiches.",
                "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
                "specs": {"Weight": "1 kg", "Origin": "Mukono, Uganda"}
            },
            # Beverages
            {
                "name": "Rwenzori Pure Natural Mineral Water 1.5L",
                "sku": "BEV-RWZ-015",
                "category": "Beverages",
                "brand": "Rwenzori",
                "cost_price": Decimal("1500.00"),
                "selling_price": Decimal("2200.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.BOTTLE,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 60,
                "low_stock_threshold": 15,
                "is_featured": False,
                "is_bestseller": True,
                "description": "Refreshing mineral drinking water sourced from the natural springs of the Rwenzori mountains.",
                "image_url": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
                "specs": {"Volume": "1.5 Litres", "Packaging": "Recyclable PET bottle"}
            },
            {
                "name": "Coca-Cola Original Taste 500ml",
                "sku": "BEV-COK-005",
                "category": "Beverages",
                "brand": "Coca-Cola",
                "cost_price": Decimal("1400.00"),
                "selling_price": Decimal("2000.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.BOTTLE,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 48,
                "low_stock_threshold": 12,
                "is_featured": False,
                "is_bestseller": True,
                "description": "Classic crisp Coca-Cola sparkling soda in a handy resealable 500ml plastic bottle.",
                "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
                "specs": {"Volume": "500 ml", "Serve": "Best served chilled"}
            },
            # Cleaning Supplies
            {
                "name": "Omo Fast Action Hand Washing Powder 1kg",
                "sku": "CLN-OMO-001",
                "category": "Cleaning Supplies",
                "brand": "Omo",
                "cost_price": Decimal("8200.00"),
                "selling_price": Decimal("10500.00"),
                "discount_price": Decimal("9800.00"),
                "unit": Product.UnitChoice.PACKET,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 30,
                "low_stock_threshold": 6,
                "is_featured": True,
                "is_bestseller": False,
                "description": "High-efficiency laundry washing powder formulated to remove tough grease, oil, and mud stains in one wash.",
                "image_url": "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80",
                "specs": {"Weight": "1 kg", "Usage": "Hand wash & Machine wash"}
            },
            {
                "name": "Sunlight Lemon Fresh Dishwashing Liquid 750ml",
                "sku": "CLN-SUN-750",
                "category": "Cleaning Supplies",
                "brand": "Sunlight",
                "cost_price": Decimal("5800.00"),
                "selling_price": Decimal("7500.00"),
                "discount_price": None,
                "unit": Product.UnitChoice.BOTTLE,
                "unit_value": Decimal("1.00"),
                "stock_quantity": 35,
                "low_stock_threshold": 8,
                "is_featured": False,
                "is_bestseller": False,
                "description": "Real lemon juice degreasing dishwashing liquid. Dissolves stubborn kitchen grease leaving plates sparkling clean and fresh.",
                "image_url": "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
                "specs": {"Volume": "750 ml", "Scent": "Lemon Fresh"}
            }
        ]

        for p in products:
            cat_obj = Category.objects.filter(name=p["category"]).first()
            if not cat_obj:
                continue

            brand_obj = brands.get(p["brand"])
            img_url = p.pop("image_url")
            specs = p.pop("specs", {})

            product_obj, created = Product.objects.get_or_create(
                sku=p["sku"],
                defaults={
                    "name": p["name"],
                    "category": cat_obj,
                    "brand": brand_obj,
                    "cost_price": p["cost_price"],
                    "selling_price": p["selling_price"],
                    "discount_price": p["discount_price"],
                    "unit": p["unit"],
                    "unit_value": p["unit_value"],
                    "stock_quantity": p["stock_quantity"],
                    "low_stock_threshold": p["low_stock_threshold"],
                    "is_featured": p["is_featured"],
                    "is_bestseller": p["is_bestseller"],
                    "description": p["description"],
                    "specifications": specs,
                    "is_active": True
                }
            )

            # Add primary product image
            if not product_obj.images.exists():
                ProductImage.objects.create(
                    product=product_obj,
                    image_url=img_url,
                    is_feature=True,
                    display_order=1
                )

            # Record initial stock in inventory
            if created and not product_obj.stock_movements.exists():
                StockMovement.objects.create(
                    product=product_obj,
                    movement_type=StockMovement.MovementType.STOCK_IN,
                    quantity=product_obj.stock_quantity,
                    previous_stock=0,
                    new_stock=product_obj.stock_quantity,
                    unit_cost=product_obj.cost_price,
                    reference_no="INIT-STOCK-2026",
                    notes="Initial warehouse inventory intake"
                )

        self.stdout.write(self.style.SUCCESS(f"✓ Initialized {len(products)} authentic supermarket items with inventory records!"))
