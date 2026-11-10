import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Package,
  LogOut,
  MapPin,
  HelpCircle,
  ShoppingBag,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { WebsiteSettings } from '../../types';
import { formatUGX } from '../../utils/format';
import apiClient from '../../api/client';

interface Props {
  settings: WebsiteSettings | null;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<Props> = ({ settings, onToggleMobileMenu }) => {
  const { user, logout, isStaff } = useAuth();
  const { totalItems, subtotal, setIsOpen } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/products/search-suggestions/?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-700 hover:text-[#E15712] focus:outline-hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Supermarket Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              alt="Mama Shopping Center Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform bg-white border border-slate-100 p-0.5"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                MAMA <span className="text-[#E15712]">SHOPPING</span>
              </span>
              <span className="text-[10px] tracking-widest font-bold uppercase text-[#2FA0E1] leading-tight mt-0.5">
                Center • Kampala
              </span>
            </div>
          </Link>

          {/* Live Search Bar with Suggestions */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search fresh groceries, meat, dairy, drinks, essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full pl-4 pr-12 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm rounded-full border border-slate-300 focus:border-[#E15712] focus:ring-2 focus:ring-[#E15712]/20 transition-all outline-hidden"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#E15712] hover:bg-[#c4470a] text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="p-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Matching Supermarket Items
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.slug)}
                      className="w-full p-2.5 flex items-center gap-3 hover:bg-orange-50/50 text-left transition-colors"
                    >
                      <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.category} • {item.unit}</div>
                      </div>
                      <div className="text-sm font-bold text-[#E15712] shrink-0">
                        {formatUGX(item.price)}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 text-xs text-center font-medium text-[#2FA0E1] hover:bg-blue-50 border-t border-slate-100"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Action Icons: Mobile App, Account & Live Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            <Link
              to="/download-app"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-[#E15712] hover:bg-orange-100 font-bold text-xs border border-orange-200 transition-colors shadow-2xs"
              title="Download Mama Shopping Center Mobile App"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#E15712]" />
              <span>Get App</span>
            </Link>

            {/* Account Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-[#E15712] hover:bg-slate-100 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[11px] text-slate-500 leading-none">
                    {user ? `Hello, ${user.first_name || 'Customer'}` : 'Sign In'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user ? 'My Account' : 'Account'}
                  </span>
                </div>
              </button>

              {/* Account Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#E15712]">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      {isStaff && (
                        <Link
                          to="/admin-portal"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#E15712] hover:bg-orange-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#E15712]" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/account?tab=orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Orders
                      </Link>
                      <Link
                        to="/account?tab=addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        Delivery Addresses
                      </Link>
                      <Link
                        to="/account?tab=support"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        Support Tickets
                      </Link>

                      <div className="border-t border-slate-100 mt-2 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-slate-500 mb-3 px-1">
                        Sign in to track orders, save delivery addresses, and enjoy faster checkout.
                      </p>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block w-full py-2 px-3 text-center text-sm font-semibold text-white bg-[#E15712] hover:bg-[#c4470a] rounded-xl transition-colors shadow-xs"
                      >
                        Sign In
                      </Link>
                      <div className="mt-2 text-center">
                        <span className="text-xs text-slate-500">New customer? </span>
                        <Link
                          to="/register"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-xs font-semibold text-[#2FA0E1] hover:underline"
                        >
                          Register here
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 sm:gap-3 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 rounded-full transition-all text-slate-800"
              aria-label="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#E15712]" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FF550D] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-none">Cart</span>
                <span className="text-xs font-bold text-[#E15712] leading-tight">
                  {formatUGX(subtotal)}
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search groceries, milk, meat, rice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-100 text-slate-900 text-sm rounded-full border border-slate-300 focus:border-[#E15712] outline-hidden"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-[#E15712] text-white rounded-full flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </header>
  );
};
