// app/(restaurant)/[restaurantId]/tables/qr-code.tsx
"use client";

import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

interface QRCodeProps {
  code: {
    id: string;
    uniqueCode: string;
    qrCode?: string;
  };
}

export function QRCode({ code }: QRCodeProps) {
  const handleDownload = () => {
    if (!code.qrCode) return;

    const link = document.createElement("a");
    link.href = code.qrCode;
    link.download = `qr-code-${code.uniqueCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!code.qrCode) return;

    const printWindow = window.open("", "", "width=600,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${code.uniqueCode}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${code.qrCode}" alt="QR Code" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Card className="p-4 space-y-4">
      {code.qrCode && (
        <div className="relative w-full aspect-square">
          <Image
            src={code.qrCode}
            alt={`QR Code for ${code.uniqueCode}`}
            fill
            className="object-contain"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          Download
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          Print
        </Button>
      </div>
    </Card>
  );
}
