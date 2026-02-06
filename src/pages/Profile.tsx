import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useMyProjects } from '@/hooks/useMyProjects';
import { useProjectInterests } from '@/hooks/useProjectInterests';
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { PortfolioProjectCard } from '@/components/profile/PortfolioProjectCard';
import { SkillBadgeCard } from '@/components/profile/SkillBadgeCard';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { AddPortfolioProjectModal } from '@/components/profile/AddPortfolioProjectModal';
import { AddSkillBadgeModal } from '@/components/profile/AddSkillBadgeModal';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { InterestedUserCard } from '@/components/projects/InterestedUserCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Loader2, 
  Plus, 
  FolderOpen, 
  Award, 
  Github, 
  Linkedin, 
  Globe, 
  X,
  Save,
  Sparkles,
  Rocket,
  Users,
  Clock,
  ChevronRight,
  UserPlus,
  MessageSquare,
  Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const skillSuggestions = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Java', 'C++',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Vue.js', 'Angular', 'Next.js', 'Django',
  'Flask', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'GCP', 'Azure', 'TensorFlow', 'PyTorch', 'Figma', 'UI/UX'
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading, updateProfile } = useAuth();
  const {
    portfolioProjects,
    skillBadges,
    activityFeed,
    isLoading: portfolioLoading,
    addPortfolioProject,
    deletePortfolioProject,
    addSkillBadge,
    updateSkillBadge,
    deleteSkillBadge,
  } = usePortfolio(user?.id);

  const { 
    projects, 
    isLoading: projectsLoading, 
    createProject 
  } = useMyProjects();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const { 
    interests, 
    isLoading: interestsLoading, 
    fetchInterests,
    acceptInterest, 
    rejectInterest 
  } = useProjectInterests(selectedProjectId);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddBadgeOpen, setIsAddBadgeOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    tagline: '',
    skills: [] as string[],
    availability: 'flexible',
    looking_for: 'both',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        tagline: profile.tagline || '',
        skills: profile.skills || [],
        availability: profile.availability || 'flexible',
        looking_for: profile.looking_for || 'both',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProject) {
      fetchInterests(selectedProject.tech_stack || [], selectedProject.roles_needed || []);
    }
  }, [selectedProjectId, selectedProject, fetchInterests]);

  const pendingInterests = interests.filter(i => i.status === 'pending');
  const acceptedInterests = interests.filter(i => i.status === 'accepted');

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile(formData);
    setIsSaving(false);
    setIsEditDialogOpen(false);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const filteredSuggestions = skillSuggestions.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !formData.skills.includes(s)
  );

  const displayProfile = {
    ...profile,
    full_name: profile?.full_name || user?.email || 'User',
    tagline: profile?.tagline || null,
  };

  const getRoleModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'teammates': return 'Looking for teammates';
      case 'project': return 'Looking to join a project';
      default: return 'Open to both';
    }
  };

  return (
    <Layout>
      <div className="container py-6 max-w-5xl space-y-6">
        {/* Profile Banner */}
        <ProfileBanner
          profile={displayProfile}
          isOwner={true}
          onEditProfile={() => setIsEditDialogOpen(true)}
        />

        {/* Role Mode Indicator */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile?.looking_for === 'teammates' ? (
                  <Users className="h-5 w-5 text-primary" />
                ) : profile?.looking_for === 'project' ? (
                  <Briefcase className="h-5 w-5 text-primary" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">{getRoleModeLabel(profile?.looking_for || null)}</p>
                  <p className="text-xs text-muted-foreground">
                    This affects what you see in Browse
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="projects" className="gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">My Projects</span>
              <span className="sm:hidden">Projects</span>
            </TabsTrigger>
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

          {/* My Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">My Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Create projects and manage interested teammates
                </p>
              </div>
              <Button onClick={() => setIsCreateProjectOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Create a project to start finding teammates for your next hackathon or side project.
                  </p>
                  <Button onClick={() => setIsCreateProjectOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Projects List */}
                <Card className="lg:col-span-1">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Projects ({projects.length})</CardTitle>
                  </CardHeader>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 px-4 pb-4">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProjectId(project.id)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg transition-all',
                            selectedProjectId === project.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-secondary border border-transparent'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{project.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {project.tech_stack?.slice(0, 2).join(', ')}
                              </p>
                            </div>
                            <ChevronRight className={cn(
                              'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                              selectedProjectId === project.id && 'text-primary rotate-90'
                            )} />
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {project.pending_interests_count! > 0 && (
                              <Badge variant="secondary" className="text-xs gap-1 bg-warning/20">
                                <UserPlus className="h-3 w-3" />
                                {project.pending_interests_count}
                              </Badge>
                            )}
                            {project.matches_count! > 0 && (
                              <Badge variant="secondary" className="text-xs gap-1 bg-success/20 text-success">
                                <Users className="h-3 w-3" />
                                {project.matches_count}
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>

                {/* Selected Project Details */}
                <Card className="lg:col-span-2">
                  {selectedProject ? (
                    <>
                      <CardHeader className="border-b py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{selectedProject.title}</CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {selectedProject.description}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={selectedProject.status === 'open' ? 'default' : 'secondary'}
                            className="capitalize shrink-0"
                          >
                            {selectedProject.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-3 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{selectedProject.team_size}/{selectedProject.max_team_size}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{new Date(selectedProject.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0">
                        <Tabs defaultValue="pending" className="w-full">
                          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-11">
                            <TabsTrigger value="pending" className="gap-1.5 text-xs data-[state=active]:bg-transparent">
                              Pending
                              {pendingInterests.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                  {pendingInterests.length}
                                </Badge>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="team" className="gap-1.5 text-xs data-[state=active]:bg-transparent">
                              Team
                              {acceptedInterests.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-success/20 text-success">
                                  {acceptedInterests.length}
                                </Badge>
                              )}
                            </TabsTrigger>
                          </TabsList>

                          <ScrollArea className="h-[280px]">
                            <TabsContent value="pending" className="p-4 space-y-3 m-0">
                              {interestsLoading ? (
                                <div className="flex justify-center py-8">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              ) : pendingInterests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No pending requests</p>
                                </div>
                              ) : (
                                pendingInterests.map((interest) => (
                                  <InterestedUserCard
                                    key={interest.id}
                                    interest={interest}
                                    onAccept={acceptInterest}
                                    onReject={rejectInterest}
                                  />
                                ))
                              )}
                            </TabsContent>

                            <TabsContent value="team" className="p-4 space-y-3 m-0">
                              {acceptedInterests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No teammates yet</p>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-muted-foreground">
                                      {acceptedInterests.length} teammate{acceptedInterests.length > 1 ? 's' : ''}
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => navigate('/matches')}
                                      className="gap-1 h-7 text-xs"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                      Chat
                                    </Button>
                                  </div>
                                  {acceptedInterests.map((interest) => (
                                    <InterestedUserCard
                                      key={interest.id}
                                      interest={interest}
                                      onAccept={acceptInterest}
                                      onReject={rejectInterest}
                                    />
                                  ))}
                                </>
                              )}
                            </TabsContent>
                          </ScrollArea>
                        </Tabs>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="flex items-center justify-center h-full text-muted-foreground py-20">
                      <div className="text-center">
                        <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Select a project</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Portfolio</h2>
                <p className="text-sm text-muted-foreground">
                  Showcase your best work
                </p>
              </div>
              <Button onClick={() => setIsAddProjectOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </div>

            {portfolioLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : portfolioProjects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FolderOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No portfolio projects</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Add your past work to impress potential teammates.
                  </p>
                  <Button onClick={() => setIsAddProjectOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioProjects.map((project) => (
                  <PortfolioProjectCard
                    key={project.id}
                    project={project}
                    isOwner={true}
                    onDelete={() => deletePortfolioProject(project.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Skills</h2>
                <p className="text-sm text-muted-foreground">
                  Showcase your expertise
                </p>
              </div>
              <Button onClick={() => setIsAddBadgeOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Skill
              </Button>
            </div>

            {portfolioLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : skillBadges.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No skill badges</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Add skills to let others know your expertise.
                  </p>
                  <Button onClick={() => setIsAddBadgeOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillBadges.map((badge) => (
                  <SkillBadgeCard
                    key={badge.id}
                    badge={badge}
                    isOwner={true}
                    onLevelChange={(level) => updateSkillBadge(badge.id, level)}
                    onDelete={() => deleteSkillBadge(badge.id)}
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="e.g., Full-stack developer passionate about AI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="weekends">Weekends only</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>I'm Looking For</Label>
                <Select
                  value={formData.looking_for}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, looking_for: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">A project to join</SelectItem>
                    <SelectItem value="teammates">Teammates for my project</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="relative">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />
                {skillInput && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredSuggestions.slice(0, 5).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                        onClick={() => addSkill(skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <Label>Social Links</Label>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={formData.github_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Portfolio Project Modal */}
      <AddPortfolioProjectModal
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        onSubmit={addPortfolioProject}
      />

      {/* Add Skill Badge Modal */}
      <AddSkillBadgeModal
        open={isAddBadgeOpen}
        onOpenChange={setIsAddBadgeOpen}
        onSubmit={addSkillBadge}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onSubmit={createProject}
      />
    </Layout>
  );
}
