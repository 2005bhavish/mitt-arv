import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import HeroSection from '@/components/blog/HeroSection';
import BlogCard from '@/components/blog/BlogCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, TrendingUp, Star } from 'lucide-react';

const Home = () => {
  const { posts, isLoading } = useSelector((state: RootState) => state.blog);

  const featuredPosts = posts.slice(0, 3);
  const recentPosts = posts.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Posts Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="space-y-2 mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Star className="w-8 h-8 text-primary" />
              Featured Stories
            </h2>
            <p className="text-muted-foreground">
              Handpicked stories from our community of writers
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search stories..."
                className="pl-10 w-full sm:w-80"
              />
            </div>
            <Button variant="outline" className="btn-ghost">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Featured Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {featuredPosts.map((post, index) => (
            <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <BlogCard post={post} />
            </div>
          ))}
        </div>

        {/* Recent Posts Section */}
        {recentPosts.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">Latest Stories</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post, index) => (
                <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Call-to-Action */}
        <div className="text-center mt-20 p-12 bg-gradient-surface rounded-2xl border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Share Your Story?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of writers who are already sharing their thoughts, experiences, and insights with the world.
          </p>
          <Button className="btn-hero" size="lg">
            Start Writing Today
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;