import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BrowseProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  tagline: string | null;
  skills: string[];
  availability: string | null;
  looking_for: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  match_score: number;
  match_reasons: string[];
}

export function useBrowseProfiles() {
  const [profiles, setProfiles] = useState<BrowseProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile: currentProfile } = useAuth();

  const calculateMatchScore = useCallback((
    userSkills: string[],
    targetSkills: string[],
    myTechStack: string[],
    myRolesNeeded: string[]
  ): { score: number; reasons: string[] } => {
    const reasons: string[] = [];
    let score = 0;

    const normalizedTarget = targetSkills.map(s => s.toLowerCase());
    const normalizedMy = myTechStack.map(t => t.toLowerCase());
    const normalizedRoles = myRolesNeeded.map(r => r.toLowerCase());

    // Skills match with tech stack (0-50 points)
    const techMatches = normalizedTarget.filter(skill =>
      normalizedMy.some(tech => 
        tech.includes(skill) || skill.includes(tech) ||
        areSimilarTechnologies(skill, tech)
      )
    );
    
    if (techMatches.length > 0) {
      const techScore = Math.min((techMatches.length / Math.max(normalizedMy.length, 1)) * 50, 50);
      score += techScore;
      reasons.push(`${techMatches.length} matching skill${techMatches.length > 1 ? 's' : ''}`);
    }

    // Role matching (0-35 points)
    const roleKeywords = normalizedRoles.flatMap(role => {
      const words = role.split(/[\s-]+/);
      return [...words, role];
    });
    
    const roleMatches = normalizedTarget.filter(skill =>
      roleKeywords.some(keyword => 
        keyword.includes(skill) || skill.includes(keyword)
      )
    );
    
    if (roleMatches.length > 0) {
      const roleScore = Math.min((roleMatches.length / Math.max(roleKeywords.length, 1)) * 35, 35);
      score += roleScore;
      reasons.push(`Fits ${roleMatches.length} role${roleMatches.length > 1 ? 's' : ''}`);
    }

    // Availability bonus (15 points)
    score += 15;
    reasons.push('Available to collaborate');

    return { score: Math.min(Math.round(score), 100), reasons };
  }, []);

  const fetchProfiles = useCallback(async (
    myProjects: Array<{ tech_stack: string[]; roles_needed: string[] }>
  ) => {
    if (!user || !currentProfile) {
      setProfiles([]);
      return;
    }

    setIsLoading(true);

    // Fetch profiles of users who are looking for projects to join
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .or('looking_for.eq.project,looking_for.eq.both');

    if (error) {
      console.error('Error fetching profiles:', error);
      setIsLoading(false);
      return;
    }

    // Get users who already expressed interest in my projects
    const { data: existingInterests } = await supabase
      .from('project_interests')
      .select('user_id, project_id')
      .in('project_id', myProjects.map(() => '').filter(() => false)); // We'll use matches instead

    // Get my existing matches to filter out
    const { data: matchesData } = await supabase
      .from('matches')
      .select('user_id')
      .eq('owner_id', user.id);

    const matchedUserIds = new Set(matchesData?.map(m => m.user_id) || []);

    // Combine all project requirements for scoring
    const combinedTechStack = [...new Set(myProjects.flatMap(p => p.tech_stack || []))];
    const combinedRoles = [...new Set(myProjects.flatMap(p => p.roles_needed || []))];

    const scoredProfiles = profilesData
      .filter(p => !matchedUserIds.has(p.user_id))
      .map(profile => {
        const { score, reasons } = calculateMatchScore(
          currentProfile.skills || [],
          profile.skills || [],
          combinedTechStack,
          combinedRoles
        );

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          tagline: profile.tagline,
          skills: profile.skills || [],
          availability: profile.availability,
          looking_for: profile.looking_for,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          portfolio_url: profile.portfolio_url,
          match_score: score,
          match_reasons: reasons,
        };
      })
      .sort((a, b) => b.match_score - a.match_score);

    setProfiles(scoredProfiles);
    setIsLoading(false);
  }, [user, currentProfile, calculateMatchScore]);

  const fetchProjectsToJoin = useCallback(async () => {
    if (!user || !currentProfile) {
      setProfiles([]);
      return;
    }

    setIsLoading(true);

    // Fetch projects where I can join (projects by users looking for teammates)
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('*, owner:profiles!projects_owner_id_fkey(user_id, full_name, avatar_url, bio, tagline, skills, availability, looking_for, github_url, linkedin_url, portfolio_url)')
      .eq('status', 'open')
      .neq('owner_id', user.id);

    if (error) {
      console.error('Error fetching projects:', error);
      setIsLoading(false);
      return;
    }

    // Get my existing interests
    const { data: myInterests } = await supabase
      .from('project_interests')
      .select('project_id')
      .eq('user_id', user.id);

    const interestedProjectIds = new Set(myInterests?.map(i => i.project_id) || []);

    const userSkills = currentProfile.skills || [];

    // Convert to profiles with project context
    const scoredOwners = projectsData
      .filter(p => !interestedProjectIds.has(p.id))
      .map(project => {
        const owner = project.owner as any;
        const { score, reasons } = calculateMatchScore(
          userSkills,
          project.tech_stack || [],
          project.tech_stack || [],
          project.roles_needed || []
        );

        return {
          id: project.id,
          user_id: owner?.user_id || project.owner_id,
          full_name: owner?.full_name || 'Unknown',
          avatar_url: owner?.avatar_url,
          bio: owner?.bio,
          tagline: project.title, // Show project title as tagline
          skills: project.tech_stack || [],
          availability: owner?.availability,
          looking_for: 'teammates',
          github_url: owner?.github_url,
          linkedin_url: owner?.linkedin_url,
          portfolio_url: owner?.portfolio_url,
          match_score: score,
          match_reasons: reasons,
          projectId: project.id,
          projectTitle: project.title,
          projectDescription: project.description,
          rolesNeeded: project.roles_needed || [],
        };
      })
      .sort((a, b) => b.match_score - a.match_score);

    setProfiles(scoredOwners);
    setIsLoading(false);
  }, [user, currentProfile, calculateMatchScore]);

  return {
    profiles,
    isLoading,
    fetchProfiles,
    fetchProjectsToJoin,
  };
}

function areSimilarTechnologies(skill: string, tech: string): boolean {
  const techGroups: string[][] = [
    ['react', 'reactjs', 'react.js', 'react native'],
    ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
    ['python', 'django', 'flask', 'fastapi'],
    ['typescript', 'ts'],
    ['javascript', 'js', 'es6'],
    ['vue', 'vuejs', 'vue.js', 'nuxt'],
    ['angular', 'angularjs'],
    ['css', 'scss', 'sass', 'tailwind', 'tailwindcss'],
    ['postgres', 'postgresql', 'sql', 'mysql', 'database'],
    ['mongodb', 'mongo', 'nosql'],
    ['aws', 'amazon', 'cloud'],
    ['docker', 'containerization', 'kubernetes', 'k8s'],
    ['ml', 'machine learning', 'ai', 'artificial intelligence'],
    ['frontend', 'front-end', 'ui', 'ux'],
    ['backend', 'back-end', 'server'],
    ['fullstack', 'full-stack', 'full stack'],
  ];

  for (const group of techGroups) {
    if (group.includes(skill) && group.includes(tech)) {
      return true;
    }
  }
  return false;
}
