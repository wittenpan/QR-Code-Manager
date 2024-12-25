"use client";

import { useState } from "react";
import { useCart } from "../../contexts/cart-context";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { ShoppingCart as ShoppingCartIcon } from "lucide-react";

export function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useCart();

  const handlePlaceOrder = async () => {
    // TODO: Implement order placement
    console.log("Placing order:", state.items);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {state.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">
              {state.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Order</SheetTitle>
        </SheetHeader>
        <div className="mt-8">
          {state.items.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={`${item.menuItem.id}-${item.variant?.id}`} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.menuItem.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-600">{item.variant.name}</p>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-sm text-gray-600">
                        + {item.addons.map(addon => addon.name).join(", ")}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (item.quantity === 1) {
                            dispatch({
                              type: "REMOVE_ITEM",
                              payload: {
                                menuItemId: item.menuItem.id,
                                variantId: item.variant?.id,
                              },
                            });
                          } else {
                            dispatch({
                              type: "UPDATE_QUANTITY",
                              payload: {
                                menuItemId: item.menuItem.id,
                                variantId: item.variant?.id,
                                quantity: item.quantity - 1,
                              },
                            });
                          }
                        }}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: "UPDATE_QUANTITY",
                            payload: {
                              menuItemId: item.menuItem.id,
                              variantId: item.variant?.id,
                              quantity: item.quantity + 1,
                            },
                          });
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      dispatch({
                        type: "REMOVE_ITEM",
                        payload: {
                          menuItemId: item.menuItem.id,
                          variantId: item.variant?.id,
                        },
                      });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={handlePlaceOrder}
                  disabled={state.items.length === 0}
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
