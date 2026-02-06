import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProjectInterest {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  created_at: string;
  user?: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    skills: string[] | null;
    availability: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    tagline: string | null;
  };
  compatibility_score?: number;
}

export function useProjectInterests(projectId: string | null) {
  const [interests, setInterests] = useState<ProjectInterest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateCompatibility = useCallback((
    projectTechStack: string[],
    projectRolesNeeded: string[],
    userSkills: string[] | null
  ): number => {
    if (!userSkills || userSkills.length === 0) return 0;

    const normalizedProjectTech = projectTechStack.map(t => t.toLowerCase());
    const normalizedRoles = projectRolesNeeded.map(r => r.toLowerCase());
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

    // Calculate tech stack match (50% weight)
    const techMatches = normalizedUserSkills.filter(skill =>
      normalizedProjectTech.some(tech => 
        tech.includes(skill) || skill.includes(tech)
      )
    ).length;
    const techScore = normalizedProjectTech.length > 0 
      ? (techMatches / normalizedProjectTech.length) * 50 
      : 25;

    // Calculate role match (50% weight)
    const roleKeywords = normalizedRoles.flatMap(role => role.split(/[\s-]+/));
    const roleMatches = normalizedUserSkills.filter(skill =>
      roleKeywords.some(keyword => 
        keyword.includes(skill) || skill.includes(keyword)
      )
    ).length;
    const roleScore = roleKeywords.length > 0 
      ? (roleMatches / roleKeywords.length) * 50 
      : 25;

    return Math.min(Math.round(techScore + roleScore), 100);
  }, []);

  const fetchInterests = useCallback(async (projectTechStack?: string[], projectRolesNeeded?: string[]) => {
    if (!projectId || !user) {
      setInterests([]);
      return;
    }

    setIsLoading(true);

    // Fetch interests for this project
    const { data: interestsData, error } = await supabase
      .from('project_interests')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interests:', error);
      setIsLoading(false);
      return;
    }

    // Fetch user profiles
    const userIds = interestsData.map(i => i.user_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, bio, skills, availability, github_url, linkedin_url, portfolio_url, tagline')
      .in('user_id', userIds);

    const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const enrichedInterests = interestsData.map(interest => {
      const userProfile = profileMap.get(interest.user_id);
      return {
        ...interest,
        user: userProfile,
        compatibility_score: projectTechStack && projectRolesNeeded
          ? calculateCompatibility(projectTechStack, projectRolesNeeded, userProfile?.skills || null)
          : undefined,
      };
    });

    // Sort by compatibility score if available
    enrichedInterests.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return (b.compatibility_score || 0) - (a.compatibility_score || 0);
    });

    setInterests(enrichedInterests);
    setIsLoading(false);
  }, [projectId, user, calculateCompatibility]);

  useEffect(() => {
    if (projectId) {
      fetchInterests();
    }
  }, [projectId, fetchInterests]);

  const acceptInterest = useCallback(async (interestId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('project_interests')
      .update({ status: 'accepted' })
      .eq('id', interestId);

    if (error) {
      console.error('Error accepting interest:', error);
      toast({
        title: "Failed to accept",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Teammate accepted! 🎉",
      description: "You can now chat with your new team member.",
    });

    await fetchInterests();
    return true;
  }, [user, toast, fetchInterests]);

  const rejectInterest = useCallback(async (interestId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('project_interests')
      .update({ status: 'rejected' })
      .eq('id', interestId);

    if (error) {
      console.error('Error rejecting interest:', error);
      toast({
        title: "Failed to reject",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Interest declined",
      description: "The user has been notified.",
    });

    await fetchInterests();
    return true;
  }, [user, toast, fetchInterests]);

  return {
    interests,
    isLoading,
    fetchInterests,
    acceptInterest,
    rejectInterest,
  };
}
