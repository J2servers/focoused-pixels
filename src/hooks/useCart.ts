import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === newItem.id && item.size === newItem.size
          );

          let newItems: CartItem[];
          const quantity = newItem.quantity || 1;

          if (existingIndex > -1) {
            newItems = state.items.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { ...newItem, quantity }];
          }

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, itemCount, total };
        });
      },

      removeItem: (id, size) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => !(item.id === id && item.size === size)
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, itemCount, total };
        });
      },

      updateQuantity: (id, size, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter(
              (item) => !(item.id === id && item.size === size)
            );
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const total = newItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            return { items: newItems, itemCount, total };
          }

          const newItems = state.items.map((item) =>
            item.id === id && item.size === size ? { ...item, quantity } : item
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, itemCount, total };
        });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },
    }),
    {
      name: 'pincel-de-luz-cart',
    }
  )
);
