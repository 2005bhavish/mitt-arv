-- Create comments table for blog posts
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reactions table for posts
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create comment reactions table  
CREATE TABLE public.comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'laugh')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS on all tables
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone for published posts" 
ON public.comments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id AND posts.published = true
  )
  OR EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id AND posts.author_id = auth.uid()
  )
);

CREATE POLICY "Users can create comments on published posts" 
ON public.comments FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = comments.post_id AND posts.published = true
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- Post reactions policies
CREATE POLICY "Post reactions are viewable by everyone for published posts" 
ON public.post_reactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_reactions.post_id AND posts.published = true
  )
);

CREATE POLICY "Users can add reactions to published posts" 
ON public.post_reactions FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_reactions.post_id AND posts.published = true
  )
);

CREATE POLICY "Users can remove their own reactions" 
ON public.post_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Comment reactions policies  
CREATE POLICY "Comment reactions are viewable by everyone" 
ON public.comment_reactions FOR SELECT 
USING (true);

CREATE POLICY "Users can add reactions to comments" 
ON public.comment_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own comment reactions" 
ON public.comment_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);

-- Add trigger for updated_at on comments
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Bhavish's profile data
INSERT INTO public.profiles (id, display_name, bio, avatar_url) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Bhavish Ankam', 
  'Full-stack developer passionate about creating amazing web experiences. I love building scalable applications using modern technologies like React, Node.js, and cloud platforms. Always excited to learn new things and share knowledge with the community.',
  'https://avatars.githubusercontent.com/u/2005bhavish?v=4'
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;