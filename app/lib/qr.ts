import QRCode from "qrcode";
import { prisma } from "./db";

export async function generateMenuQR(restaurantId: string, menuId: string) {
  // First, create a QR code entry in the database
  const table = await prisma.restaurantTable.findFirst({
    where: {
      restaurantId,
    },
  });

  if (!table) {
    throw new Error("No table found for this restaurant");
  }

  const qrCodeEntry = await prisma.qRCode.create({
    data: {
      uniqueCode: `${restaurantId}-${menuId}-${Date.now()}`,
      restaurantId,
      tableId: table.id,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const menuUrl = `${baseUrl}/menu/${qrCodeEntry.uniqueCode}`;

  const qrCode = await QRCode.toDataURL(menuUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });

  return {
    qrCode,
    uniqueCode: qrCodeEntry.uniqueCode,
    url: menuUrl,
  };
}

export async function generateQRCode(restaurantId: string, tableId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const tableUrl = `${baseUrl}/table/${tableId}`;

  const qrCode = await QRCode.toDataURL(tableUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });

  return {
    qrCode,
    uniqueCode: tableId,
    url: tableUrl,
  };
}
