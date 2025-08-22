import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Company {
  company: string;
  champions: number;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('champion_positions')
        .select('company, champion_id')
        .eq('is_current', true)
        .order('company');

      if (error) throw error;

      // Group by company and count champions
      const companyMap = new Map<string, number>();
      data?.forEach(item => {
        const count = companyMap.get(item.company) || 0;
        companyMap.set(item.company, count + 1);
      });

      const companiesData = Array.from(companyMap.entries()).map(([company, champions]) => ({
        company,
        champions,
      }));

      setCompanies(companiesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Skeleton key={i} className="h-32" />
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
            <Building2 className="w-8 h-8 text-primary" />
            Companies
          </h1>
          <p className="text-muted-foreground">
            Track companies in your champion network
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
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <CardTitle>No companies found</CardTitle>
              <CardDescription>
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Companies will appear here as you add champions with position information"
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
          {filteredCompanies.map((company) => (
            <Card key={company.company} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {company.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{company.champions} champion{company.champions !== 1 ? 's' : ''}</span>
                  </div>
                  <Badge variant="secondary">
                    {company.champions}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}