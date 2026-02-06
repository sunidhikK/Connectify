import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProjectWithOwner {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  tech_stack: string[];
  roles_needed: string[];
  team_size: number;
  max_team_size: number;
  hackathon_name: string | null;
  hackathon_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  owner?: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    skills: string[] | null;
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Fetch projects with owner profiles
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'open')
      .neq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      setIsLoading(false);
      return;
    }

    // Fetch owner profiles for all projects
    const ownerIds = [...new Set(projectsData.map(p => p.owner_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, skills')
      .in('user_id', ownerIds);

    const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    // Get user's existing interests to filter out
    const { data: interestsData } = await supabase
      .from('project_interests')
      .select('project_id')
      .eq('user_id', user.id);

    const interestedProjectIds = new Set(interestsData?.map(i => i.project_id) || []);

    const projectsWithOwners = projectsData
      .filter(p => !interestedProjectIds.has(p.id))
      .map(project => ({
        ...project,
        tech_stack: project.tech_stack || [],
        roles_needed: project.roles_needed || [],
        team_size: project.team_size || 1,
        max_team_size: project.max_team_size || 5,
        owner: profileMap.get(project.owner_id) || { user_id: project.owner_id, full_name: 'Unknown', avatar_url: null, skills: [] },
      }));

    setProjects(projectsWithOwners);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const expressInterest = useCallback(async (projectId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('project_interests')
      .insert({
        project_id: projectId,
        user_id: user.id,
        status: 'pending',
      });

    if (error) {
      console.error('Error expressing interest:', error);
      toast({
        title: "Failed to express interest",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Interest sent! 🎉",
      description: "You'll be notified when the project owner responds.",
    });

    return true;
  }, [user, toast]);

  return {
    projects,
    isLoading,
    fetchProjects,
    expressInterest,
  };
}
