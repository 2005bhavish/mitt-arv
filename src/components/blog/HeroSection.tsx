import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenTool, BookOpen, Users } from 'lucide-react';
import heroImage from '@/assets/hero-blog.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-surface">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mitt Arv Blog Platform"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4 hero-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Share Your{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Story
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Mitt Arv is where thoughts become stories, ideas become insights, and writers become voices that matter.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center hero-slide-up">
            <Button className="btn-hero" size="lg" asChild>
              <Link to="/register">
                <PenTool className="w-5 h-5 mr-2" />
                Start Writing Today
              </Link>
            </Button>
            <Button variant="ghost" className="btn-ghost" size="lg" asChild>
              <Link to="/posts">
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Stories
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 hero-slide-up">
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">2.5K+</div>
              <p className="text-muted-foreground">Stories Published</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">1.2K+</div>
              <p className="text-muted-foreground">Active Writers</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
              <p className="text-muted-foreground">Monthly Readers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-gentle-float hidden lg:block" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/10 rounded-full animate-gentle-float hidden lg:block" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-20 w-12 h-12 bg-primary/20 rounded-full animate-gentle-float hidden lg:block" style={{ animationDelay: '4s' }} />
    </section>
  );
};

export default HeroSection;