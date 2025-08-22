import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ChampionCard } from "@/components/champions/ChampionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

// Mock data - will be replaced with real data from Supabase
const mockChampions = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@acme.com",
    company: "Acme Corp",
    title: "VP of Engineering",
    influenceScore: 9.2,
    status: "active" as const,
    lastInteraction: "2 days ago",
    linkedinUrl: "https://linkedin.com/in/sarahchen",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "m.rodriguez@techflow.io",
    company: "TechFlow Solutions",
    title: "CTO",
    influenceScore: 8.7,
    status: "new" as const,
    lastInteraction: "1 week ago",
  },
  {
    id: "3",
    name: "Emily Watson",
    email: "emily@innovate.com",
    company: "Innovate Labs",
    title: "Head of Product",
    influenceScore: 7.5,
    status: "active" as const,
    lastInteraction: "5 days ago",
    linkedinUrl: "https://linkedin.com/in/emilywatson",
  },
];

const recentActivities = [
  {
    id: "1",
    type: "champion_move",
    description: "Sarah Chen moved from Acme Corp to TechStart Inc",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "interaction",
    description: "Email sent to Michael Rodriguez",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    type: "new_champion",
    description: "Added Emily Watson as new champion",
    timestamp: "3 days ago",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your champions and their influence across organizations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Champion
        </Button>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Champions */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Champions</CardTitle>
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {mockChampions.map((champion) => (
                <ChampionCard key={champion.id} champion={champion} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex flex-col space-y-1 border-b border-border last:border-0 pb-3 last:pb-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}