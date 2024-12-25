import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { generateMenuQR } from "../../lib/qr";
import { prisma } from "../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { menuId } = body;

    if (!menuId) {
      return NextResponse.json(
        { error: "menuId is required" },
        { status: 400 }
      );
    }

    // First verify that the menu belongs to one of the user's restaurants
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        restaurant: {
          ownerId: session.user.id,
        },
      },
      include: {
        restaurant: true,
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found or unauthorized" },
        { status: 404 }
      );
    }

    const qrCode = await generateMenuQR(menu.restaurant.id, menuId);

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}