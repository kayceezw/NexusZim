import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string; // unique cart-item id (uuid-ish)
  serviceId: string | null; // null when custom
  serviceName: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  basePrice: number | null;
  isCustom: boolean;
  notes?: string;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const KEY = "nexuszim.cart.v1";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value: CartContextValue = {
    items,
    add: (item) => setItems((xs) => [...xs, { ...item, id: makeId() }]),
    remove: (id) => setItems((xs) => xs.filter((x) => x.id !== id)),
    updateNotes: (id, notes) =>
      setItems((xs) => xs.map((x) => (x.id === id ? { ...x, notes } : x))),
    clear: () => setItems([]),
    count: items.length,
    total: items.reduce((sum, x) => sum + (x.basePrice ?? 0), 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
