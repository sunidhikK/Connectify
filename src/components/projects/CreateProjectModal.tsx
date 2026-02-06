import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Rocket } from 'lucide-react';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    tech_stack: string[];
    roles_needed: string[];
    max_team_size: number;
    hackathon_name?: string;
    hackathon_date?: string;
  }) => Promise<any>;
}

const popularTechStacks = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'Vue.js',
  'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Docker', 'TailwindCSS',
  'GraphQL', 'REST API', 'Flutter', 'React Native', 'Swift', 'Kotlin'
];

const popularRoles = [
  'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
  'UI/UX Designer', 'Mobile Developer', 'DevOps Engineer',
  'ML Engineer', 'Data Scientist', 'Product Manager', 'QA Engineer'
];

export function CreateProjectModal({ open, onOpenChange, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);
  const [maxTeamSize, setMaxTeamSize] = useState('5');
  const [hackathonName, setHackathonName] = useState('');
  const [hackathonDate, setHackathonDate] = useState('');
  const [techInput, setTechInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTech = (tech: string) => {
    if (tech && !techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const addRole = (role: string) => {
    if (role && !rolesNeeded.includes(role)) {
      setRolesNeeded([...rolesNeeded, role]);
      setRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setRolesNeeded(rolesNeeded.filter(r => r !== role));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    
    const result = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      tech_stack: techStack,
      roles_needed: rolesNeeded,
      max_team_size: parseInt(maxTeamSize),
      hackathon_name: hackathonName.trim() || undefined,
      hackathon_date: hackathonDate || undefined,
    });

    if (result) {
      setTitle('');
      setDescription('');
      setTechStack([]);
      setRolesNeeded([]);
      setMaxTeamSize('5');
      setHackathonName('');
      setHackathonDate('');
      onOpenChange(false);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Share your project idea and find the perfect teammates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., EcoTrack - Carbon Footprint Tracker"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, its goals, and what makes it exciting..."
              rows={4}
              required
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech(techInput.trim());
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addTech(techInput.trim())}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularTechStacks
                .filter(t => !techStack.includes(t))
                .slice(0, 8)
                .map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addTech(tech)}
                  >
                    + {tech}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Roles Needed */}
          <div className="space-y-2">
            <Label>Roles Needed</Label>
            <div className="flex gap-2">
              <Input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="Add role..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRole(roleInput.trim());
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addRole(roleInput.trim())}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rolesNeeded.map((role) => (
                <Badge key={role} className="gap-1 bg-primary/10 text-primary border-primary/20">
                  {role}
                  <button type="button" onClick={() => removeRole(role)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularRoles
                .filter(r => !rolesNeeded.includes(r))
                .slice(0, 6)
                .map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addRole(role)}
                  >
                    + {role}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Team Size */}
          <div className="space-y-2">
            <Label htmlFor="teamSize">Max Team Size</Label>
            <Select value={maxTeamSize} onValueChange={setMaxTeamSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8, 10].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} members
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hackathon Info (Optional) */}
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
            <Label className="text-muted-foreground">Hackathon Details (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hackathonName">Hackathon Name</Label>
                <Input
                  id="hackathonName"
                  value={hackathonName}
                  onChange={(e) => setHackathonName(e.target.value)}
                  placeholder="e.g., HackMIT 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hackathonDate">Date</Label>
                <Input
                  id="hackathonDate"
                  type="date"
                  value={hackathonDate}
                  onChange={(e) => setHackathonDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Rocket className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
