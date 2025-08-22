import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCircle, Clock, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  status: string;
  channel: string;
  created_at: string;
  sent_at?: string;
  champion_id?: string;
  event_id?: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'sent':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'read' })
        .eq('id', alertId);

      if (error) throw error;
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, status: 'read' } : alert
      ));

      toast({
        title: "Success",
        description: "Alert marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" />
            Alerts
          </h1>
          <p className="text-muted-foreground">
            Manage notifications and alert preferences
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/settings">
            <Settings className="w-4 h-4 mr-2" />
            Alert Settings
          </Link>
        </Button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <CardTitle>No alerts yet</CardTitle>
              <CardDescription>
                Alerts and notifications will appear here as they are generated
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(alert.status)}
                    <div>
                      <CardTitle className="text-base">
                        Alert via {alert.channel}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(alert.created_at).toLocaleString()}
                        {alert.sent_at && (
                          <span> • Sent {new Date(alert.sent_at).toLocaleString()}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(alert.status)}>
                      {alert.status}
                    </Badge>
                    {alert.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markAsRead(alert.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}