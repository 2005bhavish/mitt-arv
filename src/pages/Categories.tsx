import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Tag, TrendingUp, Grid, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

interface Category extends Tables<'categories'> {
  post_count?: number;
}

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
  slug: string;
  author_id: string;
  published: boolean;
  profiles?: {
    display_name: string;
    avatar_url?: string | null;
  };
  categories?: Array<{
    categories: {
      name: string;
      color?: string;
    };
  }>;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          post_categories!inner (
            post_id,
            posts!inner (
              id,
              published
            )
          )
        `);

      if (error) throw error;

      // Count published posts for each category
      const categoriesWithCounts = (data || []).map(category => {
        const publishedPosts = category.post_categories?.filter(
          pc => pc.posts?.published
        ) || [];
        
        return {
          ...category,
          post_count: publishedPosts.length
        };
      });

      setCategories(categoriesWithCounts);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async (categoryId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            display_name,
            avatar_url
          ),
          post_categories (
            categories (
              name,
              color
            )
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (categoryId) {
        query = query.filter('post_categories.category_id', 'eq', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsData = (data || []).map(post => ({
        ...post,
        categories: post.post_categories || []
      }));

      setPosts(postsData);
      setFilteredPosts(postsData);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    fetchPosts(categoryId || undefined);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(query.toLowerCase())) ||
      post.categories?.some(pc => 
        pc.categories.name.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    setFilteredPosts(filtered);
  };

  const transformPostForCard = (post: Post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content,
    author: { 
      name: post.profiles?.display_name || 'Anonymous',
      avatar: post.profiles?.avatar_url
    },
    publishedAt: post.published_at || post.created_at,
    readTime: Math.ceil(post.content.length / 200),
    tags: post.categories?.map(pc => pc.categories.name) || [],
    slug: post.slug,
    image: post.featured_image || undefined
  });

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const selectedCategoryData = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Categories
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover amazing stories organized by topics that interest you most
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <Input
                placeholder="Search categories and posts..."
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleCategorySelect(null)}
                >
                  All Posts
                  <Badge variant="secondary" className="ml-auto">
                    {posts.length}
                  </Badge>
                </Button>
                
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color || '#6366f1' }}
                    />
                    {category.name}
                    <Badge variant="secondary" className="ml-auto">
                      {category.post_count || 0}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Category Stats */}
            <Card className="border-0 bg-card/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Categories</span>
                  <Badge>{categories.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published Posts</span>
                  <Badge>{posts.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filtered Results</span>
                  <Badge>{filteredPosts.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Category Header */}
            {selectedCategoryData && (
              <Card className="border-0 bg-gradient-to-r from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedCategoryData.color || '#6366f1' }}
                    >
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCategoryData.name}</h2>
                      <p className="text-muted-foreground">
                        {selectedCategoryData.description || 'Explore posts in this category'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedCategoryData ? `${selectedCategoryData.name} Posts` : 'All Posts'}
                </h3>
                <p className="text-muted-foreground">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'story' : 'stories'} found
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card className="border-0 bg-card/30">
                <CardContent className="p-12 text-center">
                  <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No posts found' : 'No posts in this category'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms or browse other categories.'
                      : 'This category is waiting for its first story. Why not be the first to write one?'
                    }
                  </p>
                  <Button asChild>
                    <Link to="/create">Write First Post</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {filteredPosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <BlogCard post={transformPostForCard(post)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;