import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../../types';
import { formatUGX } from '../../utils/format';
import { useCart } from '../../context/CartContext';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<Props> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!product.is_in_stock) return;
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-xs"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-200">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            
            {/* Image */}
            <div className="relative aspect-square sm:aspect-auto bg-slate-50 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-100">
              {product.primary_image_url ? (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  className="w-full h-full max-h-80 object-contain"
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <ShoppingBag className="w-16 h-16 stroke-1" />
                  <span className="text-xs mt-2">Mama Shopping Center</span>
                </div>
              )}
              {product.has_discount && (
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-[#FF550D] text-white text-xs font-black">
                  -{product.discount_percentage}% OFF
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-[#2FA0E1]">{product.category_name}</span>
                  <span>•</span>
                  <span>SKU: {product.sku}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {product.name}
                </h3>

                {/* Stock availability */}
                <div className="mt-2.5 flex items-center gap-2">
                  {product.is_in_stock ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      In Stock ({product.stock_quantity} available)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      Out of Stock
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">Unit: {product.unit}</span>
                </div>

                {/* Price in UGX */}
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-slate-900">
                    {formatUGX(product.current_price)}
                  </span>
                  {product.has_discount && (
                    <span className="text-sm font-medium text-slate-400 line-through">
                      {formatUGX(product.selling_price)}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3.5 text-sm font-bold text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-2 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.is_in_stock}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : !product.is_in_stock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#E15712] hover:bg-[#c4470a] text-white shadow-md'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Basket</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add {quantity} to Basket</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center transition-colors"
                  >
                    Full Details
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
