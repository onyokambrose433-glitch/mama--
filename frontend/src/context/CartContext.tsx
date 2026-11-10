import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Cart } from '../types';
import { useAuth } from './AuthContext';

interface AppliedCoupon {
  code: string;
  discount: number;
  discount_type: string;
  discount_value: number;
}

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
  subtotal: number;
  discount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    const saved = localStorage.getItem('mama_coupon');
    return saved ? JSON.parse(saved) : null;
  });
  const { user } = useAuth();

  const refreshCart = async () => {
    try {
      const res = await apiClient.get<Cart>('/cart/');
      setCart(res.data);
    } catch {
      // Cart init failure
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/cart/items/', {
        product_id: productId,
        quantity,
      });
      if (res.data.cart) {
        setCart(res.data.cart);
        setIsOpen(true);
        return { success: true, message: res.data.detail };
      } else {
        setCart(res.data);
        setIsOpen(true);
        return { success: true, message: 'Item added to shopping cart.' };
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Could not add item to cart.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    try {
      const res = await apiClient.patch<Cart>(`/cart/items/${itemId}/`, { quantity });
      setCart(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not update item quantity.');
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const res = await apiClient.delete<Cart>(`/cart/items/${itemId}/remove/`);
      setCart(res.data);
    } catch {
      // Error removing item
    }
  };

  const clearCart = async () => {
    try {
      const res = await apiClient.post<Cart>('/cart/clear/');
      setCart(res.data);
      removeCoupon();
    } catch {
      // Error clearing cart
    }
  };

  const applyCoupon = async (code: string) => {
    const currentSubtotal = cart ? parseFloat(cart.subtotal) : 0;
    if (currentSubtotal <= 0) {
      return { success: false, message: 'Your shopping cart is empty.' };
    }
    try {
      const res = await apiClient.post('/coupons/validate/', {
        code,
        subtotal: currentSubtotal,
      });
      if (res.data.valid) {
        const couponData: AppliedCoupon = {
          code: res.data.coupon_code,
          discount: res.data.discount,
          discount_type: res.data.discount_type,
          discount_value: res.data.discount_value,
        };
        setAppliedCoupon(couponData);
        localStorage.setItem('mama_coupon', JSON.stringify(couponData));
        return { success: true, message: res.data.message };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code.';
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('mama_coupon');
  };

  const subtotal = cart ? parseFloat(cart.subtotal) : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalItems = cart ? cart.total_items : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        refreshCart,
        subtotal,
        discount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
