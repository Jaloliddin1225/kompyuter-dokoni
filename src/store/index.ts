import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Category, Component, CartItem, Order } from '../types';
import { checkCompatibility } from '../lib/compatibility';

interface StoreState {
  // Cart
  cart: CartItem[];
  promoCode: string | null;
  discountPercent: number;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryCity: string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Builder
  builderSelection: Partial<Record<Category, Component>>;
  includeAssembly: boolean;
  setIncludeAssembly: (val: boolean) => void;
  selectComponent: (component: Component) => {
    success: boolean;
    conflicts?: { category: Category; name: string }[];
  };
  removeComponent: (category: Category) => void;
  clearBuilder: () => void;
  loadBuild: (selection: Partial<Record<Category, Component>>) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Comparison (Laptops)
  compareLaptops: string[];
  toggleCompareLaptop: (id: string) => { added: boolean; limitReached?: boolean };
  removeCompareLaptop: (id: string) => void;
  clearCompare: () => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      promoCode: null,
      discountPercent: 0,
      deliveryMethod: 'delivery',
      deliveryCity: 'Toshkent',

      addToCart: (newItem) => {
        set((state) => {
          const existing = state.cart.find((i) => i.id === newItem.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === newItem.id
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, newItem] };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, delta) => {
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));
      },

      clearCart: () => {
        set({ cart: [], promoCode: null, discountPercent: 0 });
      },

      applyPromoCode: (code: string) => {
        const clean = code.trim().toUpperCase();
        if (clean === 'PCFORGE10') {
          set({ promoCode: 'PCFORGE10', discountPercent: 10 });
          return {
            success: true,
            message: "10% chegirma muvaffaqiyatli qo'llandi!",
          };
        }
        return {
          success: false,
          message: "Bunday promokod mavjud emas yoki muddati o'tgan.",
        };
      },

      removePromoCode: () => {
        set({ promoCode: null, discountPercent: 0 });
      },

      // Builder
      builderSelection: {},
      includeAssembly: true,
      setIncludeAssembly: (val) => set({ includeAssembly: val }),

      selectComponent: (component) => {
        const current = get().builderSelection;
        // Check if replacing this component creates critical conflicts with already selected ones
        const updated = { ...current, [component.category]: component };
        const result = checkCompatibility(updated);

        // Find which existing components conflict with the new one
        const conflictsMap = new Map<Category, string>();
        result.errors.forEach((err) => {
          if (err.between[0] === component.category) {
            const otherCat = err.between[1];
            if (current[otherCat]) {
              conflictsMap.set(otherCat, current[otherCat]!.name);
            }
          } else if (err.between[1] === component.category) {
            const otherCat = err.between[0];
            if (current[otherCat]) {
              conflictsMap.set(otherCat, current[otherCat]!.name);
            }
          }
        });

        const conflicts = Array.from(conflictsMap.entries()).map(([category, name]) => ({
          category,
          name,
        }));

        if (conflicts.length > 0) {
          return { success: false, conflicts };
        }

        set({ builderSelection: updated });
        return { success: true };
      },

      removeComponent: (category) => {
        set((state) => {
          const next = { ...state.builderSelection };
          delete next[category];
          return { builderSelection: next };
        });
      },

      clearBuilder: () => {
        set({ builderSelection: {} });
      },

      loadBuild: (selection) => {
        set({ builderSelection: selection });
      },

      // Favorites
      favorites: [],
      toggleFavorite: (id) => {
        set((state) => {
          const exists = state.favorites.includes(id);
          return {
            favorites: exists
              ? state.favorites.filter((f) => f !== id)
              : [...state.favorites, id],
          };
        });
      },
      isFavorite: (id) => get().favorites.includes(id),

      // Comparison
      compareLaptops: [],
      toggleCompareLaptop: (id) => {
        const current = get().compareLaptops;
        if (current.includes(id)) {
          set({ compareLaptops: current.filter((l) => l !== id) });
          return { added: false };
        }
        if (current.length >= 3) {
          return { added: false, limitReached: true };
        }
        set({ compareLaptops: [...current, id] });
        return { added: true };
      },
      removeCompareLaptop: (id) => {
        set((state) => ({
          compareLaptops: state.compareLaptops.filter((l) => l !== id),
        }));
      },
      clearCompare: () => set({ compareLaptops: [] }),

      // Orders
      orders: [],
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },
      getOrderById: (id) => {
        return get().orders.find((o) => o.id === id);
      },
    }),
    {
      name: 'pcforge-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
