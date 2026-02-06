import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  tech_stack: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillBadge {
  id: string;
  user_id: string;
  skill_name: string;
  badge_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  earned_at: string;
  endorsement_count?: number;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  related_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function usePortfolio(userId?: string) {
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [skillBadges, setSkillBadges] = useState<SkillBadge[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPortfolioData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Fetch portfolio projects
      const { data: projects, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('user_id', userId)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setPortfolioProjects((projects || []) as PortfolioProject[]);

      // Fetch skill badges with endorsement counts
      const { data: badges, error: badgesError } = await supabase
        .from('skill_badges')
        .select(`
          *,
          skill_endorsements(count)
        `)
        .eq('user_id', userId)
        .order('badge_level', { ascending: false });

      if (badgesError) throw badgesError;
      
      const badgesWithCounts = (badges || []).map((badge: Record<string, unknown>) => ({
        ...badge,
        endorsement_count: badge.skill_endorsements?.[0]?.count || 0,
      })) as SkillBadge[];
      setSkillBadges(badgesWithCounts);

      // Fetch activity feed
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      setActivityFeed((activities || []) as ActivityItem[]);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const addPortfolioProject = async (project: Omit<PortfolioProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert({ ...project, user_id: userId })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding project', description: error.message, variant: 'destructive' });
      return null;
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: userId,
      p_activity_type: 'project_created',
      p_title: `Added "${project.title}" to portfolio`,
      p_related_id: data.id,
    });

    toast({ title: 'Project added!', description: 'Your project is now in your portfolio.' });
    await fetchPortfolioData();
    return data;
  };

  const updatePortfolioProject = async (id: string, updates: Partial<PortfolioProject>) => {
    const { error } = await supabase
      .from('portfolio_projects')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating project', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Project updated!' });
    await fetchPortfolioData();
  };

  const deletePortfolioProject = async (id: string) => {
    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting project', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Project removed' });
    await fetchPortfolioData();
  };

  const addSkillBadge = async (skillName: string, level: SkillBadge['badge_level'] = 'beginner') => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('skill_badges')
      .insert({ user_id: userId, skill_name: skillName, badge_level: level })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Badge exists', description: 'You already have this skill badge.', variant: 'destructive' });
      } else {
        toast({ title: 'Error adding badge', description: error.message, variant: 'destructive' });
      }
      return null;
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_user_id: userId,
      p_activity_type: 'badge_earned',
      p_title: `Earned "${skillName}" badge`,
      p_description: `Level: ${level}`,
      p_related_id: data.id,
    });

    toast({ title: 'Badge earned!', description: `You earned the ${skillName} badge!` });
    await fetchPortfolioData();
    return data;
  };

  const updateSkillBadge = async (id: string, level: SkillBadge['badge_level']) => {
    const { error } = await supabase
      .from('skill_badges')
      .update({ badge_level: level })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating badge', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Badge level updated!' });
    await fetchPortfolioData();
  };

  const deleteSkillBadge = async (id: string) => {
    const { error } = await supabase
      .from('skill_badges')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error removing badge', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Badge removed' });
    await fetchPortfolioData();
  };

  return {
    portfolioProjects,
    skillBadges,
    activityFeed,
    isLoading,
    addPortfolioProject,
    updatePortfolioProject,
    deletePortfolioProject,
    addSkillBadge,
    updateSkillBadge,
    deleteSkillBadge,
    refresh: fetchPortfolioData,
  };
}

export function useEndorsements(skillBadgeId?: string) {
  const [endorsements, setEndorsements] = useState<Array<{
    id: string;
    endorser_id: string;
    message: string | null;
    created_at: string;
    endorser?: { full_name: string; avatar_url: string | null };
  }>>([]);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEndorsements = useCallback(async () => {
    if (!skillBadgeId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('skill_endorsements')
        .select(`
          *,
          profiles!skill_endorsements_endorser_id_fkey(full_name, avatar_url)
        `)
        .eq('skill_badge_id', skillBadgeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((e: Record<string, unknown>) => ({
        ...e,
        endorser: e.profiles,
      }));
      setEndorsements(formatted as typeof endorsements);

      // Check if current user has endorsed
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setHasEndorsed(formatted.some((e: Record<string, unknown>) => e.endorser_id === user.id));
      }
    } catch (error) {
      console.error('Error fetching endorsements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [skillBadgeId]);

  useEffect(() => {
    fetchEndorsements();
  }, [fetchEndorsements]);

  const endorseSkill = async (message?: string) => {
    if (!skillBadgeId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to endorse skills.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('skill_endorsements')
      .insert({
        skill_badge_id: skillBadgeId,
        endorser_id: user.id,
        message: message || null,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already endorsed', description: 'You have already endorsed this skill.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }

    toast({ title: 'Endorsed!', description: 'Your endorsement has been added.' });
    await fetchEndorsements();
  };

  const removeEndorsement = async () => {
    if (!skillBadgeId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('skill_endorsements')
      .delete()
      .eq('skill_badge_id', skillBadgeId)
      .eq('endorser_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Endorsement removed' });
    await fetchEndorsements();
  };

  return {
    endorsements,
    hasEndorsed,
    isLoading,
    endorseSkill,
    removeEndorsement,
  };
}
