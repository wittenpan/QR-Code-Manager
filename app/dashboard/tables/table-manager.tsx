// app/dashboard/tables/table-manager.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Plus, QrCode } from "lucide-react";
import { toast } from "../../components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { TableStatus } from "./table-status";

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface Table {
  id: string;
  tableNumber: string;
  status: TableStatus;
  zone: string | null;
  capacity: number;
  lastOccupied: string | null;
  qrCode: { id: string } | null;
}

export interface TableManagerProps {
  tables: Table[];
}

const getStatusVariant = (status: TableStatus): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case TableStatus.AVAILABLE:
      return "outline";
    case TableStatus.OCCUPIED:
      return "default";
    case TableStatus.RESERVED:
      return "secondary";
    case TableStatus.MAINTENANCE:
      return "destructive";
  }
};

const getStatusColor = (status: TableStatus): string => {
  switch (status) {
    case TableStatus.AVAILABLE:
      return "text-green-600";
    case TableStatus.OCCUPIED:
      return "text-blue-600";
    case TableStatus.RESERVED:
      return "text-orange-600";
    case TableStatus.MAINTENANCE:
      return "text-gray-600";
  }
};

export function TableManager({ tables: initialTables }: TableManagerProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("all");

  // Calculate table statistics
  const tableStats = useMemo<TableStats>(() => {
    return tables.reduce(
      (acc, table) => {
        acc.total++;
        switch (table.status) {
          case TableStatus.AVAILABLE:
            acc.available++;
            break;
          case TableStatus.OCCUPIED:
            acc.occupied++;
            break;
          case TableStatus.RESERVED:
            acc.reserved++;
            break;
          case TableStatus.MAINTENANCE:
            acc.maintenance++;
            break;
        }
        return acc;
      },
      { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 }
    );
  }, [tables]);

  // Get unique zones
  const zones = useMemo(() => {
    const uniqueZones = new Set(tables.map(table => table.zone || "Unassigned"));
    return ["all", ...Array.from(uniqueZones)];
  }, [tables]);

  // Filter tables by zone
  const filteredTables = useMemo(() => {
    if (selectedZone === "all") return tables;
    return tables.filter(table => table.zone === selectedZone);
  }, [tables, selectedZone]);

  const handleAddTable = async () => {
    if (!newTableNumber.trim() || isLoading) return;

    setIsLoading(true);
    try {
      console.log("Request body:", { tableNumber: newTableNumber });
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: newTableNumber }),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Error adding table:", response.status, errorResponse, response.headers);
        throw new Error("Failed to add table");
      }

      const newTable = await response.json();
      setTables([...tables, newTable]);
      setNewTableNumber("");
      toast({
        title: "Success",
        description: "Table added successfully",
      });
    } catch (error) {
      console.error("Error adding table:", error);
      toast({
        title: "Error",
        description: "Failed to add table",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/qr`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Error generating QR code:", response.status, errorResponse, response.headers);
        throw new Error("Failed to generate QR code");
      }

      const updatedTable = await response.json();
      setTables(
        tables.map((table) => (table.id === tableId ? updatedTable : table)),
      );

      toast({
        title: "Success",
        description: "QR code generated successfully",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTableStatus = async (tableId: string, status: TableStatus) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Error updating table status:", response.status, errorResponse, response.headers);
        throw new Error("Failed to update table status");
      }

      const updatedTable = await response.json();
      setTables(
        tables.map((table) => (table.id === tableId ? updatedTable : table))
      );

      toast({
        title: "Success",
        description: "Table status updated successfully",
      });
    } catch (error) {
      console.error("Error updating table status:", error);
      toast({
        title: "Error",
        description: "Failed to update table status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tableStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(TableStatus.AVAILABLE)}`}>
              {tableStats.available}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(TableStatus.OCCUPIED)}`}>
              {tableStats.occupied}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(TableStatus.RESERVED)}`}>
              {tableStats.reserved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(TableStatus.MAINTENANCE)}`}>
              {tableStats.maintenance}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <Input
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          placeholder="Table number (e.g., T1, Table 2)"
          className="max-w-xs"
        />
        <Button onClick={handleAddTable} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Table
        </Button>
        <Select value={selectedZone} onValueChange={setSelectedZone}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map(zone => (
              <SelectItem key={zone} value={zone}>
                {zone.charAt(0).toUpperCase() + zone.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Table {table.tableNumber}
                </CardTitle>
                <Badge variant={getStatusVariant(table.status)}>
                  {table.status.toLowerCase()}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Zone: {table.zone || "Unassigned"}
                {table.lastOccupied && (
                  <div>Last occupied: {new Date(table.lastOccupied).toLocaleString()}</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={table.status}
                onValueChange={(value) => handleUpdateTableStatus(table.id, value as TableStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TableStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {table.qrCode ? (
                <div className="text-center text-sm text-muted-foreground">
                  QR Code generated
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleGenerateQR(table.id)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
