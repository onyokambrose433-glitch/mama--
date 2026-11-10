import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { InstallAppBanner } from './components/common/InstallAppBanner';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PolicyPage } from './pages/PolicyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { DownloadAppPage } from './pages/DownloadAppPage';
import { WebsiteSettings } from './types';
import apiClient from './api/client';
import { X, ShoppingBag, Grid, Percent } from 'lucide-react';

const AppContent: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get<WebsiteSettings>('/settings/');
        setSettings(res.data);
      } catch {
        // Fallback default
      }
    };
    fetchSettings();
  }, []);

  const isAdminPortal = location.pathname.startsWith('/admin-portal');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* If not in admin portal, display public header, announcement bar, navbar */}
      {!isAdminPortal && (
        <>
          <InstallAppBanner />
          <AnnouncementBar settings={settings} />
          <Header
            settings={settings}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <Navbar />
        </>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && !isAdminPortal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="Mama Supermarket"
                    className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain border border-slate-100 shadow-xs"
                  />
                  <span className="font-black text-sm text-slate-900">MAMA SUPERMARKET</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <nav className="space-y-2 text-sm font-semibold">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-orange-50 hover:text-[#E15712]"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-orange-50 hover:text-[#E15712]"
                >
                  Shop All Groceries
                </Link>
                <Link
                  to="/shop?has_discount=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#FF550D] hover:bg-orange-50 font-bold"
                >
                  Special Offers & Deals
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-orange-50 hover:text-[#E15712]"
                >
                  Track Order
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-orange-50 hover:text-[#E15712]"
                >
                  About Mama
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-orange-50 hover:text-[#E15712]"
                >
                  Contact Support
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-800 hover:bg-orange-50 hover:text-[#E15712]"
                >
                  My Customer Account
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
              <p>Plot 24, Kampala Road, Uganda</p>
              <p className="mt-1 font-semibold text-[#E15712]">+256 700 892 100</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Routing */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/about" element={<AboutPage settings={settings} />} />
          <Route path="/contact" element={<ContactPage settings={settings} />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/delivery-policy" element={<PolicyPage settings={settings} />} />
          <Route path="/terms" element={<PolicyPage settings={settings} />} />
          <Route path="/privacy" element={<PolicyPage settings={settings} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/download-app" element={<DownloadAppPage />} />
          <Route path="/app" element={<DownloadAppPage />} />
          <Route path="/admin-portal" element={<AdminPortalPage />} />
        </Routes>
      </div>

      {/* Slide-over Cart Drawer */}
      {!isAdminPortal && <CartDrawer />}

      {/* Footer */}
      {!isAdminPortal && <Footer settings={settings} />}

      {/* Mobile App Bottom Navigation Bar */}
      {!isAdminPortal && <MobileBottomBar />}

    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-xl space-y-4">
            <img src="/logo.png" alt="Mama Supermarket" className="w-16 h-16 mx-auto object-contain rounded-2xl p-1 border border-slate-100 shadow-xs" />
            <h2 className="text-xl font-black text-slate-900">Mama Shopping Center</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We encountered a temporary display issue while refreshing live data.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-slate-100 rounded-xl text-[10px] text-red-600 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="w-full py-3 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Reload Supermarket Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
