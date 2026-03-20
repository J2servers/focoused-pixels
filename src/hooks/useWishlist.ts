/**
 * useWishlist - Wishlist/Favorites functionality using localStorage
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  clearAll: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.find(i => i.id === item.id)) return state;
          return { items: [...state.items, { ...item, addedAt: Date.now() }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id),
        }));
      },

      isInWishlist: (id) => {
        return get().items.some(i => i.id === id);
      },

      toggleItem: (item) => {
        const state = get();
        if (state.items.some(i => i.id === item.id)) {
          state.removeItem(item.id);
        } else {
          state.addItem(item);
        }
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'pincel-de-luz-wishlist',
    }
  )
);
