// app/api/menu-items/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      basePrice,
      menuId,
      category,
      images,
      variants,
      translations,
    } = body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        basePrice,
        category,
        menuId,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
        translations: {
          create: translations,
        },
      },
      include: {
        images: true,
        variants: true,
        translations: true,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Error creating menu item" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get("menuId");

    const menuItems = await prisma.menuItem.findMany({
      where: {
        menuId: menuId || undefined,
      },
      include: {
        images: true,
        variants: true,
        translations: true,
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Error fetching menu items" },
      { status: 500 },
    );
  }
}
