import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Grid,
  ChevronDown,
  Percent,
  Sparkles,
  Truck,
  PhoneCall,
  ShoppingBag,
  Info,
  Clock,
  MapPin
} from 'lucide-react';
import { Category } from '../../types';
import apiClient from '../../api/client';

export const Navbar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get<any>('/categories/');
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.results) ? res.data.results : []);
        setCategories(list);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-slate-900 text-slate-100 hidden lg:block border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center space-x-1">
            
            {/* Shop by Category Mega Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
                className="flex items-center gap-2.5 px-5 py-3.5 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold text-sm tracking-wide transition-colors"
              >
                <Grid className="w-4 h-4" />
                <span>ALL CATEGORIES</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Dropdown Panel */}
              {categoriesOpen && (
                <div
                  onMouseLeave={() => setCategoriesOpen(false)}
                  className="absolute top-full left-0 w-72 bg-white text-slate-800 rounded-b-2xl shadow-2xl border border-slate-200 py-3 z-50 divide-y divide-slate-100"
                >
                  <div className="max-h-[460px] overflow-y-auto">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50/60 hover:text-[#E15712] transition-colors text-sm font-medium"
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.products_count > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                            {cat.products_count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="p-2 text-center">
                    <Link
                      to="/shop"
                      onClick={() => setCategoriesOpen(false)}
                      className="block py-1.5 text-xs font-bold text-[#2FA0E1] hover:underline"
                    >
                      Browse Entire Supermarket Catalog →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <Link
              to="/"
              className={`px-4 py-3.5 text-sm font-medium hover:text-[#2FA0E1] transition-colors ${
                isActive('/') ? 'text-[#2FA0E1] font-semibold border-b-2 border-[#2FA0E1]' : 'text-slate-200'
              }`}
            >
              Home
            </Link>
            
            <Link
              to="/shop"
              className={`px-4 py-3.5 text-sm font-medium hover:text-[#2FA0E1] transition-colors ${
                isActive('/shop') && !location.search.includes('discount') ? 'text-[#2FA0E1] font-semibold border-b-2 border-[#2FA0E1]' : 'text-slate-200'
              }`}
            >
              Shop Catalog
            </Link>

            <Link
              to="/shop?has_discount=true"
              className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Percent className="w-4 h-4 text-amber-400" />
              Special Offers
            </Link>

            <Link
              to="/about"
              className={`px-4 py-3.5 text-sm font-medium hover:text-[#2FA0E1] transition-colors ${
                isActive('/about') ? 'text-[#2FA0E1] font-semibold border-b-2 border-[#2FA0E1]' : 'text-slate-200'
              }`}
            >
              About Mama
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-3.5 text-sm font-medium hover:text-[#2FA0E1] transition-colors ${
                isActive('/contact') ? 'text-[#2FA0E1] font-semibold border-b-2 border-[#2FA0E1]' : 'text-slate-200'
              }`}
            >
              Contact Us
            </Link>

            <Link
              to="/track-order"
              className={`px-4 py-3.5 text-sm font-medium hover:text-[#2FA0E1] transition-colors ${
                isActive('/track-order') ? 'text-[#2FA0E1] font-semibold border-b-2 border-[#2FA0E1]' : 'text-slate-200'
              }`}
            >
              Track Order
            </Link>

          </div>

          {/* Quick Kampala Dispatch Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#2FA0E1]" />
            <span>Kampala Central & Divisions Delivery</span>
          </div>

        </div>
      </div>
    </nav>
  );
};
