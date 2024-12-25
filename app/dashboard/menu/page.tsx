// app/dashboard/menu/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";
import { MenuEditor } from "@/(restaurant)/menu-editor/MenuEditor";
import {
  ExtendedMenu,
  ExtendedMenuItem,
  Image,
  Variant,
  Translation,
  Addon,
} from "../../types/menu";

export default async function MenuManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const rawMenus = await prisma.menu.findMany({
    where: {
      restaurant: {
        ownerId: session.user.id,
      },
    },
    include: {
      menuItems: {
        include: {
          images: true,
          variants: true,
          translations: true,
          addons: true,
        },
      },
    },
  });

  // Transform the data to match our ExtendedMenu type with explicit type casting
  const menus: ExtendedMenu[] = rawMenus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    language: menu.language,
    restaurantId: menu.restaurantId,
    startTime: menu.startTime,
    endTime: menu.endTime,
    createdAt: menu.createdAt,
    updatedAt: menu.updatedAt,
    menuItems: menu.menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      category: item.category || "",
      isAvailable: item.isAvailable,
      menuId: item.menuId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      images: item.images.map(
        (img): Image => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          menuItemId: img.menuItemId,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
        }),
      ),
      variants: item.variants.map(
        (variant): Variant => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          menuItemId: variant.menuItemId,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
        }),
      ),
      translations: item.translations.map(
        (translation): Translation => ({
          id: translation.id,
          language: translation.language,
          name: translation.name,
          description: translation.description,
          menuItemId: translation.menuItemId,
          createdAt: translation.createdAt,
          updatedAt: translation.updatedAt,
        }),
      ),
      addons: item.addons.map(
        (addon): Addon => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          available: addon.available,
          menuItemId: addon.menuItemId,
          createdAt: addon.createdAt,
          updatedAt: addon.updatedAt,
        }),
      ),
    })) as ExtendedMenuItem[],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Menu Management</h2>
        <p className="text-muted-foreground">
          Create and manage your restaurant menus
        </p>
      </div>
      <MenuEditor initialMenus={menus} />
    </div>
  );
}
