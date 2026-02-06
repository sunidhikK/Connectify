-- Fix the overly permissive activity_feed INSERT policy
DROP POLICY IF EXISTS "System can create activity entries" ON public.activity_feed;

CREATE POLICY "Users can create their own activity entries"
ON public.activity_feed FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- The security definer function log_activity will handle system-level inserts