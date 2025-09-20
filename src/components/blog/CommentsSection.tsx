import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Reply, MoreHorizontal, Heart, ThumbsUp, Smile, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id?: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  reactions?: Array<{
    reaction_type: string;
    user_id: string;
  }>;
}

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          parent_id,
          comment_reactions (
            reaction_type,
            user_id
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Get unique user IDs
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      
      // Get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Organize comments into nested structure
      const topLevelComments: Comment[] = [];
      const commentMap = new Map<string, Comment>();

      // First pass: create all comments with profiles
      commentsData?.forEach(comment => {
        const profile = profilesMap.get(comment.user_id);
        const commentObj: Comment = {
          ...comment,
          profiles: profile ? {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url
          } : undefined,
          reactions: comment.comment_reactions || [],
          replies: []
        };
        commentMap.set(comment.id, commentObj);
        
        if (!comment.parent_id) {
          topLevelComments.push(commentObj);
        }
      });

      // Second pass: nest replies
      commentsData?.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          const child = commentMap.get(comment.id);
          if (parent && child) {
            parent.replies!.push(child);
          }
        }
      });

      setComments(topLevelComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (content: string, parentId?: string) => {
    if (!user || !content.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;

      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });

      if (parentId) {
        setReplyContent('');
        setReplyTo(null);
      } else {
        setNewComment('');
      }

      fetchComments();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReaction = async (commentId: string, reactionType: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId) || 
                     comments.flatMap(c => c.replies || []).find(r => r.id === commentId);
      
      if (!comment) return;

      const existingReaction = comment.reactions?.find(
        r => r.user_id === user.id && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
      } else {
        // Add reaction
        await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      fetchComments();
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });

      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const renderComment = (comment: Comment, isReply = false) => {
    const userReactions = comment.reactions?.filter(r => r.user_id === user?.id) || [];
    const reactionCounts = comment.reactions?.reduce((acc, r) => {
      acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return (
      <Card key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-colors`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {(comment.profiles?.display_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.profiles?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {user && user.id === comment.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteComment(comment.id)}>
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
                {comment.content}
              </p>
              
              {/* Reactions and Reply Button */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReaction(comment.id, 'like')}
                  className={`h-6 px-2 text-xs ${
                    userReactions.find(r => r.reaction_type === 'like') 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {reactionCounts.like || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReaction(comment.id, 'heart')}
                  className={`h-6 px-2 text-xs ${
                    userReactions.find(r => r.reaction_type === 'heart') 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <Heart className="w-3 h-3 mr-1" />
                  {reactionCounts.heart || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReaction(comment.id, 'laugh')}
                  className={`h-6 px-2 text-xs ${
                    userReactions.find(r => r.reaction_type === 'laugh') 
                      ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <Smile className="w-3 h-3 mr-1" />
                  {reactionCounts.laugh || 0}
                </Button>
                
                {user && !isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="h-6 px-2 text-xs text-muted-foreground"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              {user && replyTo === comment.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => submitComment(replyContent, comment.id)}
                      disabled={!replyContent.trim() || submitting}
                    >
                      {submitting ? 'Posting...' : 'Reply'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                  {comment.replies.map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comments ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
      </h3>

      {/* New Comment Form */}
      {user ? (
        <Card>
          <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar || ''} />
                  <AvatarFallback>
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  onClick={() => submitComment(newComment)}
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">
              Please <a href="/login" className="text-primary hover:underline">sign in</a> to leave a comment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;