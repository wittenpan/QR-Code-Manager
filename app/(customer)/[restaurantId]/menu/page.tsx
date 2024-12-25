// app/(customer)/[restaurantId]/menu/page.tsx
import { prisma } from "../../../lib/db";
import { MenuView } from "./menu-view";
import { LanguageSwitcher } from "../../../components/ui/language-switcher";
import { Menu } from "../../../types/menu";

export default async function MenuPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const menu = (await prisma.menu.findFirst({
    where: { restaurantId: params.restaurantId },
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
  })) as Menu | null; // Type assertion here

  if (!menu) {
    return <div>Menu not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{menu.name}</h1>
        <LanguageSwitcher />
      </div>
      <MenuView menu={menu} />
    </div>
  );
}
