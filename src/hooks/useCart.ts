import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/data/products';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

      addItem: (product, quantity = 1, size) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.size === size
          );

          let newItems: CartItem[];

          if (existingIndex > -1) {
            newItems = state.items.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { product, quantity, size }];
          }

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return { items: newItems, itemCount, total };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.product.id !== productId
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          return { items: newItems, itemCount, total };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter(
              (item) => item.product.id !== productId
            );
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const total = newItems.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            );
            return { items: newItems, itemCount, total };
          }

          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
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
      name: 'foco-laser-cart',
    }
  )
);
