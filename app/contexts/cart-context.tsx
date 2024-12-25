"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { MenuItem, MenuItemVariant, MenuItemAddon } from "@prisma/client";

interface CartItem {
  menuItem: MenuItem;
  variant?: MenuItemVariant;
  addons?: MenuItemAddon[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { menuItemId: string; variantId?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { menuItemId: string; variantId?: string; quantity: number } }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.menuItem.id === action.payload.menuItem.id && 
          item.variant?.id === action.payload.variant?.id
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems = [...state.items, action.payload];
      }

      const total = calculateTotal(newItems);
      return { items: newItems, total };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        item => 
          !(item.menuItem.id === action.payload.menuItemId && 
            item.variant?.id === action.payload.variantId)
      );
      const total = calculateTotal(newItems);
      return { items: newItems, total };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map(item => {
        if (
          item.menuItem.id === action.payload.menuItemId && 
          item.variant?.id === action.payload.variantId
        ) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
      const total = calculateTotal(newItems);
      return { items: newItems, total };
    }

    case "CLEAR_CART":
      return { items: [], total: 0 };

    default:
      return state;
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const basePrice = item.variant?.price ?? item.menuItem.basePrice;
    const addonsPrice = item.addons?.reduce((sum, addon) => sum + addon.price, 0) ?? 0;
    return total + (basePrice + addonsPrice) * item.quantity;
  }, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
