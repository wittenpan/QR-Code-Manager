// app/api/restaurants/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, location = "", contactInfo = "" } = body;

    if (!name?.trim()) {
      return new NextResponse("Restaurant name is required", { status: 400 });
    }

    // Create the restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        location, // Add these required fields
        contactInfo, // Add these required fields
        ownerId: session.user.id,
        menus: {
          create: {
            name: "Main Menu",
            language: "en",
          },
        },
      },
      include: {
        menus: true,
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
