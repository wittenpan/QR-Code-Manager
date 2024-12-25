// components/menu-item-form/variant-manager.tsx
"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PlusIcon, XIcon } from "lucide-react";

interface Variant {
  name: string;
  price: number;
}

interface VariantManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  isDisabled?: boolean;
}

export function VariantManager({
  variants,
  onChange,
  isDisabled,
}: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState({ name: "", price: 0 });

  const handleAdd = () => {
    if (!newVariant.name) return;
    onChange([...variants, newVariant]);
    setNewVariant({ name: "", price: 0 });
  };

  const handleRemove = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {variants.map((variant, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={variant.name}
              onChange={(e) => {
                const updated = [...variants];
                updated[index].name = e.target.value;
                onChange(updated);
              }}
              placeholder="Variant name"
              disabled={isDisabled}
            />
            <Input
              type="number"
              value={variant.price}
              onChange={(e) => {
                const updated = [...variants];
                updated[index].price = parseFloat(e.target.value);
                onChange(updated);
              }}
              placeholder="Price"
              disabled={isDisabled}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => handleRemove(index)}
              disabled={isDisabled}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={newVariant.name}
          onChange={(e) =>
            setNewVariant({ ...newVariant, name: e.target.value })
          }
          placeholder="New variant name"
          disabled={isDisabled}
        />
        <Input
          type="number"
          value={newVariant.price}
          onChange={(e) =>
            setNewVariant({ ...newVariant, price: parseFloat(e.target.value) })
          }
          placeholder="Price"
          disabled={isDisabled}
        />
        <Button type="button" onClick={handleAdd} disabled={isDisabled}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
