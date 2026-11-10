from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from apps.catalog.models import Category, Product
from apps.orders.models import DeliveryZone, Cart, CartItem, Order
from apps.promotions.models import Coupon
from apps.inventory.models import StockMovement
from apps.payments.models import PaymentTransaction

User = get_user_model()

class SupermarketWorkflowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # 1. Create test user
        self.user = User.objects.create_user(
            email='customer@example.com',
            password='Password123!',
            first_name='Grace',
            last_name='Nakato',
            phone='+256772123456'
        )

        # 2. Create Category and Product
        self.category = Category.objects.create(name='Dairy and Eggs', slug='dairy-and-eggs')
        self.product = Product.objects.create(
            name='Jesa Fresh Milk 500ml',
            sku='DAI-JES-001',
            category=self.category,
            cost_price=Decimal('2000.00'),
            selling_price=Decimal('2800.00'),
            stock_quantity=50,
            unit=Product.UnitChoice.PACKET
        )

        # 3. Create Delivery Zone
        self.zone = DeliveryZone.objects.create(
            name='Kampala Central',
            delivery_fee=Decimal('5000.00'),
            min_order_amount=Decimal('10000.00'),
            free_delivery_threshold=Decimal('100000.00')
        )

        # 4. Create Coupon
        from django.utils import timezone
        from datetime import timedelta
        self.coupon = Coupon.objects.create(
            code='SAVE10',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('10.00'),
            min_purchase_amount=Decimal('5000.00'),
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30)
        )

    def test_customer_registration_and_login(self):
        # Test Registration
        reg_response = self.client.post('/api/auth/register/', {
            'email': 'newcustomer@example.com',
            'first_name': 'Sarah',
            'last_name': 'Kintu',
            'phone': '+256700112233',
            'password': 'SecurePassword2026!',
            'password_confirm': 'SecurePassword2026!'
        })
        self.assertEqual(reg_response.status_code, 201)
        self.assertIn('tokens', reg_response.data)

        # Test Login
        login_response = self.client.post('/api/auth/login/', {
            'email': 'newcustomer@example.com',
            'password': 'SecurePassword2026!'
        })
        self.assertEqual(login_response.status_code, 200)
        self.assertIn('tokens', login_response.data)

    def test_cart_and_stock_validation(self):
        self.client.force_authenticate(user=self.user)

        # Add item to cart
        add_res = self.client.post('/api/cart/items/', {
            'product_id': self.product.id,
            'quantity': 3
        })
        self.assertEqual(add_res.status_code, 200)
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.total_items, 3)

        # Test stock ceiling (try to add 100 when only 50 available)
        oversell_res = self.client.post('/api/cart/items/', {
            'product_id': self.product.id,
            'quantity': 100
        })
        self.assertEqual(oversell_res.status_code, 200)
        # Should clamp to max stock 50
        item = CartItem.objects.get(cart=cart, product=self.product)
        self.assertEqual(item.quantity, 50)

    def test_atomic_order_creation_and_stock_deduction(self):
        self.client.force_authenticate(user=self.user)

        # Setup cart with 5 units
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=5)

        initial_stock = self.product.stock_quantity  # 50

        # Place Order
        order_res = self.client.post('/api/orders/create/', {
            'delivery_zone_id': self.zone.id,
            'delivery_type': 'delivery',
            'recipient_name': 'Grace Nakato',
            'recipient_phone': '+256772123456',
            'street_address': 'Plot 10 Kampala Rd',
            'division_or_area': 'Central',
            'city': 'Kampala',
            'payment_method': 'mtn_momo',
            'coupon_code': 'SAVE10'
        })

        self.assertEqual(order_res.status_code, 201)
        order_number = order_res.data['order_number']
        order = Order.objects.get(order_number=order_number)

        # 1. Verify stock deduction
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock - 5)

        # 2. Verify StockMovement was recorded
        movement = StockMovement.objects.filter(product=self.product, reference_no=order_number).first()
        self.assertIsNotNone(movement)
        self.assertEqual(movement.movement_type, StockMovement.MovementType.SALE)
        self.assertEqual(movement.quantity, -5)

        # 3. Verify PaymentTransaction was generated in PENDING state
        txn = PaymentTransaction.objects.filter(order=order).first()
        self.assertIsNotNone(txn)
        self.assertEqual(txn.status, PaymentTransaction.Status.PENDING)

        # 4. Verify Cart was cleared
        self.assertEqual(cart.items.count(), 0)

        # 5. Test Customer Order Cancellation restores inventory
        cancel_res = self.client.post(f'/api/orders/{order_number}/cancel/', {
            'reason': 'Changed mind'
        })
        self.assertEqual(cancel_res.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock)
