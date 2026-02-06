import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, ThumbsUp, Sparkles, Star, Zap, Crown } from 'lucide-react';
import { SkillBadge } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

interface SkillBadgeCardProps {
  badge: SkillBadge;
  isOwner?: boolean;
  onEndorse?: () => void;
  onLevelChange?: (level: SkillBadge['badge_level']) => void;
  onDelete?: () => void;
  hasEndorsed?: boolean;
}

const levelConfig = {
  beginner: {
    icon: Sparkles,
    label: 'Beginner',
    color: 'bg-success/20 text-success border-success/30',
    gradient: 'from-success/20 to-success/5',
  },
  intermediate: {
    icon: Star,
    label: 'Intermediate',
    color: 'bg-info/20 text-info border-info/30',
    gradient: 'from-info/20 to-info/5',
  },
  advanced: {
    icon: Zap,
    label: 'Advanced',
    color: 'bg-accent/20 text-accent border-accent/30',
    gradient: 'from-accent/20 to-accent/5',
  },
  expert: {
    icon: Crown,
    label: 'Expert',
    color: 'bg-primary/20 text-primary border-primary/30',
    gradient: 'from-primary/20 to-primary/5',
  },
};

export function SkillBadgeCard({
  badge,
  isOwner = false,
  onEndorse,
  onLevelChange,
  onDelete,
  hasEndorsed = false,
}: SkillBadgeCardProps) {
  const config = levelConfig[badge.badge_level];
  const LevelIcon = config.icon;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover-lift',
        'bg-gradient-to-br',
        config.gradient
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent shimmer" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', config.color)}>
          <Award className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{badge.skill_name}</h4>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <LevelIcon className="h-3.5 w-3.5" />
            <span>{config.label}</span>
            {(badge.endorsement_count ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {badge.endorsement_count}
              </Badge>
            )}
          </div>
        </div>

        {!isOwner && onEndorse && (
          <Button
            size="sm"
            variant={hasEndorsed ? 'secondary' : 'default'}
            onClick={onEndorse}
            className="shrink-0"
          >
            <ThumbsUp className={cn('h-4 w-4', hasEndorsed && 'fill-current')} />
          </Button>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <select
            value={badge.badge_level}
            onChange={(e) => onLevelChange?.(e.target.value as SkillBadge['badge_level'])}
            className="text-xs bg-transparent border border-border rounded px-2 py-1 flex-1"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive">
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
