import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatUGX } from '../../utils/format';

export const MobileBottomBar: React.FC = () => {
  const location = useLocation();
  const { totalItems, subtotal, setIsOpen } = useCart();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            isActive('/') ? 'text-[#E15712]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </Link>

        {/* Shop / Aisles */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            isActive('/shop') ? 'text-[#E15712]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Aisles</span>
        </Link>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative -top-4 flex flex-col items-center justify-center"
          aria-label="Open Cart"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#E15712] to-[#FF550D] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 border-4 border-white active:scale-95 transition-transform">
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black text-[#E15712] mt-0.5">
            {totalItems > 0 ? formatUGX(subtotal) : 'Basket'}
          </span>
        </button>

        {/* Track Order */}
        <Link
          to="/track-order"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            isActive('/track-order') ? 'text-[#E15712]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Track</span>
        </Link>

        {/* Account */}
        <Link
          to={user ? '/account' : '/login'}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            isActive('/account') || isActive('/login') ? 'text-[#E15712]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">{user ? 'Account' : 'Sign In'}</span>
        </Link>

      </div>
    </div>
  );
};
