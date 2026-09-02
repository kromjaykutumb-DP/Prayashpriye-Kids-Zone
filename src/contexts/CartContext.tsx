import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem } from '@/types';

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (product_id: string, size: string, color: string, quantity: number) => void;
  removeItem: (product_id: string, size: string, color: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color
      );
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity, line_total: (i.quantity + item.quantity) * i.unit_price }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (product_id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(product_id, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === product_id && i.size === size && i.color === color
          ? { ...i, quantity, line_total: quantity * i.unit_price }
          : i
      )
    );
  };

  const removeItem = (product_id: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === product_id && i.size === size && i.color === color))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.line_total, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const value: CartContextType = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
