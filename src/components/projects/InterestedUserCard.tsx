import { Link } from 'react-router-dom';
import { ProjectInterest } from '@/hooks/useProjectInterests';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  X, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Globe,
  Sparkles,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterestedUserCardProps {
  interest: ProjectInterest;
  onAccept: (interestId: string) => void;
  onReject: (interestId: string) => void;
  isProcessing?: boolean;
}

export function InterestedUserCard({ 
  interest, 
  onAccept, 
  onReject,
  isProcessing 
}: InterestedUserCardProps) {
  const user = interest.user;
  const compatibilityScore = interest.compatibility_score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-success/20';
    if (score >= 40) return 'bg-warning/20';
    return 'bg-muted/20';
  };

  const isPending = interest.status === 'pending';
  const isAccepted = interest.status === 'accepted';
  const isRejected = interest.status === 'rejected';

  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-md',
      isAccepted && 'border-success/50 bg-success/5',
      isRejected && 'opacity-50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link to={`/profile/${user?.user_id}`} className="shrink-0">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="text-lg gradient-bg text-primary-foreground">
                {user?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link 
                  to={`/profile/${user?.user_id}`}
                  className="font-semibold hover:text-primary transition-colors line-clamp-1"
                >
                  {user?.full_name || 'Unknown User'}
                </Link>
                {user?.tagline && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {user.tagline}
                  </p>
                )}
              </div>

              {/* Compatibility Score */}
              {compatibilityScore > 0 && (
                <div className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium',
                  getScoreBg(compatibilityScore)
                )}>
                  <Sparkles className={cn('h-3.5 w-3.5', getScoreColor(compatibilityScore))} />
                  <span className={getScoreColor(compatibilityScore)}>
                    {compatibilityScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Skills */}
            {user?.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {user.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {user.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Compatibility Progress */}
            {compatibilityScore > 0 && (
              <div className="space-y-1">
                <Progress 
                  value={compatibilityScore} 
                  className="h-1.5"
                />
              </div>
            )}

            {/* Bio */}
            {user?.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {user?.github_url && (
                <a 
                  href={user.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <Github className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {user?.linkedin_url && (
                <a 
                  href={user.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {user?.portfolio_url && (
                <a 
                  href={user.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              <Link 
                to={`/profile/${user?.user_id}`}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors ml-auto"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {isPending ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onReject(interest.id)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => onAccept(interest.id)}
                disabled={isProcessing}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </>
          ) : isAccepted ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="h-4 w-4" />
              <span>Accepted - They're now your teammate!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Interest declined</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
