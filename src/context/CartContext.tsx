"use client";

/**
 * CartContext
 *
 * Cart state is synced to WooCommerce via the Store API (wc/store/v1).
 * The WC Store API is session-based — cookies handle guest sessions and
 * logged-in users automatically. No localStorage is used for cart data.
 *
 * Local state mirrors the WC cart for instant UI updates; mutations are
 * fired to /api/cart and the response updates local state.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface CartItem {
  id: number;
  key: string;        // WC item key (needed for updates/removes)
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'key'>) => Promise<void>;
  removeFromCart: (key: string) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  subTotal: number;
  itemCount: number;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  cartSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getToken(): string | null {
  try { return localStorage.getItem("bi_token"); } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Parse WC Store API cart response into CartItem[] ─────────────────────────
function parseWCCart(data: Record<string, unknown>): CartItem[] {
  if (!data || !Array.isArray(data.items)) return [];
  return (data.items as Record<string, unknown>[]).map((item) => {
    const images = item.images as { src: string }[] | undefined;
    const prices = item.prices as { price: string } | undefined;
    return {
      id:       Number(item.id),
      key:      String(item.key ?? item.id),
      name:     String(item.name ?? ''),
      price:    prices ? parseFloat(prices.price) / 100 : 0,
      quantity: Number(item.quantity ?? 1),
      image:    images?.[0]?.src ?? '',
    };
  });
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [cartSyncing, setCartSyncing] = useState(false);

  // ── Fetch cart from WC ─────────────────────────────────────────────────
  const refreshCart = useCallback(async () => {
    setCartSyncing(true);
    try {
      const res = await fetch('/api/cart', {
        headers: authHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCart(parseWCCart(data));
      }
    } catch {
      // silent — cart stays as-is
    } finally {
      setCartSyncing(false);
    }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  // ── Add item ───────────────────────────────────────────────────────────
  const addToCart = useCallback(async (item: Omit<CartItem, 'key'>) => {
    setCartSyncing(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify({ id: item.id, quantity: item.quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        // WC returns full cart on add-item
        if (data.items) {
          setCart(parseWCCart(data));
        } else {
          // Fallback: refresh
          await refreshCart();
        }
      }
    } finally {
      setCartSyncing(false);
    }
  }, [refreshCart]);

  // ── Remove item ────────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (key: string) => {
    // Optimistic remove
    setCart(prev => prev.filter(i => i.key !== key));
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify({ key }),
      });
    } catch {
      // Rollback by refreshing from WC
      await refreshCart();
    }
  }, [refreshCart]);

  // ── Update quantity ────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (key: string, quantity: number) => {
    if (quantity <= 0) { await removeFromCart(key); return; }
    // Optimistic update
    setCart(prev => prev.map(i => i.key === key ? { ...i, quantity } : i));
    try {
      await fetch('/api/cart/update-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify({ key, quantity }),
      });
    } catch {
      await refreshCart();
    }
  }, [removeFromCart, refreshCart]);

  // ── Clear cart ─────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCart([]);
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify({}),
      });
    } catch {}
  }, []);

  const subTotal  = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const itemCount = cart.reduce((t, i) => t + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart,
      subTotal, itemCount, isLoading, setIsLoading, cartSyncing,
    }}>
      {children}

      {isLoading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-700/10 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-t-4 border-green-700 rounded-full animate-spin" />
            </div>
            <p className="text-green-700 font-bold font-['Outfit'] text-lg">Processing...</p>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
