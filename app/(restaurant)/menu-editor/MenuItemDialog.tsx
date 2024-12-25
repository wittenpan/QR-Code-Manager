"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { ImageUpload } from "../../components/ui/image-upload";
import { VariantManager } from "../../components/menu-item-form/variant-manager";
import { AddonManager } from "../../components/menu-item-form/addon-manager";
import { TranslationManager } from "../../components/menu-item-form/translation-manager";
import Image from "next/image";
import { toast } from "../../components/ui/use-toast";
interface SimpleVariant {
  name: string;
  price: number;
}

interface SimpleAddon {
  name: string;
  price: number;
  available: boolean;
}

interface SimpleTranslation {
  language: string;
  name: string;
  description: string | null;
}

interface ExtendedMenuItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: string | null;
  isAvailable: boolean;
  images: {
    id: string;
    url: string;
  }[];
  variants: {
    id: string;
    name: string;
    price: number;
  }[];
  addons: {
    id: string;
    name: string;
    price: number;
    available: boolean;
  }[];
  translations: {
    id: string;
    language: string;
    name: string;
    description: string | null;
  }[];
}

interface FormData {
  name: string;
  description: string;
  basePrice: number;
  category: string;
  images: { url: string }[];
  variants: SimpleVariant[];
  addons: SimpleAddon[];
  translations: SimpleTranslation[];
}

interface SerializableMenuItemDialogProps {
  open: boolean;
  item: ExtendedMenuItem | null;
  menuId: string;
  isDisabled?: boolean;
  onOpenChangeRef?: React.MutableRefObject<
    ((open: boolean) => void) | undefined
  >;
  onSaveRef?: React.MutableRefObject<((data: FormData) => void) | undefined>;
}

export function MenuItemDialog({
  open,
  item,
  menuId,
  isDisabled,
  onOpenChangeRef,
  onSaveRef,
}: SerializableMenuItemDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<FormData>(() => ({
    name: "",
    description: "",
    basePrice: 0,
    category: "",
    images: [],
    variants: [],
    addons: [],
    translations: [],
  }));

  // Reset form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        basePrice: item.basePrice || 0,
        category: item.category || "",
        images: item.images.map((img) => ({ url: img.url })) || [], // Update this line
        variants:
          item.variants.map((variant) => ({
            name: variant.name,
            price: variant.price,
          })) || [],
        addons:
          item.addons.map((addon) => ({
            name: addon.name,
            price: addon.price,
            available: addon.available,
          })) || [],
        translations:
          item.translations.map((translation) => ({
            language: translation.language,
            name: translation.name,
            description: translation.description,
          })) || [],
      });
    } else {
      // Reset form for new item
      setFormData({
        name: "",
        description: "",
        basePrice: 0,
        category: "",
        images: [], // Empty array of image objects
        variants: [],
        addons: [],
        translations: [],
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled || !onSaveRef?.current) return;

    // Include the item ID if we're editing
    const submitData = item ? { ...formData, id: item.id } : formData;

    onSaveRef.current(submitData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => onOpenChangeRef?.current?.(value)}
    >
      <DialogContent
        className="max-w-2xl"
        aria-describedby="menu-item-dialog-description"
      >
        <div id="menu-item-dialog-description" className="sr-only">
          Dialog for editing or creating menu items
        </div>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <p id="dialog-description" className="text-sm text-muted-foreground">
            {item
              ? "Edit the details of your menu item."
              : "Add a new item to your menu."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    disabled={isDisabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    disabled={isDisabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Base Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        basePrice: parseFloat(e.target.value),
                      }))
                    }
                    required
                    disabled={isDisabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    disabled={isDisabled}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="space-y-4">
                <ImageUpload
                  value={formData.images}
                  onChangeImages={(newImages: { url: string }[]) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: newImages
                    }));
                  }}
                  maxImages={5}
                />
                
                {/* Display existing images */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={`Menu item image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            images: newImages
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variants">
              <VariantManager
                variants={formData.variants}
                onChange={(variants) =>
                  setFormData((prev) => ({ ...prev, variants }))
                }
                isDisabled={isDisabled}
              />
            </TabsContent>

            <TabsContent value="addons">
              <AddonManager
                addons={formData.addons}
                onChange={(addons) =>
                  setFormData((prev) => ({ ...prev, addons }))
                }
                isDisabled={isDisabled}
              />
            </TabsContent>

            <TabsContent value="translations">
              <TranslationManager
                translations={formData.translations}
                onChange={(translations) =>
                  setFormData((prev) => ({ ...prev, translations }))
                }
                isDisabled={isDisabled}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeRef?.current?.(false)}
              disabled={isDisabled}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>
              {item ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}