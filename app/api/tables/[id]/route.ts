import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id: params.id },
      include: { 
        restaurant: true,
        qrCode: true,
        orders: true
      },
    });

    if (!table || table.restaurant.ownerId !== session.user.id) {
      return new Response("Table not found or unauthorized", { status: 404 });
    }

    // Delete in the correct order to handle foreign key constraints
    if (table.qrCode) {
      // First delete QR code scans
      await prisma.qRCodeScan.deleteMany({
        where: { qrCodeId: table.qrCode.id }
      });

      // Then delete the QR code
      await prisma.qRCode.delete({
        where: { id: table.qrCode.id }
      });
    }

    // Delete any order items associated with orders
    for (const order of table.orders) {
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id }
      });
    }

    // Delete orders
    await prisma.order.deleteMany({
      where: { tableId: table.id }
    });

    // Finally delete the table
    await prisma.restaurantTable.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table:", error);
    return new Response("Error deleting table", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { tableNumber } = body;

    if (!tableNumber) {
      return new Response("Table number is required", { status: 400 });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!table || table.restaurant.ownerId !== session.user.id) {
      return new Response("Table not found or unauthorized", { status: 404 });
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: { id: params.id },
      data: { tableNumber },
      include: {
        qrCode: true,
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Error updating table:", error);
    return new Response("Error updating table", { status: 500 });
  }
}
