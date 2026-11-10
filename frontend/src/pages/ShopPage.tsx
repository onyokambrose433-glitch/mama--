import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Grid as GridIcon,
  List as ListIcon,
  X,
  ChevronDown,
  ShoppingBag,
  SlidersHorizontal,
  Search,
  Check
} from 'lucide-react';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { formatUGX } from '../utils/format';
import apiClient from '../api/client';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states from URL
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const discountOnly = searchParams.get('has_discount') === 'true';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  // Local price filter state
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch categories and brands
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          apiClient.get<any>('/categories/'),
          apiClient.get<any>('/brands/'),
        ]);
        const catList = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.results) ? catRes.data.results : []);
        const brandList = Array.isArray(brandRes.data) ? brandRes.data : (Array.isArray(brandRes.data?.results) ? brandRes.data.results : []);
        setCategories(catList);
        setBrands(brandList);
      } catch (err) {
        console.error('Failed to load categories/brands', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products based on query params
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        const res = await apiClient.get<any>(`/products/?${params.toString()}`);
        if (res.data.results) {
          setProducts(res.data.results);
          setTotalCount(res.data.count);
        } else {
          setProducts(res.data);
          setTotalCount(res.data.length);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'false') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('min_price', minPrice);
    else newParams.delete('min_price');

    if (maxPrice) newParams.set('max_price', maxPrice);
    else newParams.delete('max_price');

    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedBrand || inStockOnly || discountOnly || searchQuery || searchParams.get('min_price') || searchParams.get('max_price')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <a href="/" className="hover:underline">Home</a>
          <span>/</span>
          <span className="font-semibold text-slate-900">Supermarket Catalog</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-[#E15712] font-semibold capitalize">{selectedCategory.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                : discountOnly
                ? 'Special Offers & Weekly Discounts'
                : 'All Supermarket Groceries & Essentials'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {totalCount} genuine items stocked at Mama Shopping Center
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Catalog</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#E15712]" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E15712]" />
                Refine Selection
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Categories
              </h3>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilter('category', null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    !selectedCategory ? 'bg-orange-50 text-[#E15712] font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-orange-50 text-[#E15712] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{cat.products_count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter in UGX */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Price (UGX)
              </h3>
              <form onSubmit={handleApplyPrice} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min UGX"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:border-[#E15712]"
                  />
                  <input
                    type="number"
                    placeholder="Max UGX"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-hidden focus:border-[#E15712]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply Price Range
                </button>
              </form>
            </div>

            {/* Availability & Deals Toggles */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Availability & Deals
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : null)}
                  className="rounded text-[#E15712] focus:ring-[#E15712]"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => updateFilter('has_discount', e.target.checked ? 'true' : null)}
                  className="rounded text-[#E15712] focus:ring-[#E15712]"
                />
                <span className="text-[#FF550D] font-semibold">Special Offers & Discounts</span>
              </label>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Brands
                </h3>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateFilter('brand', selectedBrand === b.slug ? null : b.slug)}
                      className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors flex items-center justify-between ${
                        selectedBrand === b.slug ? 'text-[#E15712] font-bold bg-orange-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400">{b.products_count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </aside>

        {/* MAIN PRODUCT CATALOG CONTENT */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Top Sort & Active Filters Toolbar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Active filter badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter tags:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-[#E15712] text-xs font-semibold">
                  Category: {selectedCategory}
                  <button onClick={() => updateFilter('category', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-[#2FA0E1] text-xs font-semibold">
                  Brand: {selectedBrand}
                  <button onClick={() => updateFilter('brand', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {discountOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-[#FF550D] text-xs font-semibold">
                  Discounts Only
                  <button onClick={() => updateFilter('has_discount', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  In Stock Only
                  <button onClick={() => updateFilter('in_stock', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {!hasActiveFilters && (
                <span className="text-xs text-slate-400 italic">None active</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:border-[#E15712] outline-hidden cursor-pointer"
              >
                <option value="newest">Newest Stock</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="bestseller">Best Selling</option>
              </select>
            </div>

          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 text-[#E15712] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No supermarket items matched your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try resetting your filters, clearing your price boundaries, or exploring a different category aisle.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-5 px-6 py-2.5 bg-[#E15712] hover:bg-[#c4470a] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}

        </main>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
