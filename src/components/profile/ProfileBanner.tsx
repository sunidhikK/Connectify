import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Edit2, Github, Linkedin, Globe, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileBannerProps {
  profile: {
    full_name: string;
    email: string;
    avatar_url?: string | null;
    banner_url?: string | null;
    tagline?: string | null;
    bio?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
    availability?: string | null;
    looking_for?: string | null;
    skills?: string[] | null;
  };
  isOwner?: boolean;
  onEditProfile?: () => void;
  onEditBanner?: () => void;
  onEditAvatar?: () => void;
}

export function ProfileBanner({
  profile,
  isOwner = false,
  onEditProfile,
  onEditBanner,
  onEditAvatar,
}: ProfileBannerProps) {
  const displayName = profile.full_name || 'Anonymous';
  
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Banner */}
      <div className="relative h-40 sm:h-52 bg-gradient-to-br from-primary via-accent to-warning">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent)/0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,hsl(var(--warning)/0.3),transparent_50%)]" />
          </div>
        )}
        
        {isOwner && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 gap-1.5 opacity-80 hover:opacity-100"
            onClick={onEditBanner}
          >
            <Camera className="h-4 w-4" />
            Edit Banner
          </Button>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="relative bg-card rounded-2xl -mt-16 mx-4 p-6 shadow-lg border border-border/50">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="relative -mt-20 sm:-mt-16 shrink-0 mx-auto sm:mx-0">
            <Avatar className={cn(
              'h-28 w-28 sm:h-32 sm:w-32 border-4 border-card shadow-xl',
              'ring-4 ring-primary/20'
            )}>
              <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-3xl font-bold gradient-bg text-primary-foreground">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            {isOwner && (
              <button 
                onClick={onEditAvatar}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
              {profile.availability && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'mx-auto sm:mx-0 w-fit',
                    profile.availability === 'full-time' && 'bg-success/20 text-success',
                    profile.availability === 'part-time' && 'bg-info/20 text-info',
                    profile.availability === 'weekends' && 'bg-warning/20 text-warning',
                    profile.availability === 'flexible' && 'bg-primary/20 text-primary',
                  )}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {profile.availability.replace('-', ' ')}
                </Badge>
              )}
            </div>

            {profile.tagline && (
              <p className="text-lg text-muted-foreground">{profile.tagline}</p>
            )}

            {profile.bio && (
              <p className="text-muted-foreground line-clamp-2">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
              {profile.github_url && (
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0" asChild>
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {profile.linkedin_url && (
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0" asChild>
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {profile.portfolio_url && (
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0" asChild>
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5" />
                  </a>
                </Button>
              )}
              
              {isOwner && (
                <Button size="sm" variant="outline" className="ml-auto gap-1.5" onClick={onEditProfile}>
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Top Skills Preview */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
            {profile.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary" className="hover-lift cursor-default">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 6 && (
              <Badge variant="outline">+{profile.skills.length - 6} more</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
