import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio, useEndorsements } from '@/hooks/usePortfolio';
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { PortfolioProjectCard } from '@/components/profile/PortfolioProjectCard';
import { SkillBadgeCard } from '@/components/profile/SkillBadgeCard';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FolderOpen, Award, Sparkles, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PublicProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  availability: string | null;
  looking_for: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const {
    portfolioProjects,
    skillBadges,
    activityFeed,
    isLoading: portfolioLoading,
  } = usePortfolio(userId);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (notFound || !profile) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">
            This user doesn't exist or their profile is private.
          </p>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === userId;

  return (
    <Layout>
      <div className="container py-6 max-w-5xl space-y-6">
        {/* Profile Banner */}
        <ProfileBanner
          profile={{
            ...profile,
            tagline: null,
          }}
          isOwner={false}
        />

        {/* Tabs for different sections */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="portfolio" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Award className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-6">
            <h2 className="text-xl font-semibold mb-6">Projects</h2>

            {portfolioLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : portfolioProjects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn't added any portfolio projects.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioProjects.map((project) => (
                  <PortfolioProjectCard
                    key={project.id}
                    project={project}
                    isOwner={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="mt-6">
            <h2 className="text-xl font-semibold mb-6">Skill Badges</h2>

            {portfolioLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : skillBadges.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No skill badges yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn't added any skill badges.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillBadges.map((badge) => (
                  <SkillBadgeCard
                    key={badge.id}
                    badge={badge}
                    isOwner={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <ActivityFeed activities={activityFeed} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
