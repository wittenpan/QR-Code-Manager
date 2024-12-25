// app/dashboard/analytics/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getMenuAnalytics } from "../../lib/analytics";
import { AnalyticsChart } from "./analytics-chart";
import { StatCard } from "./components/stat-card";
import { PopularItemsList } from "./components/popular-items-list";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Eye, Users, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  // Get the first restaurant's ID (or handle multiple restaurants differently)
  const restaurantId = session.user.restaurants[0]?.id;
  if (!restaurantId) redirect("/dashboard");

  const analytics = await getMenuAnalytics(restaurantId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Views"
          value={analytics.views}
          icon={<Eye className="h-4 w-4" />}
        />
        <StatCard
          title="Unique Visitors"
          value={analytics.uniqueVisitors}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Avg. Time on Menu"
          value="3:45"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={analytics.viewsByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <PopularItemsList items={analytics.popularItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
