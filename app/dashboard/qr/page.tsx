// app/dashboard/qr/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";
import { QRCodeManager } from "./qr-code-manager";

export default async function QRCodesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  // Get the user's restaurant
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
    include: {
      menus: true,
    },
  });

  console.log("Restaurant:", restaurant);

  if (!restaurant) {
    // Handle the case where the user doesn't have a restaurant
    return (
      <div>
        <h2>No Restaurant Found</h2>
        <p>Please create a restaurant first.</p>
      </div>
    );
  }

  // Get all tables with their QR codes
  const tables = await prisma.restaurantTable.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    include: {
      qrCode: {
        include: {
          scans: {
            orderBy: {
              scannedAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  console.log("Tables:", tables);

  // Format the data for the QR code manager without regenerating QR codes
  const qrCodes = tables
    .filter((table) => table.qrCode !== null)
    .map((table) => ({
      ...table.qrCode!,
      imageData: table.qrCode!.imageData ?? "",
      targetUrl: table.qrCode!.targetUrl ?? "", // Provide default value
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
      },
    }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          QR Code Management
        </h2>
        <p className="text-muted-foreground">
          Generate and manage QR codes for your tables
        </p>
      </div>
      <QRCodeManager 
        qrCodes={qrCodes} 
        menuId={restaurant.menus[0].id}
      />
    </div>
  );
}