import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedItem {
  slug: string;
  name: string;
  image: string;
  price: number;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const filtered = state.items.filter((i) => i.slug !== newItem.slug);
          const updated = [{ ...newItem, viewedAt: Date.now() }, ...filtered].slice(0, 10);
          return { items: updated };
        });
      },
    }),
    { name: 'pincel-recently-viewed' }
  )
);
