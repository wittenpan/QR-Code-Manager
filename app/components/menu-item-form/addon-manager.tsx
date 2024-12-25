// components/menu-item-form/addon-manager.tsx
"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";

interface Addon {
  name: string;
  price: number;
  available: boolean;
}

interface AddonManagerProps {
  addons: Addon[];
  onChange: (addons: Addon[]) => void;
  isDisabled?: boolean;
}

export function AddonManager({
  addons,
  onChange,
  isDisabled,
}: AddonManagerProps) {
  const [newAddon, setNewAddon] = useState<Addon>({
    name: "",
    price: 0,
    available: true,
  });

  const handleAddAddon = () => {
    if (!newAddon.name) return;
    onChange([...addons, newAddon]);
    setNewAddon({ name: "", price: 0, available: true });
  };

  const handleUpdateAddon = (index: number, updates: Partial<Addon>) => {
    const updatedAddons = addons.map((addon, i) =>
      i === index ? { ...addon, ...updates } : addon,
    );
    onChange(updatedAddons);
  };

  const handleRemoveAddon = (index: number) => {
    onChange(addons.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {addons.map((addon, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border rounded-lg p-2"
          >
            <Input
              value={addon.name}
              onChange={(e) =>
                handleUpdateAddon(index, { name: e.target.value })
              }
              placeholder="Add-on name"
              className="flex-grow"
              disabled={isDisabled}
            />
            <Input
              type="number"
              value={addon.price}
              onChange={(e) =>
                handleUpdateAddon(index, { price: parseFloat(e.target.value) })
              }
              placeholder="Price"
              className="w-24"
              disabled={isDisabled}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={addon.available}
                onCheckedChange={(checked) =>
                  handleUpdateAddon(index, { available: checked })
                }
                disabled={isDisabled}
              />
              <Label>Available</Label>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveAddon(index)}
              disabled={isDisabled}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={newAddon.name}
          onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
          placeholder="New add-on name"
          className="flex-grow"
          disabled={isDisabled}
        />
        <Input
          type="number"
          value={newAddon.price}
          onChange={(e) =>
            setNewAddon({ ...newAddon, price: parseFloat(e.target.value) })
          }
          placeholder="Price"
          className="w-24"
          disabled={isDisabled}
        />
        <Button type="button" onClick={handleAddAddon} disabled={isDisabled}>
          Add
        </Button>
      </div>
    </div>
  );
}
