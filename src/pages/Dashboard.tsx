import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ChampionCard } from "@/components/champions/ChampionCard";
import { UserPlus, Calendar, MessageSquare, Phone, Video } from "lucide-react";

// Mock data for champions
const mockChampions = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    company: "TechCorp Inc.",
    title: "VP of Engineering",
    influenceScore: 92,
    status: "active" as const,
    lastInteraction: "2024-01-15",
    linkedinUrl: "https://linkedin.com/in/sarahjohnson"
  },
  {
    id: "2", 
    name: "Michael Chen",
    email: "mchen@innovate.io",
    company: "Innovate Solutions",
    title: "Chief Technology Officer",
    influenceScore: 88,
    status: "active" as const,
    lastInteraction: "2024-01-12",
    linkedinUrl: "https://linkedin.com/in/michaelchen"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@startupxyz.com", 
    company: "StartupXYZ",
    title: "Head of Product",
    influenceScore: 76,
    status: "new" as const,
    lastInteraction: "2024-01-10",
    linkedinUrl: "https://linkedin.com/in/emilyrodriguez"
  }
];

// Mock data for recent activities
const recentActivities = [
  {
    id: "1",
    type: "meeting",
    description: "Had coffee meeting with Sarah Johnson",
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    id: "2", 
    type: "email",
    description: "Sent follow-up email to Michael Chen",
    timestamp: "2024-01-14T15:45:00Z"
  },
  {
    id: "3",
    type: "linkedin",
    description: "Connected with Emily Rodriguez on LinkedIn",
    timestamp: "2024-01-13T09:20:00Z"
  },
  {
    id: "4",
    type: "call",
    description: "Phone call with Alex Thompson",
    timestamp: "2024-01-12T14:15:00Z"
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your champion relationships and recent activities
          </p>
        </div>
        
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Champion
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Champions Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top Champions</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div className="grid gap-4">
            {mockChampions.map((champion) => (
              <ChampionCard key={champion.id} champion={champion} />
            ))}
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Today's Activities</CardTitle>
              <CardDescription>Latest interactions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {activity.type === "meeting" && <Calendar className="h-4 w-4" />}
                    {activity.type === "email" && <MessageSquare className="h-4 w-4" />}
                    {activity.type === "linkedin" && <UserPlus className="h-4 w-4" />}
                    {activity.type === "call" && <Phone className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Champion
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Video className="mr-2 h-4 w-4" />
                Video Call
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}