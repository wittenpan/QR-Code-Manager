// app/dashboard/qr/qr-code-manager.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Download, Printer, Plus, Trash, Edit2, Check, X } from "lucide-react";
import { toast } from "../../components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Input } from "../../components/ui/input";

interface QRCodeScan {
  id: string;
  scannedAt: Date;
  ipAddress: string | null;
  deviceInfo: string | null;
}

interface QRCodeType {
  id: string;
  uniqueCode: string;
  imageData: string;
  targetUrl: string;
  table: {
    id: string;
    tableNumber: string;
  };
  scans?: QRCodeScan[];
}

interface RestaurantTable {
  id: string;
  tableNumber: string;
  qrCode?: QRCodeType | null;
}

interface QRCodeManagerProps {
  qrCodes: QRCodeType[];
  menuId: string;
}

export function QRCodeManager({ qrCodes: initialQRCodes, menuId }: QRCodeManagerProps) {
  const [qrCodes, setQRCodes] = useState<QRCodeType[]>(initialQRCodes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableNumber, setEditingTableNumber] = useState("");

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      // First, create a new table
      const tableResponse = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableNumber: `${qrCodes.length + 1}`, // Just use the number
        }),
      });

      if (!tableResponse.ok) {
        const error = await tableResponse.text();
        throw new Error(error || "Failed to create table");
      }

      const table = await tableResponse.json();

      // Then generate QR code for the table
      const qrResponse = await fetch(`/api/tables/${table.id}/qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!qrResponse.ok) {
        const error = await qrResponse.text();
        throw new Error(error || "Failed to generate QR code");
      }

      const newQRCode = await qrResponse.json();
      
      // The API returns the table with the QR code nested inside
      setQRCodes(currentQRCodes => [...currentQRCodes, {
        ...newQRCode,
        imageData: newQRCode.qrCode.imageData,
        targetUrl: newQRCode.qrCode.targetUrl,
        table: {
          id: table.id,
          tableNumber: table.tableNumber,
        },
      }]);
      
      toast({
        title: "Success",
        description: "New QR code generated successfully",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete table");
      }

      setQRCodes(currentQRCodes => currentQRCodes.filter(qr => qr.table.id !== tableId));
      
      toast({
        title: "Success",
        description: "Table deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting table:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete table",
        variant: "destructive",
      });
    }
  };

  const handleEditTableNumber = async (tableId: string) => {
    if (!editingTableNumber.trim()) {
      toast({
        title: "Error",
        description: "Table number cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableNumber: editingTableNumber,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update table");
      }

      const updatedTable = await response.json();
      
      setQRCodes(currentQRCodes => 
        currentQRCodes.map(qr => 
          qr.table.id === tableId 
            ? { ...qr, table: { ...qr.table, tableNumber: editingTableNumber } }
            : qr
        )
      );
      
      setEditingTableId(null);
      setEditingTableNumber("");
      
      toast({
        title: "Success",
        description: "Table number updated successfully",
      });
    } catch (error) {
      console.error("Error updating table:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update table",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={handleGenerateQR} disabled={isGenerating}>
        <Plus className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating..." : "Generate New QR Code"}
      </Button>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {editingTableId === qrCode.table?.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      className="h-8 w-24"
                      value={editingTableNumber}
                      onChange={(e) => setEditingTableNumber(e.target.value)}
                      placeholder="Table number"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTableNumber(qrCode.table.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTableId(null);
                        setEditingTableNumber("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Table {qrCode.table?.tableNumber || 'Unknown'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTableId(qrCode.table.id);
                        setEditingTableNumber(qrCode.table.tableNumber);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {qrCode.scans && qrCode.scans.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Last scanned: {new Date(qrCode.scans[0].scannedAt).toLocaleDateString()}
                  </span>
                )}
              </CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the table and its QR code. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDeleteTable(qrCode.table.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCode.imageData && (
                <div className="flex justify-center">
                  <Image 
                    src={qrCode.imageData} 
                    alt={`QR Code for table ${qrCode.table?.tableNumber}`}
                    width={200}
                    height={200}
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    if (qrCode.imageData) {
                      const link = document.createElement('a');
                      link.href = qrCode.imageData;
                      link.download = `table-${qrCode.table?.tableNumber || 'unknown'}-qr.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (qrCode.imageData) {
                      const printWindow = window.open('', '', 'width=600,height=600');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print QR Code</title>
                              <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                                img { max-width: 100%; height: auto; }
                              </style>
                            </head>
                            <body>
                              <img src="${qrCode.imageData}" alt="QR Code" />
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                      }
                    }
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}