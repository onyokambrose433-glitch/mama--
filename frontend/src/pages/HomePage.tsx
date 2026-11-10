import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Sparkles,
  Percent,
  ChevronRight,
  CheckCircle,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';
import { Product, Category, HomepageBanner } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { formatUGX } from '../utils/format';
import apiClient from '../api/client';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, categoriesRes, featuredRes, bestsellerRes, discountRes] = await Promise.all([
          apiClient.get<any>('/banners/'),
          apiClient.get<any>('/categories/'),
          apiClient.get<any>('/products/?featured=true'),
          apiClient.get<any>('/products/?bestseller=true'),
          apiClient.get<any>('/products/?has_discount=true'),
        ]);

        setBanners(ensureArray(bannersRes.data));
        setCategories(ensureArray(categoriesRes.data));
        setFeaturedProducts(ensureArray(featuredRes.data));
        setBestsellerProducts(ensureArray(bestsellerRes.data));
        setDiscountProducts(ensureArray(discountRes.data));
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroBanners = Array.isArray(banners) ? banners.filter((b) => b && b.position === 'hero') : [];
  const currentHero = heroBanners[activeBannerIndex] || heroBanners[0];
  const midBanner = Array.isArray(banners) ? banners.find((b) => b && b.position === 'promo_mid') : undefined;

  // Hero carousel auto-rotate
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. HERO CAROUSEL */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {currentHero ? (
          <div className="relative min-h-[460px] sm:min-h-[520px] flex items-center">
            {/* Background image overlay */}
            <div className="absolute inset-0 z-0">
              {currentHero.image_url ? (
                <img
                  src={currentHero.image_url}
                  alt={currentHero.title}
                  className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            </div>

            {/* Hero Text Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-2xl">
              {currentHero.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#E15712] text-white shadow-sm mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentHero.badge}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {currentHero.title}
              </h1>
              <p className="mt-4 text-sm sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                {currentHero.subtitle}
              </p>
              
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to={currentHero.cta_link || '/shop'}
                  className="px-7 py-3.5 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold text-sm rounded-full flex items-center gap-2 shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  <span>{currentHero.cta_text || 'Start Shopping'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop?has_discount=true"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full backdrop-blur-xs transition-colors flex items-center gap-2"
                >
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>View Special Offers</span>
                </Link>
              </div>

              {/* Delivery callout badge */}
              <div className="mt-8 flex items-center gap-3 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Same-Day Kampala Delivery
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <CheckCircle className="w-4 h-4" />
                  MTN & Airtel MoMo Accepted
                </span>
              </div>
            </div>

            {/* Carousel indicators */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeBannerIndex ? 'w-8 bg-[#E15712]' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h1 className="text-3xl font-black">Mama Shopping Center</h1>
          </div>
        )}
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#E15712] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Swift 2-Hour Delivery</h3>
              <p className="text-xs text-slate-500 mt-0.5">Across Kampala Central, Nakawa, Kira & Entebbe.</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#2FA0E1] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">100% Genuine Supermarket</h3>
              <p className="text-xs text-slate-500 mt-0.5">Single owner. Only Mama sells on this platform.</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Uganda Mobile Money</h3>
              <p className="text-xs text-slate-500 mt-0.5">MTN MoMo, Airtel Money, Bank Deposit & COD.</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Freshness Guaranteed</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily butcher cuts, dairy products, & fresh greens.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SHOP BY CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E15712]">Explore Aisles</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Shop by Supermarket Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-[#2FA0E1] hover:underline flex items-center gap-1"
          >
            <span>View All Aisles</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50/70 text-[#E15712] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#E15712] group-hover:text-white transition-all shadow-xs mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#E15712] transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {cat.products_count} item{cat.products_count === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2FA0E1]">Handpicked For You</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Featured Supermarket Items
              </h2>
            </div>
            <Link
              to="/shop?featured=true"
              className="text-xs sm:text-sm font-bold text-[#E15712] hover:underline flex items-center gap-1"
            >
              <span>View More</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. PROMOTIONAL MID BANNER */}
      {midBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 to-[#FF550D] text-white p-8 sm:p-12 shadow-lg">
            <div className="relative z-10 max-w-xl">
              {midBanner.badge && (
                <span className="px-3 py-1 rounded-full bg-white text-[#E15712] font-black text-xs uppercase tracking-wider mb-4 inline-block shadow-xs">
                  {midBanner.badge}
                </span>
              )}
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                {midBanner.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-orange-100 leading-relaxed">
                {midBanner.subtitle}
              </p>
              <div className="mt-6">
                <Link
                  to={midBanner.cta_link || '/shop'}
                  className="px-6 py-3 bg-white text-slate-900 hover:bg-orange-50 font-bold text-xs sm:text-sm rounded-full inline-flex items-center gap-2 shadow-md transition-all"
                >
                  <span>{midBanner.cta_text || 'Explore Offers'}</span>
                  <ArrowRight className="w-4 h-4 text-[#E15712]" />
                </Link>
              </div>
            </div>
            {midBanner.image_url && (
              <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
                <img
                  src={midBanner.image_url}
                  alt={midBanner.title}
                  className="w-full h-full object-cover opacity-35 mask-radial"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. BEST-SELLING PRODUCTS */}
      {bestsellerProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Customer Favorites</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Best-Selling Groceries
              </h2>
            </div>
            <Link
              to="/shop?bestseller=true"
              className="text-xs sm:text-sm font-bold text-[#2FA0E1] hover:underline flex items-center gap-1"
            >
              <span>See Best Sellers</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestsellerProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. SPECIAL OFFERS & DISCOUNTS */}
      {discountProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-orange-50/50 rounded-3xl border border-orange-200/80">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#FF550D]">
                  <Tag className="w-3.5 h-3.5" />
                  Limited-Time Reductions
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Weekly Supermarket Discounts
                </h2>
              </div>
              <Link
                to="/shop?has_discount=true"
                className="text-xs sm:text-sm font-bold text-[#E15712] hover:underline flex items-center gap-1"
              >
                <span>All Deals</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {discountProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. WHY SHOP WITH US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2FA0E1]">Supermarket Standards</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-white">
              Why Kampala Families Trust Mama Shopping Center
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Unlike multivendor platforms where independent sellers ship from unverified sources, Mama Shopping Center manages every step. From direct farm sourcing in Wakiso to temperature-controlled chilled packing, you receive exactly what you ordered.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E15712] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Stock Control</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Real warehouse inventory. No substitute surprises.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#2FA0E1] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Cold-Chain Preserved</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Dairy and butchery meats travel in insulated coolers.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Fair Supermarket Pricing</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Standard in-store shelf prices with zero hidden markups.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Verified Local Payments</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Seamless MTN MoMo, Airtel Money, or Cash on Delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
