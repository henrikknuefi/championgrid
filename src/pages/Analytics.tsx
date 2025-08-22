import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Building2, Activity, BarChart3 } from 'lucide-react';

interface Analytics {
  totalChampions: number;
  totalCompanies: number;
  totalEvents: number;
  recentActivityCount: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalChampions: 0,
    totalCompanies: 0,
    totalEvents: 0,
    recentActivityCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total champions
      const { count: championsCount, error: championsError } = await supabase
        .from('champions')
        .select('*', { count: 'exact', head: true });

      if (championsError) throw championsError;

      // Get total companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('champion_positions')
        .select('company')
        .eq('is_current', true);

      if (companiesError) throw companiesError;

      const uniqueCompanies = new Set(companiesData?.map(item => item.company) || []);

      // Get total events
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (eventsError) throw eventsError;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentActivityCount, error: recentActivityError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('occurred_at', sevenDaysAgo.toISOString());

      if (recentActivityError) throw recentActivityError;

      setAnalytics({
        totalChampions: championsCount || 0,
        totalCompanies: uniqueCompanies.size,
        totalEvents: eventsCount || 0,
        recentActivityCount: recentActivityCount || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: "Total Champions",
      value: analytics.totalChampions,
      description: "Champions in your network",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Companies",
      value: analytics.totalCompanies,
      description: "Unique companies represented",
      icon: Building2,
      color: "text-green-500",
    },
    {
      title: "Total Events",
      value: analytics.totalEvents,
      description: "All recorded activities",
      icon: Activity,
      color: "text-orange-500",
    },
    {
      title: "Recent Activity",
      value: analytics.recentActivityCount,
      description: "Events in the last 7 days",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Insights and metrics for your champion network
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metric.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              Champion network growth over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Distribution</CardTitle>
            <CardDescription>
              Champions by company representation
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}