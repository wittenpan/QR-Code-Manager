// app/api/menu-items/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        variants: true,
        translations: true,
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Error fetching menu item" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      basePrice,
      category,
      images,
      variants,
      translations,
    } = body;

    // Update the menu item and related records
    const menuItem = await prisma.$transaction(async (prisma) => {
      // Update main menu item
      const updated = await prisma.menuItem.update({
        where: { id: params.id },
        data: {
          name,
          description,
          basePrice,
          category,
        },
      });

      // Handle images
      await prisma.menuItemImage.deleteMany({
        where: { menuItemId: params.id },
      });
      await prisma.menuItemImage.createMany({
        data: images.map((image: any) => ({
          ...image,
          menuItemId: params.id,
        })),
      });

      // Handle variants
      await prisma.menuItemVariant.deleteMany({
        where: { menuItemId: params.id },
      });
      await prisma.menuItemVariant.createMany({
        data: variants.map((variant: any) => ({
          ...variant,
          menuItemId: params.id,
        })),
      });

      // Handle translations
      await prisma.menuItemTranslation.deleteMany({
        where: { menuItemId: params.id },
      });
      await prisma.menuItemTranslation.createMany({
        data: translations.map((translation: any) => ({
          ...translation,
          menuItemId: params.id,
        })),
      });

      return updated;
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Error updating menu item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.menuItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Error deleting menu item" },
      { status: 500 },
    );
  }
}
