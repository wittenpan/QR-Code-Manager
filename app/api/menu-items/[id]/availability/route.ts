// app/api/menu-items/[id]/availability/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { isAvailable } = body;

    const updatedItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: { isAvailable },
      include: {
        images: true,
        variants: true,
        translations: true,
        addons: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating availability:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
