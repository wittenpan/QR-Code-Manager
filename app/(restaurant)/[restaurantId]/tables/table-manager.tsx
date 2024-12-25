// app/(restaurant)/[restaurantId]/tables/table-manager.tsx
"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { QRCode } from "./qr-code";
import type { RestaurantTable } from "@prisma/client";

interface TableManagerProps {
  tables: (RestaurantTable & {
    qrCode: { id: string; uniqueCode: string } | null;
  })[];
  restaurantId: string;
}

export function TableManager({
  tables: initialTables,
  restaurantId,
}: TableManagerProps) {
  const [tables, setTables] = useState(initialTables);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTable = async () => {
    if (!newTableNumber.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableNumber: newTableNumber }),
      });

      if (!response.ok) throw new Error("Failed to add table");

      const newTable = await response.json();
      setTables((prev) => [...prev, newTable]);
      setNewTableNumber("");
    } catch (error) {
      console.error("Failed to add table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async (tableId: string) => {
    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, restaurantId }),
      });

      if (!response.ok) throw new Error("Failed to generate QR code");

      const { qrCode, uniqueCode } = await response.json();

      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId
            ? { ...table, qrCode: { id: uniqueCode, uniqueCode, qrCode } }
            : table,
        ),
      );
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          placeholder="Table number (e.g., T1, Table 2)"
          className="max-w-xs"
        />
        <Button onClick={handleAddTable} disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Table"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Table {table.tableNumber}</h3>
              {!table.qrCode && (
                <Button onClick={() => handleGenerateQR(table.id)}>
                  Generate QR
                </Button>
              )}
            </div>
            {table.qrCode && <QRCode code={table.qrCode} />}
          </Card>
        ))}
      </div>
    </div>
  );
}
