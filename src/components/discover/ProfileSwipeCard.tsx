import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Heart, 
  Github, 
  Linkedin, 
  Globe, 
  MapPin,
  Briefcase,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrowseProfile } from '@/hooks/useBrowseProfiles';

interface ProfileSwipeCardProps {
  profile: BrowseProfile & { 
    projectId?: string; 
    projectTitle?: string;
    projectDescription?: string;
    rolesNeeded?: string[];
  };
  onInterested: (profileId: string, projectId?: string) => void;
  onSkip: (profileId: string) => void;
  isAnimating: 'left' | 'right' | null;
  mode: 'hiring' | 'joining';
}

export function ProfileSwipeCard({ 
  profile, 
  onInterested, 
  onSkip, 
  isAnimating,
  mode 
}: ProfileSwipeCardProps) {
  const getAvailabilityLabel = (availability: string | null) => {
    switch (availability) {
      case 'full-time': return 'Full-time';
      case 'part-time': return 'Part-time';
      case 'weekends': return 'Weekends';
      case 'flexible': return 'Flexible';
      default: return 'Available';
    }
  };

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300 border-2',
      isAnimating === 'left' && 'animate-slide-out-left opacity-0 -translate-x-full rotate-[-10deg]',
      isAnimating === 'right' && 'animate-slide-out-right opacity-0 translate-x-full rotate-[10deg]',
      !isAnimating && 'hover:shadow-lg'
    )}>
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-secondary p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {profile.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{profile.full_name}</h3>
            {profile.tagline && (
              <p className="text-sm text-muted-foreground line-clamp-1">{profile.tagline}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {getAvailabilityLabel(profile.availability)}
              </Badge>
              {mode === 'joining' && profile.rolesNeeded && profile.rolesNeeded.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  {profile.rolesNeeded[0]}
                </Badge>
              )}
            </div>
          </div>

          {/* Match Score */}
          <div className="text-right shrink-0">
            <div className={cn(
              'text-2xl font-bold',
              profile.match_score >= 70 ? 'text-success' :
              profile.match_score >= 40 ? 'text-warning' :
              'text-muted-foreground'
            )}>
              {profile.match_score}%
            </div>
            <span className="text-xs text-muted-foreground">match</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Bio or Project Description */}
        {mode === 'joining' && profile.projectDescription ? (
          <div>
            <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-primary" />
              Project
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {profile.projectDescription}
            </p>
          </div>
        ) : profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {profile.bio}
          </p>
        )}

        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.length - 6}
              </Badge>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        {profile.match_reasons.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {profile.match_reasons.slice(0, 2).join(' • ')}
          </div>
        )}

        {/* Social Links */}
        <div className="flex gap-2">
          {profile.github_url && (
            <a 
              href={profile.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {profile.linkedin_url && (
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {profile.portfolio_url && (
            <a 
              href={profile.portfolio_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => onSkip(profile.user_id)}
          >
            <X className="h-5 w-5" />
            Skip
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2 bg-success hover:bg-success/90"
            onClick={() => onInterested(profile.user_id, profile.projectId)}
          >
            <Heart className="h-5 w-5" />
            Interested
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
