// app/dashboard/tables/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TableManager } from "./table-manager";
import type { TableStatus } from "./table-status";
import type { RestaurantTable } from "@prisma/client";

type TableWithQR = RestaurantTable & {
  qrCode: { id: string } | null;
};

export default async function TablesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const tables = await prisma.restaurantTable.findMany({
    where: {
      restaurant: {
        ownerId: session.user.id,
      },
    },
    orderBy: {
      tableNumber: 'asc',
    },
    include: {
      qrCode: {
        select: {
          id: true,
        },
      },
    }
  }) as TableWithQR[];

  // Transform the data to match the Table interface
  const transformedTables = tables.map(table => ({
    id: table.id,
    tableNumber: table.tableNumber,
    status: table.status as TableStatus, // Cast to our local TableStatus enum
    zone: table.zone,
    capacity: table.capacity,
    lastOccupied: table.lastOccupied?.toISOString() || null,
    qrCode: table.qrCode,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Table Management</h2>
        <p className="text-muted-foreground">
          Manage your restaurant tables, track their status, and generate QR codes
        </p>
      </div>
      <TableManager tables={transformedTables} />
    </div>
  );
}
