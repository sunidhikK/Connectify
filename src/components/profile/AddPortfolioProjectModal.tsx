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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';

interface AddPortfolioProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: {
    title: string;
    description: string | null;
    image_url: string | null;
    project_url: string | null;
    github_url: string | null;
    tech_stack: string[];
    featured: boolean;
  }) => Promise<unknown>;
}

export function AddPortfolioProjectModal({
  open,
  onOpenChange,
  onSubmit,
}: AddPortfolioProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    github_url: '',
    tech_stack: [] as string[],
    featured: false,
  });
  const [techInput, setTechInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSubmit({
      ...formData,
      description: formData.description || null,
      image_url: formData.image_url || null,
      project_url: formData.project_url || null,
      github_url: formData.github_url || null,
    });
    
    setFormData({
      title: '',
      description: '',
      image_url: '',
      project_url: '',
      github_url: '',
      tech_stack: [],
      featured: false,
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !formData.tech_stack.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tech_stack: [...prev.tech_stack, trimmed] }));
    }
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tech),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Portfolio Project</DialogTitle>
          <DialogDescription>
            Showcase your best work to potential collaborators.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="My Awesome Project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="What does your project do? What problems does it solve?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_url">Live URL</Label>
              <Input
                id="project_url"
                type="url"
                value={formData.project_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, project_url: e.target.value }))}
                placeholder="https://myproject.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/screenshot.png"
            />
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTech(techInput);
                }
              }}
              placeholder="Type a technology and press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="featured" className="font-medium">Featured Project</Label>
              <p className="text-sm text-muted-foreground">
                Highlight this project at the top of your portfolio
              </p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
