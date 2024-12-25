// components/ui/menu/MenuItemCard.tsx
import { ExtendedMenuItem } from "../../types/menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Image from "next/image";

interface MenuItemCardProps {
  item: ExtendedMenuItem;
  language?: string;
  onEdit?: (item: ExtendedMenuItem) => void;
  onDelete?: (item: ExtendedMenuItem) => void;
  onToggleAvailability?: (item: ExtendedMenuItem) => void;
  disabled?: boolean;
}

export function MenuItemCard({
  item,
  language = "en",
  onEdit,
  onDelete,
  onToggleAvailability,
  disabled,
}: MenuItemCardProps) {
  const translation = item.translations.find((t) => t.language === language);
  const displayName = translation?.name || item.name;
  const displayDescription = translation?.description || item.description;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        {item.images[0] && (
          <div className="relative h-48 w-full">
            <Image
              src={item.images[0].url}
              alt={item.images[0].altText || displayName}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardTitle className="flex justify-between items-center">
          <span>{displayName}</span>
          <Badge variant={item.isAvailable ? "default" : "secondary"}>
            {item.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{displayDescription}</p>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">From ${item.basePrice.toFixed(2)}</p>
          {item.variants.length > 0 && (
            <div className="text-sm">
              <p className="font-medium">Variants:</p>
              <div className="flex flex-wrap gap-2">
                {item.variants.map((variant) => (
                  <Badge key={variant.id} variant="outline">
                    {variant.name}: ${variant.price.toFixed(2)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => onEdit?.(item)}
            disabled={disabled}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Edit
          </Button>
          <Button
            onClick={() => onToggleAvailability?.(item)}
            disabled={disabled}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
          </Button>
          <Button
            onClick={() => onDelete?.(item)}
            disabled={disabled}
            variant="destructive"
            className="px-3 py-1 rounded-md disabled:opacity-50"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
