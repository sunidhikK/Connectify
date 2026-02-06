import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityItem } from '@/hooks/usePortfolio';
import { 
  Award, 
  FolderPlus, 
  ThumbsUp, 
  Users, 
  Star,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const activityIcons: Record<string, typeof Award> = {
  project_created: FolderPlus,
  skill_added: Star,
  badge_earned: Award,
  endorsement_received: ThumbsUp,
  collaboration_joined: Users,
  message_sent: MessageCircle,
  default: Zap,
};

const activityColors: Record<string, string> = {
  project_created: 'bg-success/20 text-success',
  skill_added: 'bg-warning/20 text-warning',
  badge_earned: 'bg-primary/20 text-primary',
  endorsement_received: 'bg-info/20 text-info',
  collaboration_joined: 'bg-accent/20 text-accent',
  default: 'bg-muted text-muted-foreground',
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            No recent activity yet. Start building your portfolio!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.activity_type] || activityIcons.default;
            const colorClass = activityColors[activity.activity_type] || activityColors.default;
            
            return (
              <div 
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 animate-fade-in',
                  'relative pl-6 before:absolute before:left-[11px] before:top-8 before:bottom-0 before:w-px before:bg-border',
                  index === activities.length - 1 && 'before:hidden'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn('shrink-0 h-6 w-6 rounded-full flex items-center justify-center', colorClass)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
