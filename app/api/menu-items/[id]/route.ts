// app/api/menu-items/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      basePrice,
      category,
      images,
      variants,
      translations,
      addons,
    } = body;
    console.log('API Route - Request Body:', body);
    console.log('API Route - Item ID:', params.id);

    // Verify the menu item belongs to the user's restaurant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        menu: {
          restaurant: {
            ownerId: session.user.id,
          },
        },
      },
    });

    if (!existingItem) {
      return new NextResponse("Menu item not found", { status: 404 });
    }

    // Update using transaction to handle related records
    const updatedItem = await prisma.$transaction(async (tx) => {
      // Delete existing related records
      await tx.menuItemImage.deleteMany({ where: { menuItemId: params.id } });
      await tx.menuItemVariant.deleteMany({ where: { menuItemId: params.id } });
      await tx.menuItemTranslation.deleteMany({ where: { menuItemId: params.id } });
      await tx.menuItemAddon.deleteMany({ where: { menuItemId: params.id } });

      // Update the menu item and create new related records
      return tx.menuItem.update({
        where: { id: params.id },
        data: {
          name,
          description,
          basePrice,
          category,
          images: {
            create: images,
          },
          variants: {
            create: variants,
          },
          translations: {
            create: translations,
          },
          addons: {
            create: addons,
          },
        },
        include: {
          images: true,
          variants: true,
          translations: true,
          addons: true,
        },
      });
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the menu item belongs to the user's restaurant
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: params.id,
        menu: {
          restaurant: {
            ownerId: session.user.id,
          },
        },
      },
    });

    if (!menuItem) {
      return new NextResponse("Menu item not found", { status: 404 });
    }

    // Delete the menu item and all related records
    await prisma.$transaction([
      // Delete related records first
      prisma.menuItemImage.deleteMany({
        where: { menuItemId: params.id },
      }),
      prisma.menuItemVariant.deleteMany({
        where: { menuItemId: params.id },
      }),
      prisma.menuItemAddon.deleteMany({
        where: { menuItemId: params.id },
      }),
      prisma.menuItemTranslation.deleteMany({
        where: { menuItemId: params.id },
      }),
      // Finally delete the menu item
      prisma.menuItem.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}