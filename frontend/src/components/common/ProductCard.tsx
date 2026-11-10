import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Plus, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatUGX } from '../../utils/format';
import { useCart } from '../../context/CartContext';

interface Props {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onQuickView }) => {
  const { addToCart, loading } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_in_stock) return;

    const res = await addToCart(product.id, 1);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {product.has_discount && (
          <span className="px-2 py-0.5 rounded-md bg-[#FF550D] text-white text-[11px] font-black tracking-wider shadow-xs">
            -{product.discount_percentage}% OFF
          </span>
        )}
        {product.is_bestseller && !product.has_discount && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
            Bestseller
          </span>
        )}
      </div>

      {/* Quick View Button on Hover */}
      {onQuickView && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#E15712] shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <ShoppingBag className="w-12 h-12 stroke-1" />
            <span className="text-[10px] mt-1 font-medium">Mama Supermarket</span>
          </div>
        )}

        {/* Out of Stock overlay if depleted */}
        {product.is_out_of_stock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Unit */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="truncate">{product.category_name}</span>
            <span className="shrink-0 font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
              {product.unit}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#E15712] transition-colors line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-black text-slate-900 leading-none">
              {formatUGX(product.current_price)}
            </div>
            {product.has_discount && (
              <div className="text-[11px] text-slate-400 line-through mt-0.5 font-medium">
                {formatUGX(product.selling_price)}
              </div>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={product.is_out_of_stock || loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : product.is_out_of_stock
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-[#E15712] hover:bg-[#c4470a] text-white shadow-xs hover:scale-105'
            }`}
            title={product.is_out_of_stock ? 'Out of stock' : 'Add to Basket'}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
