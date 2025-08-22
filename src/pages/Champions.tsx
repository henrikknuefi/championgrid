import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Users, Mail, Building, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Champion {
  id: string;
  full_name: string;
  email: string;
  linkedin_url?: string;
  source: string;
  created_at: string;
}

export default function Champions() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchChampions();
  }, []);

  const fetchChampions = async () => {
    try {
      const { data, error } = await supabase
        .from('champions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChampions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load champions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChampions = champions.filter(champion =>
    champion.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    champion.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
            <Users className="w-8 h-8 text-primary" />
            Champions
          </h1>
          <p className="text-muted-foreground">
            Manage your champion network and relationships
          </p>
        </div>
        <Button asChild>
          <Link to="/champions/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Champion
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search champions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Champions Grid */}
      {filteredChampions.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <Users className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <CardTitle>No champions found</CardTitle>
              <CardDescription>
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Start building your champion network by adding your first champion"
                }
              </CardDescription>
            </div>
            {!searchTerm && (
              <Button asChild>
                <Link to="/champions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Champion
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChampions.map((champion) => (
            <Card key={champion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{champion.full_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {champion.email}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {champion.source}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {champion.linkedin_url && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={champion.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                    </a>
                  </Button>
                )}
                <div className="text-xs text-muted-foreground">
                  Added {new Date(champion.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}