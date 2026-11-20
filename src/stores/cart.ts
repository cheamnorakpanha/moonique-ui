"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cleanQuantities, maxQuantity, updateQuantity, type Quantities } from "../lib/shop";

type Cart = {
  items: Quantities;
  add: (id: string, quantity: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<Cart>()(persist((set) => ({
  items: {},
  add: (id, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) return;
    set(({ items }) => ({ items: updateQuantity(items, id, (items[id] ?? 0) + quantity) }));
  },
  setQuantity: (id, quantity) => set(({ items }) => ({ items: updateQuantity(items, id, quantity) })),
  clear: () => set({ items: {} }),
}), {
  name: "moonique-cart",
  skipHydration: true,
  partialize: ({ items }) => ({ items }),
  merge: (saved, current) => ({
    ...current,
    items: cleanQuantities((saved as { items?: unknown } | undefined)?.items),
  }),
}));
