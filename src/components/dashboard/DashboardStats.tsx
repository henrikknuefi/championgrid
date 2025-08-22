import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, TrendingUp, Bell } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{description}</span>
          {trend && (
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Champions"
        value={42}
        description="Active advocates"
        icon={<Users className="h-4 w-4" />}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Companies Tracked"
        value={18}
        description="Organizations monitored"
        icon={<Building2 className="h-4 w-4" />}
        trend={{ value: 5, isPositive: true }}
      />
      <StatCard
        title="Influence Score"
        value="8.2"
        description="Average champion influence"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: 3, isPositive: true }}
      />
      <StatCard
        title="Active Alerts"
        value={7}
        description="Recent champion moves"
        icon={<Bell className="h-4 w-4" />}
        trend={{ value: 2, isPositive: false }}
      />
    </div>
  );
}