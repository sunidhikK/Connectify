import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Star, Pencil, Trash2 } from 'lucide-react';
import { PortfolioProject } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

interface PortfolioProjectCardProps {
  project: PortfolioProject;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PortfolioProjectCard({
  project,
  isOwner = false,
  onEdit,
  onDelete,
}: PortfolioProjectCardProps) {
  return (
    <Card className={cn(
      'group overflow-hidden hover-lift transition-all duration-300',
      project.featured && 'gradient-border'
    )}>
      {/* Project Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold gradient-text opacity-50">
              {project.title.charAt(0)}
            </div>
          </div>
        )}
        
        {project.featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-warning text-warning-foreground gap-1">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        {isOwner && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {project.description}
            </p>
          )}
        </div>

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.tech_stack.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tech_stack.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {project.project_url && (
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Live Demo
              </a>
            </Button>
          )}
          {project.github_url && (
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" asChild>
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5" />
                Code
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
