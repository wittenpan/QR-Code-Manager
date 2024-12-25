// app/(restaurant)/[restaurantId]/tables/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { prisma } from "../../../lib/db";
import { TableManager } from "./table-manager";
import { redirect } from "next/navigation";

export default async function TablesPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const tables = await prisma.restaurantTable.findMany({
    where: {
      restaurantId: params.restaurantId,
      restaurant: {
        ownerId: session.user.id,
      },
    },
    include: {
      qrCode: true,
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Table Management</h1>
      <TableManager tables={tables} restaurantId={params.restaurantId} />
    </div>
  );
}
