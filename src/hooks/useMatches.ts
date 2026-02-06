import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Match {
  id: string;
  project_id: string;
  user_id: string;
  owner_id: string;
  created_at: string;
  project?: {
    title: string;
    description: string;
  };
  other_user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchMatches = useCallback(async () => {
    if (!user) {
      setMatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch matches where user is either the project owner or the interested user
    const { data: matchesData, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      setIsLoading(false);
      return;
    }

    // Fetch project details
    const projectIds = [...new Set(matchesData.map(m => m.project_id))];
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, title, description')
      .in('id', projectIds);

    const projectMap = new Map(projectsData?.map(p => [p.id, p]) || []);

    // Fetch other user profiles
    const otherUserIds = matchesData.map(m => 
      m.user_id === user.id ? m.owner_id : m.user_id
    );
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .in('user_id', otherUserIds);

    const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const enrichedMatches = matchesData.map(match => ({
      ...match,
      project: projectMap.get(match.project_id),
      other_user: profileMap.get(match.user_id === user.id ? match.owner_id : match.user_id),
    }));

    setMatches(enrichedMatches);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    isLoading,
    fetchMatches,
  };
}
