// app/(customer)/[restaurantId]/menu/menu-view.tsx
"use client";

import { useLanguage } from "contexts/language-context";
import { Menu } from "../../../types/menu";
import Image from "next/image";

interface MenuViewProps {
  menu: Menu;
}

export function MenuView({ menu }: MenuViewProps) {
  const { language } = useLanguage();

  const getTranslation = (
    item: MenuViewProps["menu"]["menuItems"][0],
    field: "name" | "description",
  ): string => {
    // Add return type annotation
    const translation = item.translations.find((t) => t.language === language);
    return translation?.[field] || item[field] || ""; // Add empty string as fallback
  };

  const categories = Array.from(
    new Set(menu.menuItems.map((item) => item.category)),
  ).filter((category): category is string => category != null);

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-semibold">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg overflow-hidden shadow-sm"
                >
                  {item.images[0] && (
                    <div className="relative h-48">
                      <Image
                        src={item.images[0].url}
                        alt={getTranslation(item, "name")}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium">
                      {getTranslation(item, "name")}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {getTranslation(item, "description")}
                    </p>
                    <div className="mt-2">
                      <p className="font-semibold">
                        ${item.basePrice.toFixed(2)}
                      </p>
                      {item.variants.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Variants:</p>
                          <div className="space-y-1">
                            {item.variants.map((variant) => (
                              <p
                                key={variant.name}
                                className="text-sm text-gray-600"
                              >
                                {variant.name}: ${variant.price.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.addons.filter((addon) => addon.available).length >
                        0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Add-ons:</p>
                          <div className="space-y-1">
                            {item.addons
                              .filter((addon) => addon.available)
                              .map((addon) => (
                                <p
                                  key={addon.name}
                                  className="text-sm text-gray-600"
                                >
                                  {addon.name}: +${addon.price.toFixed(2)}
                                </p>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
