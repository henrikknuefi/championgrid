import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Calendar, User, Building2 } from 'lucide-react';

interface Event {
  id: string;
  type: string;
  occurred_at: string;
  payload: any;
  champion_id?: string;
}

export default function Activities() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'champion_added':
        return <User className="w-4 h-4" />;
      case 'position_changed':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'champion_added':
        return 'default';
      case 'position_changed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatEventDescription = (event: Event) => {
    const payload = event.payload || {};
    
    switch (event.type) {
      case 'champion_added':
        return `New champion ${payload.name || 'unknown'} was added to the system`;
      case 'position_changed':
        return `Champion position updated: ${payload.company || 'Unknown company'}`;
      default:
        return `${event.type} event occurred`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          Activities
        </h1>
        <p className="text-muted-foreground">
          Track all events and activities in your champion network
        </p>
      </div>

      {/* Activity Timeline */}
      {events.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <Activity className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <CardTitle>No activities yet</CardTitle>
              <CardDescription>
                Activities will appear here as you interact with your champion network
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {formatEventDescription(event)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.occurred_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getEventVariant(event.type)}>
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              {event.payload && Object.keys(event.payload).length > 0 && (
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Event Details:</div>
                    <pre className="text-xs text-foreground whitespace-pre-wrap">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}