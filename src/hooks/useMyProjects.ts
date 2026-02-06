import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MyProject {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  roles_needed: string[];
  team_size: number;
  max_team_size: number;
  hackathon_name: string | null;
  hackathon_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  pending_interests_count?: number;
  matches_count?: number;
}

export function useMyProjects() {
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMyProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch user's own projects
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my projects:', error);
      setIsLoading(false);
      return;
    }

    // Fetch pending interests count for each project
    const projectIds = projectsData.map(p => p.id);
    
    const { data: interestsData } = await supabase
      .from('project_interests')
      .select('project_id, status')
      .in('project_id', projectIds);

    const { data: matchesData } = await supabase
      .from('matches')
      .select('project_id')
      .in('project_id', projectIds);

    const interestCounts = new Map<string, number>();
    const matchCounts = new Map<string, number>();

    interestsData?.forEach(interest => {
      if (interest.status === 'pending') {
        interestCounts.set(interest.project_id, (interestCounts.get(interest.project_id) || 0) + 1);
      }
    });

    matchesData?.forEach(match => {
      matchCounts.set(match.project_id, (matchCounts.get(match.project_id) || 0) + 1);
    });

    const enrichedProjects = projectsData.map(project => ({
      ...project,
      tech_stack: project.tech_stack || [],
      roles_needed: project.roles_needed || [],
      team_size: project.team_size || 1,
      max_team_size: project.max_team_size || 5,
      pending_interests_count: interestCounts.get(project.id) || 0,
      matches_count: matchCounts.get(project.id) || 0,
    }));

    setProjects(enrichedProjects);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const createProject = useCallback(async (projectData: {
    title: string;
    description: string;
    tech_stack: string[];
    roles_needed: string[];
    max_team_size: number;
    hackathon_name?: string;
    hackathon_date?: string;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        owner_id: user.id,
        team_size: 1,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Project created! 🚀",
      description: "Your project is now visible to potential teammates.",
    });

    await fetchMyProjects();
    return data;
  }, [user, toast, fetchMyProjects]);

  const updateProject = useCallback(async (projectId: string, projectData: Partial<MyProject>) => {
    if (!user) return false;

    const { error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', projectId)
      .eq('owner_id', user.id);

    if (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Failed to update project",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Project updated",
      description: "Your changes have been saved.",
    });

    await fetchMyProjects();
    return true;
  }, [user, toast, fetchMyProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('owner_id', user.id);

    if (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Project deleted",
      description: "Your project has been removed.",
    });

    await fetchMyProjects();
    return true;
  }, [user, toast, fetchMyProjects]);

  return {
    projects,
    isLoading,
    fetchMyProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
