"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const CART_KEY = "miso_cart";
const WISH_KEY = "miso_wish";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [ready, setReady] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const w = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
      if (Array.isArray(c)) setCart(c);
      if (Array.isArray(w)) setWishlist(w);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, ready]);

  function addToCart(item, qty = 1) {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.slug === item.slug && c.size === item.size);
      if (i > -1) {
        const next = prev.slice();
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  }
  function incItem(i) {
    setCart((prev) => prev.map((c, j) => (j === i ? { ...c, qty: c.qty + 1 } : c)));
  }
  function decItem(i) {
    setCart((prev) => {
      const next = prev.slice();
      if (next[i].qty > 1) next[i] = { ...next[i], qty: next[i].qty - 1 };
      else next.splice(i, 1);
      return next;
    });
  }
  function removeItem(i) {
    setCart((prev) => prev.filter((_, j) => j !== i));
  }
  function clearCart() {
    setCart([]);
  }
  function toggleWish(slug) {
    setWishlist((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }
  const isWished = (slug) => wishlist.includes(slug);
  const cartCount = cart.reduce((t, c) => t + c.qty, 0);
  const subtotal = cart.reduce((t, c) => t + c.price * c.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart, wishlist, ready,
        addToCart, incItem, decItem, removeItem, clearCart,
        toggleWish, isWished, cartCount, wishCount: wishlist.length, subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
