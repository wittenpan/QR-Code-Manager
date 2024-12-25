import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DashboardCard } from "./components/dashboard-card";
import { prisma } from "../lib/db";
import { QrCode, Menu, Table, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  // Get all restaurants for the user
  const restaurants = await prisma.restaurant.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      menus: {
        include: {
          menuItems: true,
        },
      },
      tables: true,
      qrCodes: true,
    },
  });

  if (restaurants.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Welcome to Restaurant QR Menu</h1>
          <p className="text-gray-600">
            Get started by setting up your first restaurant. You'll be able to
            create menus, generate QR codes, and manage tables all in one place.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/restaurants/new">Create Restaurant</Link>
          </Button>
        </div>
      </div>
    );
  }

  // For now, we'll show stats for the first restaurant
  // You might want to add restaurant switching functionality later
  const activeRestaurant = restaurants[0];

  const totalMenuItems = activeRestaurant.menus.reduce(
    (acc, menu) => acc + menu.menuItems.length,
    0,
  );

  const stats = [
    {
      title: "Total Menus",
      value: activeRestaurant.menus.length,
      icon: Menu,
    },
    {
      title: "Menu Items",
      value: totalMenuItems,
      icon: Menu,
    },
    {
      title: "Tables",
      value: activeRestaurant.tables.length,
      icon: Table,
    },
    {
      title: "QR Codes",
      value: activeRestaurant.qrCodes.length,
      icon: QrCode,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.name}
        </h2>
        <p className="text-muted-foreground">
          {activeRestaurant.name} Dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/menu">
                <Menu className="mr-2 h-4 w-4" />
                Manage Menu
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/tables">
                <Table className="mr-2 h-4 w-4" />
                Manage Tables
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/qr">
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Codes
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="border rounded-lg p-4">
            {/* Add recent activity items here */}
            <p className="text-sm text-muted-foreground">
              No recent activity to show
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
