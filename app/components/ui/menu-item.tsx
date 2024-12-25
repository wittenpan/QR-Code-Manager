"use client";

import { useState } from "react";
import { MenuItem, MenuItemVariant, MenuItemAddon, MenuItemTranslation } from "@prisma/client";
import { useCart } from "../../contexts/cart-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Checkbox } from "./checkbox";
import { Button } from "./button";

interface MenuItemProps {
  item: MenuItem & {
    variants: MenuItemVariant[];
    addons: MenuItemAddon[];
    translations: MenuItemTranslation[];
    images: { url: string }[];
  };
  language?: string;
}

export function MenuItemCard({ item, language = "en" }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();

  const translation = item.translations.find(t => t.language === language);
  const name = translation?.name ?? item.name;
  const description = translation?.description ?? item.description;

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        menuItem: item,
        variant: selectedVariant,
        addons: selectedAddons,
        quantity,
      },
    });
    setIsOpen(false);
    setSelectedVariant(undefined);
    setSelectedAddons([]);
    setQuantity(1);
  };

  const basePrice = selectedVariant?.price ?? item.basePrice;
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = (basePrice + addonsPrice) * quantity;

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        {item.images[0]?.url && (
          <img 
            src={item.images[0].url} 
            alt={name} 
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-600 mt-2 line-clamp-2">{description}</p>
        <p className="text-lg font-bold mt-2">
          {item.variants.length > 0 
            ? `From $${Math.min(...item.variants.map(v => v.price))}` 
            : `$${item.basePrice}`
          }
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          
          {item.variants.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Select Size</h4>
              <RadioGroup
                value={selectedVariant?.id}
                onValueChange={(value) => {
                  const variant = item.variants.find(v => v.id === value);
                  setSelectedVariant(variant);
                }}
              >
                {item.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant.id} id={variant.id} />
                    <label htmlFor={variant.id} className="flex justify-between w-full">
                      <span>{variant.name}</span>
                      <span>${variant.price}</span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {item.addons.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Add Extra</h4>
              {item.addons.map((addon) => (
                <div key={addon.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={addon.id}
                    checked={selectedAddons.some(a => a.id === addon.id)}
                    onCheckedChange={(checked) => {
                      setSelectedAddons(
                        checked
                          ? [...selectedAddons, addon]
                          : selectedAddons.filter(a => a.id !== addon.id)
                      );
                    }}
                  />
                  <label htmlFor={addon.id} className="flex justify-between w-full">
                    <span>{addon.name}</span>
                    <span>+${addon.price}</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="text-lg font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-bold">Total: ${totalPrice.toFixed(2)}</span>
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
