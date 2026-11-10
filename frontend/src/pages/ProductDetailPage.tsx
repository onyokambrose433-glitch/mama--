import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { formatUGX, formatDateTime } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/common/ProductCard';
import apiClient from '../api/client';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'delivery' | 'reviews'>('desc');
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<Product>(`/products/${slug}/`);
        setProduct(res.data);
        setActiveImage(res.data.primary_image_url || '');

        // Fetch related products
        const relatedRes = await apiClient.get<Product[]>(`/products/${slug}/related/`);
        setRelatedProducts(relatedRes.data);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#E15712] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading supermarket product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The product you requested might have been moved or discontinued.</p>
        <Link to="/shop" className="mt-6 inline-block px-6 py-2.5 bg-[#E15712] text-white text-xs font-bold rounded-full">
          Browse Shop Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product.is_in_stock) return;
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await apiClient.post(`/products/${slug}/reviews/`, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewTitle('');
      setReviewComment('');
      // Reload product to show updated review list
      const res = await apiClient.get<Product>(`/products/${slug}/`);
      setProduct(res.data);
    } catch (err: any) {
      setReviewError(err.response?.data?.detail || 'Could not submit your review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : [product.primary_image_url || ''];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:underline">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category_slug}`} className="hover:underline text-[#2FA0E1]">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="text-slate-300 flex flex-col items-center">
                <ShoppingBag className="w-20 h-20 stroke-1" />
                <span className="text-xs mt-2 font-medium">Mama Supermarket</span>
              </div>
            )}
            {product.has_discount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#FF550D] text-white text-xs font-black shadow-xs">
                -{product.discount_percentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-18 h-18 rounded-xl bg-slate-50 border-2 overflow-hidden shrink-0 transition-all ${
                    activeImage === imgUrl ? 'border-[#E15712] shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase & Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Category, Brand, SKU */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-[#2FA0E1]">{product.category_name}</span>
              {product.brand_name && (
                <>
                  <span>•</span>
                  <span className="font-medium text-slate-700">Brand: {product.brand_name}</span>
                </>
              )}
              <span>•</span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Stock status pill */}
            <div className="mt-3 flex items-center gap-3">
              {product.is_in_stock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Out of Stock
                </span>
              )}
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Unit: {product.unit}
              </span>
            </div>

            {/* Price in UGX */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {formatUGX(product.current_price)}
              </span>
              {product.has_discount && (
                <span className="text-base sm:text-lg font-medium text-slate-400 line-through">
                  {formatUGX(product.selling_price)}
                </span>
              )}
            </div>

            {/* Brief description */}
            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector & Add to Cart Action */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors"
                  disabled={quantity >= product.stock_quantity}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                Max {product.stock_quantity} available
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || cartLoading}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : !product.is_in_stock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#E15712] hover:bg-[#c4470a] text-white hover:shadow-lg'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added {quantity} to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>{product.is_in_stock ? `Add ${quantity} to Basket (${formatUGX(parseFloat(product.current_price) * quantity)})` : 'Currently Out of Stock'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Supermarket guarantees badge */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#E15712]" />
              <span>Same-Day Kampala delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2FA0E1]" />
              <span>Direct Mama Supermarket stock</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Description, Specifications, Delivery, Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-4 text-xs font-bold tracking-wide uppercase transition-colors shrink-0 ${
              activeTab === 'desc'
                ? 'bg-white text-[#E15712] border-b-2 border-[#E15712]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-4 text-xs font-bold tracking-wide uppercase transition-colors shrink-0 ${
              activeTab === 'specs'
                ? 'bg-white text-[#E15712] border-b-2 border-[#E15712]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-6 py-4 text-xs font-bold tracking-wide uppercase transition-colors shrink-0 ${
              activeTab === 'delivery'
                ? 'bg-white text-[#E15712] border-b-2 border-[#E15712]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Delivery & Fresh Handling
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 text-xs font-bold tracking-wide uppercase transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-white text-[#E15712] border-b-2 border-[#E15712]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Customer Reviews</span>
            {product.review_count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#E15712] text-[10px]">
                {product.review_count}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          
          {activeTab === 'desc' && (
            <div className="max-w-3xl space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>{product.description}</p>
              <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100 text-xs text-orange-950 space-y-1">
                <span className="font-bold">Supermarket Authenticity Guarantee:</span>
                <p>All items on Mama Shopping Center are guaranteed genuine supermarket inventory with strict quality checks before packing.</p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-500 w-1/3">Stock Keeping Unit (SKU)</td>
                    <td className="py-2.5 text-slate-900 font-mono">{product.sku}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-500">Aisle Category</td>
                    <td className="py-2.5 text-slate-900">{product.category_name}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-500">Unit Type</td>
                    <td className="py-2.5 text-slate-900">{product.unit}</td>
                  </tr>
                  {product.specifications && Object.entries(product.specifications).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-500">{k}</td>
                      <td className="py-2.5 text-slate-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900">Same-Day Kampala & Entebbe Delivery:</h4>
              <p>
                Orders confirmed before 6:00 PM are packaged immediately from our central store and delivered within 2-3 hours.
              </p>
              <h4 className="font-bold text-slate-900 mt-4">Temperature-Controlled Transit:</h4>
              <p>
                Perishable items such as butchery meats, fresh dairy, and seafood are packed with insulated cool-packs to ensure they reach your kitchen in pristine, chilled condition.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              
              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{rev.user_name}</span>
                          {rev.is_verified_purchase && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{formatDateTime(rev.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      {rev.title && <h5 className="text-xs font-bold text-slate-800">{rev.title}</h5>}
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No reviews for this product yet. Be the first verified customer to share feedback!
                  </div>
                )}
              </div>

              {/* Submit Review Form */}
              <div className="max-w-lg pt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Write a Customer Review</h4>
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="p-2 text-xs border border-slate-300 rounded-lg outline-hidden"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Poor</option>
                        <option value={1}>1 Star - Terrible</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Headline (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Fresh milk, delivered very fast"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Feedback</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Share your experience with this grocery item..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-hidden"
                      />
                    </div>

                    {reviewSuccess && (
                      <p className="text-xs text-emerald-600 font-semibold">Thank you! Your review has been submitted.</p>
                    )}
                    {reviewError && (
                      <p className="text-xs text-red-600 font-semibold">{reviewError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500">
                    Please <Link to={`/login?redirect=/product/${slug}`} className="text-[#2FA0E1] font-semibold underline">sign in</Link> to write a product review.
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E15712]">Frequently Bought Together</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Related Items in {product.category_name}
              </h2>
            </div>
            <Link to={`/shop?category=${product.category_slug}`} className="text-xs font-bold text-[#2FA0E1] hover:underline">
              View All In Aisle →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
