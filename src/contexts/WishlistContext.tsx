import { createContext, useContext, useState, type ReactNode } from 'react';
import type { WishlistItem } from '@/types';

type WishlistContextType = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (product_id: string) => void;
  isInWishlist: (product_id: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addItem = (item: WishlistItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeItem = (product_id: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const isInWishlist = (product_id: string) => {
    return items.some((i) => i.product_id === product_id);
  };

  const clearWishlist = () => setItems([]);

  const itemCount = items.length;

  const value: WishlistContextType = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
    itemCount,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
