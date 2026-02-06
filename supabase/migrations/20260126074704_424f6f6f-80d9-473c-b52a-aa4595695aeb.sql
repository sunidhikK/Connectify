-- Portfolio Projects Table (for project showcase)
CREATE TABLE public.portfolio_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    github_url TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skills Badges Table (earned badges for skill levels)
CREATE TABLE public.skill_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    badge_level TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced, expert
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_name)
);

-- Skill Endorsements Table (LinkedIn-style endorsements)
CREATE TABLE public.skill_endorsements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_badge_id UUID NOT NULL REFERENCES public.skill_badges(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(skill_badge_id, endorser_id)
);

-- Activity Feed Table
CREATE TABLE public.activity_feed (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'project_created', 'skill_added', 'badge_earned', 'endorsement_received', 'collaboration_joined'
    title TEXT NOT NULL,
    description TEXT,
    related_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project Reviews Table
CREATE TABLE public.project_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, reviewer_id)
);

-- Add profile customization columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS profile_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS github_username TEXT;

-- Enable RLS on all new tables
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;

-- Portfolio Projects Policies
CREATE POLICY "Portfolio projects are viewable by everyone"
ON public.portfolio_projects FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own portfolio projects"
ON public.portfolio_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio projects"
ON public.portfolio_projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio projects"
ON public.portfolio_projects FOR DELETE
USING (auth.uid() = user_id);

-- Skill Badges Policies
CREATE POLICY "Skill badges are viewable by everyone"
ON public.skill_badges FOR SELECT
USING (true);

CREATE POLICY "Users can create their own skill badges"
ON public.skill_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill badges"
ON public.skill_badges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill badges"
ON public.skill_badges FOR DELETE
USING (auth.uid() = user_id);

-- Skill Endorsements Policies
CREATE POLICY "Endorsements are viewable by everyone"
ON public.skill_endorsements FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can endorse skills"
ON public.skill_endorsements FOR INSERT
WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can delete their own endorsements"
ON public.skill_endorsements FOR DELETE
USING (auth.uid() = endorser_id);

-- Activity Feed Policies
CREATE POLICY "Activity feed is viewable by everyone"
ON public.activity_feed FOR SELECT
USING (true);

CREATE POLICY "System can create activity entries"
ON public.activity_feed FOR INSERT
WITH CHECK (true);

-- Project Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
ON public.project_reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.project_reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
ON public.project_reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
ON public.project_reviews FOR DELETE
USING (auth.uid() = reviewer_id);

-- Create trigger for portfolio_projects updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_related_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activity_feed (user_id, activity_type, title, description, related_id, metadata)
    VALUES (p_user_id, p_activity_type, p_title, p_description, p_related_id, p_metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;

-- Enable realtime for activity_feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;