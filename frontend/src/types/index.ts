export type UserRole =
  | 'super_admin'
  | 'store_manager'
  | 'inventory_manager'
  | 'order_manager'
  | 'accountant'
  | 'delivery_manager'
  | 'customer';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  is_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface Address {
  id: number;
  full_name: string;
  phone_number: string;
  street_address: string;
  division_or_area: string;
  city: string;
  delivery_instructions?: string;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  image_url?: string;
  icon_name?: string;
  parent?: number | null;
  order: number;
  is_active: boolean;
  subcategories?: {
    id: number;
    name: string;
    slug: string;
    order: number;
    products_count: number;
  }[];
  products_count: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  logo_url?: string;
  is_active: boolean;
  products_count: number;
}

export interface ProductImage {
  id: number;
  image?: string;
  image_url?: string;
  url: string;
  is_feature: boolean;
  display_order: number;
}

export interface ProductReview {
  id: number;
  product: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: number;
  category_name: string;
  category_slug: string;
  brand?: number | null;
  brand_name?: string;
  description: string;
  cost_price?: string;
  selling_price: string;
  discount_price?: string | null;
  current_price: string;
  has_discount: boolean;
  discount_percentage: number;
  unit: string;
  unit_value: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  primary_image_url?: string;
  average_rating: number;
  review_count: number;
  specifications?: Record<string, string>;
  barcode?: string;
  images?: ProductImage[];
  reviews?: ProductReview[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: string;
  total_items: number;
  updated_at: string;
}

export interface DeliveryZone {
  id: number;
  name: string;
  description: string;
  delivery_fee: string;
  min_order_amount: string;
  free_delivery_threshold?: string | null;
  estimated_delivery_time: string;
  is_active: boolean;
  is_pickup: boolean;
  order: number;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  unit: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface OrderStatusHistory {
  id: number;
  status: string;
  comment: string;
  updated_by_name?: string;
  timestamp: string;
}

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'confirmed'
  | 'packed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethodType = 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'cash_on_delivery';

export interface Order {
  id: number;
  order_number: string;
  user: number;
  status: OrderStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_status_display: string;
  payment_method: PaymentMethodType;
  payment_method_display: string;
  delivery_zone?: number;
  delivery_zone_name?: string;
  delivery_type: 'delivery' | 'pickup';
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  street_address: string;
  division_or_area: string;
  city: string;
  delivery_instructions?: string;
  subtotal: string;
  discount_amount: string;
  delivery_fee: string;
  total_amount: string;
  assigned_rider?: number | null;
  assigned_rider_name?: string;
  internal_notes?: string;
  cancel_reason?: string;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodConfig {
  id: number;
  method_type: PaymentMethodType;
  display_name: string;
  is_enabled: boolean;
  instructions: string;
  account_number_or_merchant_code?: string;
  account_name?: string;
  bank_name?: string;
}

export interface WebsiteSettings {
  id: number;
  supermarket_name: string;
  tagline: string;
  logo?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_phone: string;
  primary_email: string;
  physical_address: string;
  business_hours: string;
  announcement_text: string;
  announcement_is_active: boolean;
  free_delivery_threshold: string;
  about_us: string;
  delivery_policy: string;
  terms_and_conditions: string;
  privacy_policy: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
}

export interface HomepageBanner {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  image?: string;
  image_url?: string;
  cta_text: string;
  cta_link: string;
  position: 'hero' | 'promo_mid' | 'promo_bottom';
  display_order: number;
  is_active: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_purchase_amount: string;
  max_discount_amount?: string | null;
  max_uses?: number | null;
  times_used: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface StockMovement {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  movement_type: string;
  movement_type_display: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost: string;
  reference_no: string;
  batch_no: string;
  expiry_date?: string | null;
  notes: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface Expense {
  id: number;
  category: string;
  category_display: string;
  title: string;
  amount: string;
  expense_date: string;
  notes: string;
  receipt_reference: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_sales: number;
  today_sales: number;
  monthly_sales: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  registered_customers: number;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}
