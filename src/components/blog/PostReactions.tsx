import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Heart, Laugh, Frown, Angry, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
}

interface PostReactionsProps {
  postId: string;
}

const reactionConfig = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
  heart: { icon: Heart, label: 'Love', color: 'text-red-600 bg-red-50 hover:bg-red-100' },
  laugh: { icon: Laugh, label: 'Haha', color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' },
  wow: { icon: Zap, label: 'Wow', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
  sad: { icon: Frown, label: 'Sad', color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
  angry: { icon: Angry, label: 'Angry', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' }
};

const PostReactions: React.FC<PostReactionsProps> = ({ postId }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;
      setReactions(data || []);
    } catch (error: any) {
      console.error('Error fetching reactions:', error);
    }
  };

  const toggleReaction = async (reactionType: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;

        setReactions(prev => prev.filter(r => r.id !== existingReaction.id));
      } else {
        // Add reaction (remove existing reaction of different type first)
        const userExistingReaction = reactions.find(r => r.user_id === user.id);
        if (userExistingReaction) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('id', userExistingReaction.id);
        }

        const { data, error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          })
          .select()
          .single();

        if (error) throw error;

        setReactions(prev => 
          prev.filter(r => r.user_id !== user.id).concat(data)
        );
      }
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  // Calculate reaction counts
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get user's current reaction
  const userReaction = user ? reactions.find(r => r.user_id === user.id) : null;

  // Total reactions count
  const totalReactions = reactions.length;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Reaction Stats */}
          {totalReactions > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {Object.entries(reactionCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([type, count]) => {
                    const config = reactionConfig[type as keyof typeof reactionConfig];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <div key={type} className="flex items-center gap-1">
                        <Icon className="w-4 h-4" />
                        <span>{count}</span>
                      </div>
                    );
                  })}
              </div>
              <Badge variant="secondary">
                {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
              </Badge>
            </div>
          )}

          {/* Reaction Buttons */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(reactionConfig).map(([type, config]) => {
              const Icon = config.icon;
              const count = reactionCounts[type] || 0;
              const isUserReaction = userReaction?.reaction_type === type;
              
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReaction(type)}
                  disabled={loading}
                  className={`flex items-center gap-1.5 h-8 px-2 text-xs transition-all hover:scale-105 ${
                    isUserReaction ? config.color : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isUserReaction ? 'scale-110' : ''} transition-transform`} />
                  <span className="font-medium">{count > 0 ? count : ''}</span>
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Call to Action */}
          {!user && (
            <div className="text-center py-2 px-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <a href="/login" className="text-primary hover:underline font-medium">Sign in</a> to react to this post
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostReactions;