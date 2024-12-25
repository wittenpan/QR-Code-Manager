// app/dashboard/analytics/components/popular-items-list.tsx
import { Card, CardContent } from "../../../components/ui/card";

interface PopularItemsListProps {
  items: {
    itemId: string;
    name: string;
    views: number;
  }[];
}

export function PopularItemsList({ items }: PopularItemsListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.itemId} className="flex justify-between items-center">
          <span className="font-medium">{item.name}</span>
          <span className="text-muted-foreground">{item.views} views</span>
        </div>
      ))}
    </div>
  );
}
