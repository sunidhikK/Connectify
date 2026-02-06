import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, Star, Zap, Crown } from 'lucide-react';
import { SkillBadge } from '@/hooks/usePortfolio';

interface AddSkillBadgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (skillName: string, level: SkillBadge['badge_level']) => Promise<unknown>;
}

const levelOptions: { value: SkillBadge['badge_level']; label: string; icon: typeof Star; description: string }[] = [
  { value: 'beginner', label: 'Beginner', icon: Sparkles, description: 'Just started learning' },
  { value: 'intermediate', label: 'Intermediate', icon: Star, description: 'Comfortable with basics' },
  { value: 'advanced', label: 'Advanced', icon: Zap, description: 'Strong proficiency' },
  { value: 'expert', label: 'Expert', icon: Crown, description: 'Deep expertise' },
];

export function AddSkillBadgeModal({
  open,
  onOpenChange,
  onSubmit,
}: AddSkillBadgeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState<SkillBadge['badge_level']>('beginner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(skillName.trim(), level);
    
    setSkillName('');
    setLevel('beginner');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Skill Badge</DialogTitle>
          <DialogDescription>
            Showcase your skills and let others endorse them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input
              id="skillName"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., React, Python, UI/UX Design"
            />
          </div>

          <div className="space-y-3">
            <Label>Proficiency Level</Label>
            <RadioGroup
              value={level}
              onValueChange={(val) => setLevel(val as SkillBadge['badge_level'])}
              className="grid grid-cols-2 gap-3"
            >
              {levelOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all
                    ${level === option.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}
                  `}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <option.icon className={`h-5 w-5 shrink-0 ${level === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !skillName.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Badge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
