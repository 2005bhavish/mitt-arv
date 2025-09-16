import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Save, Eye, Upload, X, Tag, Image } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost, categories, loading: blogLoading } = useBlog();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await createPost({
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        featured_image: formData.image || null,
        published: !isDraft,
        categoryIds: selectedCategories,
      });

      if (!error) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Handle category selection or other actions if needed
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Post</h1>
            <p className="text-muted-foreground">
              Share your thoughts and stories with the community
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Post Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter an engaging title for your post..."
                      className="text-lg"
                      required
                    />
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <CardHeader>
                    <CardTitle>Excerpt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Write a brief summary of your post..."
                      className="min-h-[100px]"
                      required
                    />
                  </CardContent>
                </Card>

                {/* Content */}
                <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write your post content here..."
                      className="min-h-[400px] rich-editor"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Rich text editor will be integrated here in the full implementation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Featured Image */}
                <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Featured Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="Image URL..."
                    />
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select onValueChange={addCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((categoryId) => {
                          const category = categories.find(c => c.id === categoryId);
                          return category ? (
                            <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                              {category.name}
                              <button
                                type="button"
                                onClick={() => removeCategory(categoryId)}
                                className="hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <CardContent className="pt-6 space-y-3">
                    <Button 
                      type="submit" 
                      className="btn-hero w-full"
                      disabled={loading || blogLoading}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {loading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={(e) => handleSubmit(e as any, true)}
                      disabled={loading || blogLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default CreatePost;