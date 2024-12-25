import { prisma } from "./db";

export async function trackMenuView(menuId: string, sessionId: string) {
  await prisma.menuView.create({
    data: {
      menuId,
      sessionId,
      timestamp: new Date(),
    },
  });
}

export async function trackItemView(itemId: string, sessionId: string) {
  await prisma.itemView.create({
    data: {
      menuItemId: itemId,
      sessionId,
      timestamp: new Date(),
    },
  });
}

export async function getMenuAnalytics(
  menuId: string,
  days: number = 30,
): Promise<MenuAnalytics> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [views, uniqueVisitors, popularItems, viewsByTime, viewsByDay] =
    await Promise.all([
      prisma.menuView.count({
        where: {
          menuId,
          timestamp: { gte: startDate },
        },
      }),
      prisma.menuView.groupBy({
        by: ["sessionId"],
        where: {
          menuId,
          timestamp: { gte: startDate },
        },
        _count: true,
      }),
      prisma.itemView.groupBy({
        by: ["menuItemId"],
        where: {
          menuItem: { menuId },
          timestamp: { gte: startDate },
        },
        _count: true,
        orderBy: {
          _count: {
            sessionId: "desc",
          },
        },
        take: 10,
      }),
      // Add more queries for time-based analytics
    ]);

  return {
    views,
    uniqueVisitors: uniqueVisitors.length,
    popularItems,
    viewsByTime,
    viewsByDay,
  };
}
