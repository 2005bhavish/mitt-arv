import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenTool, BookOpen, Users, Sparkles, ArrowRight, Play } from 'lucide-react';
import heroImage from '@/assets/hero-blog.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:50px_50px] animate-pulse-slow" />
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl animate-blob" />
      <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-2xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-primary/30 to-transparent rounded-full blur-xl animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Create • Share • Inspire</span>
              </div>

              {/* Main Title */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Write Your
                  <span className="bg-gradient-primary bg-clip-text text-transparent block">
                    Legacy
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                  Transform your thoughts into timeless stories. Join a community where every voice matters and creativity knows no bounds.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="btn-hero group" size="lg" asChild>
                  <Link to="/register">
                    <PenTool className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="group" asChild>
                  <Link to="/about">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full border-2 border-background ${
                        i === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        i === 2 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        i === 3 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                        'bg-gradient-to-r from-orange-400 to-orange-600'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Join 2,500+ writers</p>
                  <p className="text-xs text-muted-foreground">Already sharing their stories</p>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Showcase */}
            <div className="relative animate-slide-in-right">
              <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-2xl">
                {/* Floating Editor Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground ml-2">Advanced Editor</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/10 rounded animate-shimmer" />
                    <div className="h-3 bg-muted/50 rounded w-3/4" />
                    <div className="h-3 bg-muted/50 rounded w-1/2" />
                    <div className="h-20 bg-muted/30 rounded-lg border-2 border-dashed border-muted" />
                    <div className="flex gap-2">
                      {['React', 'TypeScript', 'Design'].map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-background border border-border rounded-2xl p-4 shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">2.5K+ Stories</p>
                    <p className="text-xs text-muted-foreground">Published this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;