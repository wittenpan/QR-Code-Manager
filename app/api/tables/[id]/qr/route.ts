// app/api/tables/[id]/qr/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/db";
import { generateQRCode } from "../../../../lib/qr";
import { NextResponse } from "next/server";
import { RestaurantTable, QRCode } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
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
        qrCode: true
      },
    });

    if (!table || table.restaurant.ownerId !== session.user.id) {
      return new Response("Table not found or unauthorized", { status: 404 });
    }

    // If QR code already exists, return it
    if (table.qrCode) {
      return NextResponse.json(table);
    }

    // If no QR code exists, generate a new one
    const qrCodeData = await generateQRCode(table.restaurantId, table.id);

    const updatedTable = await prisma.restaurantTable.update({
      where: {
        id: params.id,
      },
      data: {
        qrCode: {
          create: {
            uniqueCode: qrCodeData.uniqueCode,
            restaurantId: table.restaurantId,
            imageData: qrCodeData.qrCode,
            targetUrl: qrCodeData.url,
          },
        },
      },
      include: {
        qrCode: true,
      },
    }) as RestaurantTable & { qrCode: QRCode | null };

    return NextResponse.json({
      ...updatedTable,
      qrCode: {
        ...updatedTable.qrCode,
        imageData: qrCodeData.qrCode,
        targetUrl: qrCodeData.url,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return new Response("Error generating QR code", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
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
        qrCode: true
      },
    });

    if (!table || table.restaurant.ownerId !== session.user.id) {
      return new Response("Table not found or unauthorized", { status: 404 });
    }

    if (!table.qrCode) {
      return new Response("QR code not found", { status: 404 });
    }

    // Generate fresh image data for the existing QR code
    const qrCodeData = await generateQRCode(table.restaurantId, table.id);

    return NextResponse.json({
      ...table,
      qrCode: {
        ...table.qrCode,
        imageData: qrCodeData.qrCode,
        targetUrl: qrCodeData.url,
      },
    });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return new Response("Error fetching QR code", { status: 500 });
  }
}
