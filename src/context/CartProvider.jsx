import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [coupon, setCoupon] = useState(null);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prev => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          ...product,
          qty: (existing?.qty || 0) + quantity,
          addons: existing?.addons || []
        }
      };
    });
    toast.success(`🛒 ${product.name} added to cart!`, { duration: 2000 });
  }, []);

  const bulkAddToCart = (items) => {
    setCart(prev => {
        const newCart = { ...prev };
        items.forEach(item => {
            const id = item.product_id || item.id;
            const existing = newCart[id];
            newCart[id] = {
                ...item,
                id: id,
                name: item.name || item.product_name,
                qty: (existing?.qty || 0) + item.quantity
            };
        });
        return newCart;
    });
    toast.success('🍱 Items from past order added to cart!');
  };

  const removeFromCart = useCallback((productId) => {
    setCart(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  }, []);

  const updateQty = useCallback((productId, delta) => {
    setCart(prev => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return { ...prev, [productId]: { ...item, qty: newQty } };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback((couponData) => {
    setCoupon(couponData);
    toast.success(`✅ Coupon "${couponData.code}" applied! You save ₹${couponData.discount}`);
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    toast.info('Coupon removed');
  }, []);

  const itemTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharge = itemTotal > 299 ? 0 : 49;
  const taxes = Math.round(itemTotal * 0.05);
  const couponDiscount = coupon ? coupon.discount : 0;
  const grandTotal = itemTotal + deliveryCharge + taxes - couponDiscount;
  const totalItems = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      bulkAddToCart,
      removeFromCart,
      updateQty,
      clearCart,
      applyCoupon,
      removeCoupon,
      coupon,
      itemTotal,
      deliveryCharge,
      taxes,
      couponDiscount,
      grandTotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
