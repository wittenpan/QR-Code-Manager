// app/api/tables/[id]/status/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { TableStatus } from "app/dashboard/tables/table-status";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { status } = await req.json();

    // Validate status
    if (!Object.values(TableStatus).includes(status)) {
      return new Response("Invalid status", { status: 400 });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: params.id },
      include: { 
        restaurant: true,
        qrCode: true
      },
    });

    if (!table || table.restaurant.ownerId !== session.user.id) {
      return new Response("Table not found or unauthorized", { status: 404 });
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: { id: params.id },
      data: {
        status,
        lastOccupied: status === "OCCUPIED" ? new Date() : undefined,
      },
      include: {
        qrCode: true,
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Error updating table status:", error);
    return new Response("Error updating table status", { status: 500 });
  }
}
