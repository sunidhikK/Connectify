import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProfileSwipeCard } from '@/components/discover/ProfileSwipeCard';
import { useBrowseProfiles } from '@/hooks/useBrowseProfiles';
import { useMyProjects } from '@/hooks/useMyProjects';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  RefreshCw, 
  Loader2, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Browse() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, profile } = useAuth();
  const { profiles, isLoading: profilesLoading, fetchProfiles, fetchProjectsToJoin } = useBrowseProfiles();
  const { projects: myProjects, isLoading: projectsLoading } = useMyProjects();
  const { expressInterest } = useProjects();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
  const [interestedCount, setInterestedCount] = useState(0);
  
  // Determine mode based on profile's looking_for setting
  const mode: 'hiring' | 'joining' = profile?.looking_for === 'teammates' ? 'hiring' : 'joining';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && profile && !projectsLoading) {
      if (mode === 'hiring' && myProjects.length > 0) {
        fetchProfiles(myProjects.map(p => ({ 
          tech_stack: p.tech_stack || [], 
          roles_needed: p.roles_needed || [] 
        })));
      } else if (mode === 'joining') {
        fetchProjectsToJoin();
      }
    }
  }, [isAuthenticated, profile, mode, myProjects, projectsLoading, fetchProfiles, fetchProjectsToJoin]);

  const handleInterested = useCallback(async (userId: string, projectId?: string) => {
    setAnimating('right');
    
    if (mode === 'joining' && projectId) {
      await expressInterest(projectId);
    }
    // For hiring mode, we would create a different kind of interest
    
    setInterestedCount(prev => prev + 1);
    
    setTimeout(() => {
      setAnimating(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  }, [mode, expressInterest]);

  const handleSkip = useCallback((userId: string) => {
    setAnimating('left');
    
    setTimeout(() => {
      setAnimating(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setInterestedCount(0);
    if (mode === 'hiring') {
      fetchProfiles(myProjects.map(p => ({ 
        tech_stack: p.tech_stack || [], 
        roles_needed: p.roles_needed || [] 
      })));
    } else {
      fetchProjectsToJoin();
    }
  }, [mode, myProjects, fetchProfiles, fetchProjectsToJoin]);

  const currentProfile = profiles[currentIndex];
  const isEndOfList = currentIndex >= profiles.length;
  const isLoading = authLoading || profilesLoading || projectsLoading;

  // If user is in hiring mode but has no projects
  const needsProject = mode === 'hiring' && myProjects.length === 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Finding people for you...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
            {mode === 'hiring' ? (
              <>
                <Users className="h-6 w-6 text-primary" />
                Find Teammates
              </>
            ) : (
              <>
                <Briefcase className="h-6 w-6 text-primary" />
                Find Projects
              </>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'hiring' 
              ? 'Swipe through people looking to join projects'
              : 'Discover projects that match your skills'
            }
          </p>
          
          {/* Mode indicator */}
          <div className="flex justify-center mt-3">
            <Badge variant="outline" className="gap-1.5">
              {mode === 'hiring' ? (
                <>
                  <Users className="h-3 w-3" />
                  Recruiting Mode
                </>
              ) : (
                <>
                  <Briefcase className="h-3 w-3" />
                  Job Seeker Mode
                </>
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Switch mode in <button onClick={() => navigate('/profile')} className="text-primary underline">Profile Settings</button>
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center">
          {needsProject ? (
            <Card className="w-full">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Create a project first</h3>
                <p className="text-sm text-muted-foreground">
                  You're in recruiting mode but don't have any projects yet. 
                  Create a project to start finding teammates.
                </p>
                <Button onClick={() => navigate('/profile')} className="gap-2">
                  Go to Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : profiles.length === 0 && !profilesLoading ? (
            <Card className="w-full">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary mx-auto">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">No one to show right now</h3>
                <p className="text-sm text-muted-foreground">
                  {mode === 'hiring' 
                    ? 'Check back later for more people looking to join projects.'
                    : 'No projects match your skills at the moment. Check back soon!'
                  }
                </p>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : isEndOfList ? (
            <Card className="w-full">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mx-auto">
                  <Heart className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  {interestedCount > 0 
                    ? `You liked ${interestedCount} profile${interestedCount > 1 ? 's' : ''}. Check your matches!`
                    : "You've seen everyone. Check back later for new people."
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Start Over
                  </Button>
                  {interestedCount > 0 && (
                    <Button onClick={() => navigate('/matches')}>
                      View Matches
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : currentProfile ? (
            <div className="w-full space-y-4">
              <ProfileSwipeCard
                profile={currentProfile as any}
                onInterested={handleInterested}
                onSkip={handleSkip}
                isAnimating={animating}
                mode={mode}
              />
              
              {/* Progress */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} of {profiles.length}
                </span>
                {interestedCount > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-success/20 text-success">
                    <Heart className="h-3 w-3" />
                    {interestedCount} liked
                  </Badge>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
