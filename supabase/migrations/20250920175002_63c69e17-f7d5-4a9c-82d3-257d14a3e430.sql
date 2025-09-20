-- Allow public viewing of profiles (for browsing writers and seeing profile info)
CREATE POLICY "profiles_select_public" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Update comments policy to ensure proper profile joins
DROP POLICY IF EXISTS "Comments are viewable by everyone for published posts" ON public.comments;

CREATE POLICY "Comments are viewable by everyone for published posts" 
ON public.comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = comments.post_id 
    AND posts.published = true
  ) OR 
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = comments.post_id 
    AND posts.author_id = auth.uid()
  )
);