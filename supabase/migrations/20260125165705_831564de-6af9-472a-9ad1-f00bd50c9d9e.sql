-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'available',
  looking_for TEXT DEFAULT 'project',
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  roles_needed TEXT[] DEFAULT '{}',
  hackathon_name TEXT,
  hackathon_date TEXT,
  team_size INTEGER DEFAULT 1,
  max_team_size INTEGER DEFAULT 5,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_interests table (when user swipes right/interested)
CREATE TABLE public.project_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create matches table (when both parties accept)
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'match', 'message', 'interest'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Projects are viewable by authenticated users" 
ON public.projects FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
TO authenticated
USING (auth.uid() = owner_id);

-- Project interests policies
CREATE POLICY "Users can view interests on their projects or their own interests" 
ON public.project_interests FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can create interests" 
ON public.project_interests FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project owners can update interest status" 
ON public.project_interests FOR UPDATE 
TO authenticated
USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- Matches policies
CREATE POLICY "Users can view their matches" 
ON public.matches FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Project owners can create matches" 
ON public.matches FOR INSERT 
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their matches" 
ON public.messages FOR SELECT 
TO authenticated
USING (
  match_id IN (SELECT id FROM public.matches WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

CREATE POLICY "Users can send messages in their matches" 
ON public.messages FOR INSERT 
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  match_id IN (SELECT id FROM public.matches WHERE user_id = auth.uid() OR owner_id = auth.uid())
);

CREATE POLICY "Users can update their own messages" 
ON public.messages FOR UPDATE 
TO authenticated
USING (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications" 
ON public.notifications FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON public.notifications FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their notifications" 
ON public.notifications FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle match creation and notifications
CREATE OR REPLACE FUNCTION public.handle_interest_accepted()
RETURNS TRIGGER AS $$
DECLARE
  project_owner_id UUID;
  project_title TEXT;
  interested_user_name TEXT;
  owner_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Get project details
    SELECT owner_id, title INTO project_owner_id, project_title
    FROM public.projects WHERE id = NEW.project_id;
    
    -- Get user names
    SELECT full_name INTO interested_user_name FROM public.profiles WHERE user_id = NEW.user_id;
    SELECT full_name INTO owner_name FROM public.profiles WHERE user_id = project_owner_id;
    
    -- Create match
    INSERT INTO public.matches (project_id, user_id, owner_id)
    VALUES (NEW.project_id, NEW.user_id, project_owner_id)
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    -- Notify the interested user
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.user_id,
      'match',
      'New Match!',
      'Your interest in "' || project_title || '" was accepted! You can now chat with ' || owner_name,
      NEW.project_id
    );
    
    -- Notify the project owner
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      project_owner_id,
      'match',
      'Match Created!',
      interested_user_name || ' has been added to your project "' || project_title || '"',
      NEW.project_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for interest acceptance
CREATE TRIGGER on_interest_accepted
AFTER UPDATE ON public.project_interests
FOR EACH ROW
EXECUTE FUNCTION public.handle_interest_accepted();

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;