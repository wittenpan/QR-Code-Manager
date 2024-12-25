// app/api/tables/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TableStatus } from "app/dashboard/tables/table-status";

const createTableSchema = z.object({
  tableNumber: z.string().min(1),
  zone: z.string().optional(),
  capacity: z.number().min(1).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { tableNumber, zone, capacity } = createTableSchema.parse(body);

    // Get the restaurant for the current user
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!restaurant) {
      return new Response("Restaurant not found", { status: 404 });
    }

    // Check if table number already exists for this restaurant
    const existingTable = await prisma.restaurantTable.findFirst({
      where: {
        restaurantId: restaurant.id,
        tableNumber,
      },
    });

    if (existingTable) {
      return new Response("Table number already exists", { status: 400 });
    }

    // Create the table
    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber,
        zone: zone || "Main",
        capacity: capacity || 4,
        status: TableStatus.AVAILABLE,
        restaurant: {
          connect: { id: restaurant.id },
        },
      },
      include: {
        qrCode: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error creating table:", error);
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Error creating table", { status: 500 });
  }
}
