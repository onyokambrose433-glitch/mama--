# MAMA SHOPPING CENTER
## Complete Commercial Supermarket E-Commerce Website & Operations System

**Mama Shopping Center** is a single-owner supermarket e-commerce platform and operational inventory management system designed for supermarket retail operations in Uganda.

Only **Mama Shopping Center** sells products through this platform. Customers purchase directly from the supermarket's own inventory with same-day delivery across Kampala, Wakiso, and Entebbe, or free in-store pickup at Plot 24 Kampala Road.

---

## 1. Brand Identity & Design System

The system strictly follows Mama Shopping Center's brand palette:

- **Primary Orange**: `#E15712` (Buttons, header accents, brand markers)
- **Secondary Blue**: `#2FA0E1` (Trust badges, links, active selections)
- **Deep Orange**: `#FF550D` (Discount badges, cart notifications)
- **Neutral White & Slate**: Crisp, clean supermarket aesthetic, high-contrast typography, no neon gradients or AI clichés.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom supermarket theme variables
- **Icons**: Lucide Icons
- **Routing**: React Router v7 (SPA routing configured with `vercel.json`)
- **State & HTTP**: Context API (Auth, Cart), Axios with automatic JWT token refresh interceptor

### Backend
- **Framework**: Python 3.13 / Django 5+ / Django REST Framework
- **Authentication**: SimpleJWT (Access + Refresh tokens with custom claims)
- **Concurrency & Transactions**: Atomic database transactions (`transaction.atomic()`, `select_for_update()`) to prevent overselling and duplicate payments
- **Static & Media**: WhiteNoise for static assets, local media storage with Cloudinary support
- **Reports**: OpenPyXL for Excel exports, ReportLab for PDF receipt generation

### Database
- **Engine**: PostgreSQL (Production on Render / Neon / Supabase)
- **Development**: Seamless fallback to SQLite if `DATABASE_URL` is unset, or direct PostgreSQL connection via `dj-database-url`

---

## 3. Core Capabilities & Architecture

### A. Public Supermarket Experience
1. **Dynamic Top Announcement Bar**: Displays operating hours, phone numbers, and live free delivery threshold announcements.
2. **Header with Live Search**: Real-time auto-suggestions queried against `/api/products/search-suggestions/`.
3. **Live Slide-over Cart Drawer**: Interactive item updates, instant coupon validation, subtotal, and stock ceiling validation.
4. **Homepage Showcase**: Dynamic hero carousel, 15 authentic category aisles, featured products, best-sellers, weekly discount offers, and customer trust guarantees.
5. **Shop Catalog**: Multi-attribute filtering (category, price in UGX, brand, stock availability, discount tags) and sorting (Price Low-to-High, Price High-to-Low, Newest, Best Selling).
6. **Product Detail**: Multi-image thumbnail gallery, specifications table, stock indicator, quantity selector, delivery information, and genuine customer reviews tab.

### B. Customer Authentication & Checkout
1. **Open Browsing**: Customers can freely browse all products, categories, and prices without logging in.
2. **Protected Checkout Interception**: Clicking "Proceed to Checkout" smoothly redirects unauthenticated visitors to `/login?redirect=/checkout` while preserving all cart items.
3. **4-Step Checkout**:
   - **Step 1**: Delivery Address & Recipient (Select saved address or enter new address: Full Name, Phone, Street, Division/Area in Kampala, Landmark directions).
   - **Step 2**: Delivery Zone Selection (Kampala Central, Nakawa, Makindye, Rubaga, Kawempe, Kira/Wakiso, Entebbe, or Free In-Store Pickup).
   - **Step 3**: Payment Channel Selection (MTN Mobile Money, Airtel Money, Bank Deposit, Cash on Delivery).
   - **Step 4**: Review & Order Confirmation.
4. **Atomic Placement**: Orders are placed with unique reference (e.g. `MAMA-20261110-XXXXXX`), stock is deducted immediately, and `StockMovement` of type `SALE` is recorded.

### C. Dedicated Operations & Admin Portal (`/admin-portal`)
Accessible to authorized staff roles (**Super Administrator, Store Manager, Inventory Manager, Order Manager, Accountant, Delivery Manager**):
1. **Overview Dashboard**: Real database metrics (Total sales in UGX, today's sales, monthly sales, order counts, customer count, low-stock alerts, 14-day sales trend chart).
2. **Product Management**: Full CRUD, image upload, price & discount configuration, unit settings, stock threshold, active/featured status.
3. **Inventory Management**: Stock level monitoring, Stock Take & Adjustment modal (Stock In, Damaged, Expired, Count Take), and audit movement history ledger.
4. **Order Management**: Status transitions (Pending, Confirmed, Packed, Out for Delivery, Delivered, Cancelled), courier assignment, invoice printing.
5. **Customer Management**: Registered customer directory, purchase history, activate/suspend account toggles.
6. **Promotion Management**: Coupon code engine (percentage or fixed amount in UGX, minimum order spend, expiration dates, usage limits).
7. **Delivery Management**: Zone tariff configuration, fees in UGX, free delivery thresholds.
8. **Payment Management**: Transaction verification, mobile money reference confirmation, refund processing.
9. **Website Content CMS**: Dynamic supermarket name, contact numbers, physical store address, policies, and homepage banners.
10. **Financial Profit & Loss Reports**: Calculates **Real Net Profit** using actual product costs (`cost_price` × quantity) and recorded store operating expenses (Rent, Utilities, Fuel, Packaging, Salaries).
11. **Staff & Role Management**: Super Admin controls staff user accounts and permissions with activity audit logs.

---

## 4. Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Activate virtual environment
# Windows:
..\venv\Scripts\activate
# Mac/Linux:
source ../venv/bin/activate

# Install requirements (already installed in venv)
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed foundational supermarket settings, categories, delivery zones, and payment channels
python manage.py seed_initial_data

# Seed authentic supermarket grocery catalog (optional starter inventory)
python manage.py seed_catalog

# Create or verify initial Super Administrator
python manage.py create_superadmin

# Start Django development server
python manage.py runserver
```

Backend will be running at `http://127.0.0.1:8000/`.

### 2. Frontend Setup
```bash
# Navigate to frontend in a new terminal
cd frontend

# Install dependencies (already installed)
npm install

# Start Vite development server
npm run dev
```

Frontend will be running at `http://localhost:5173/`.

### 3. Default Administrative Credentials
- **URL**: `http://localhost:5173/admin-portal` (or `http://127.0.0.1:8000/django-admin/`)
- **Email**: `admin@mamashoppingcenter.com`
- **Password**: `MamaAdmin2026!`

---

## 5. Production Deployment Guide

### A. Deploy Backend to Render

1. Create a **PostgreSQL Database** on Render:
   - Name: `mama-supermarket-db`
   - Plan: Starter
   - Copy the **Internal Database URL** (`postgres://...`).
2. Create a **Web Service** on Render:
   - Connect your Git repository.
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `./build.sh`
   - Start Command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
3. Configure Environment Variables in Render:
   - `SECRET_KEY`: (auto-generated or custom strong secret)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.onrender.com,localhost`
   - `DATABASE_URL`: (Paste Render PostgreSQL connection string)
   - `ADMIN_EMAIL`: `admin@mamashoppingcenter.com`
   - `ADMIN_PASSWORD`: (Set a strong administrator password)
   - `TIME_ZONE`: `Africa/Kampala`

The `./build.sh` script automatically runs `pip install`, `collectstatic`, `migrate`, `seed_initial_data`, and `create_superadmin`.

### B. Deploy Frontend to Vercel

1. Import your Git repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Configure Environment Variables:
   - `VITE_API_URL`: `https://your-backend-app.onrender.com/api`
5. Deploy. `frontend/vercel.json` ensures all SPA routes (`/shop`, `/checkout`, `/account`, `/admin-portal`) resolve without 404 errors.

---

## 6. Uganda Payment Gateway Integration

### MTN Mobile Money & Airtel Money
The payment architecture supports direct integration with Uganda Mobile Money gateways:
- **MTN MoMo Open API** (`/collection/v1_0/requesttopay`)
- **Flutterwave Uganda** (`mobilemoneyuganda`)
- **Beyonic / DusuPay**

The webhook endpoint is located at `POST /api/payments/webhook/`. When the gateway sends a payment callback with `status: successful` and the matching transaction reference (`MAMA-XXXX`), the system automatically marks the transaction as `SUCCESS`, changes order payment status to `PAID`, updates order status to `CONFIRMED`, and logs the audit event.

---

## 7. Dual Mobile & Web Application Architecture

Mama Shopping Center is built to operate simultaneously as a **Responsive Web Application** (Desktop & Tablets) and an **Installable Mobile Application** (Android & iOS).

### A. Mobile UI & Experience Features
1. **Mobile Bottom Navigation Bar**: A fixed supermarket navigation bar at the bottom of mobile screens:
   - 🏠 **Home**: Quick return to the hero promotions and featured shelves.
   - 🗂️ **Aisles**: Instant access to all 15 grocery and butchery categories.
   - 🛒 **Floating Basket**: Elevated quick-cart button displaying real-time item count and total in UGX.
   - 🔍 **Track**: Live one-tap order tracking.
   - 👤 **Account / Sign In**: Profile, order history, and saved addresses.
2. **Mobile App Header**: Compact layout with an integrated quick search bar and brand insignia.
3. **PWA Install Banner**: Automatically prompts mobile visitors with an "Install Mama App" banner for one-tap home screen installation.

### B. Native Android App (Capacitor)
The complete native Android project is generated in `frontend/android/` with:
- `package: com.mamashoppingcenter.app`
- Native Android Gradle configuration (`frontend/android/build.gradle` & `app/build.gradle`)
- Native splash screen and status bar configured with Mama primary orange (`#E15712`).

#### Opening and Building the Native Mobile App:
```bash
# Navigate to frontend
cd frontend

# Build web assets and sync with native Android project
npm run mobile:sync

# Open directly in Android Studio
npm run mobile:open

# Or build the debug APK directly from command line (requires Android SDK):
cd android
./gradlew assembleDebug
```
The resulting `.apk` will be generated at `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

### C. Progressive Web App (PWA)
- **Manifest**: Located at `frontend/public/manifest.json` with standalone display mode.
- **Service Worker**: Located at `frontend/public/sw.js` for fast caching and offline resilience.
- **iOS Safari Support**: Configured with `apple-mobile-web-app-capable` and apple touch icons. Any customer visiting on iPhone can tap "Share ➔ Add to Home Screen" to install it as an app.

