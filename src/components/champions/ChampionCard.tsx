import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Star, ExternalLink, Building2 } from "lucide-react";

interface ChampionCardProps {
  champion: {
    id: string;
    name: string;
    email: string;
    company: string;
    title: string;
    influenceScore: number;
    avatar?: string;
    linkedinUrl?: string;
    status: "active" | "inactive" | "new";
    lastInteraction: string;
  };
}

export function ChampionCard({ champion }: ChampionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "new":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getInfluenceColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={champion.avatar} alt={champion.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(champion.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{champion.name}</h3>
              <p className="text-sm text-muted-foreground">{champion.email}</p>
            </div>
          </div>
          <Badge className={getStatusColor(champion.status)}>
            {champion.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{champion.company}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>{champion.title}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className={`h-4 w-4 ${getInfluenceColor(champion.influenceScore)}`} />
            <span className={`font-medium ${getInfluenceColor(champion.influenceScore)}`}>
              {champion.influenceScore}/10
            </span>
            <span className="text-xs text-muted-foreground">influence</span>
          </div>
          
          {champion.linkedinUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={champion.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          Last interaction: {champion.lastInteraction}
        </div>
      </CardContent>
    </Card>
  );
}