"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  ThumbsUp, 
  Reply, 
  Tag,
  Users,
  Clock,
  TrendingUp,
  HelpCircle,
  BookOpen,
  AlertCircle
} from 'lucide-react';

// Badge component
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || 'bg-gray-100 text-gray-800'}`}>
    {children}
  </span>
);

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  createdAt: string;
  isLiked: boolean;
}

// Comment interface for recursive comment structure
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  likes: number;
  replies: Comment[]; // Recursive reference
}

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'DISCUSSION',
    tags: ''
  });

  const categories = [
    { id: 'all', name: 'All Posts', icon: MessageSquare },
    { id: 'DISCUSSION', name: 'Discussions', icon: MessageSquare },
    { id: 'QUESTION', name: 'Questions', icon: HelpCircle },
    { id: 'TUTORIAL', name: 'Tutorials', icon: BookOpen },
    { id: 'BUG_REPORT', name: 'Bug Reports', icon: AlertCircle }
  ];

  useEffect(() => {
    // Mock data
    const mockPosts: Post[] = [
      {
        id: '1',
        title: 'Best approach for learning Dynamic Programming?',
        content: 'I\'ve been struggling with DP problems. What\'s the best way to approach learning this topic? Any good resources or strategies?',
        author: {
          name: 'Alice Johnson',
          role: 'USER'
        },
        category: 'QUESTION',
        tags: ['dynamic-programming', 'learning', 'algorithms'],
        likes: 24,
        replies: 8,
        createdAt: '2024-08-14T10:30:00Z',
        isLiked: false
      },
      {
        id: '2',
        title: 'Implementing Dijkstra\'s Algorithm - Step by Step Guide',
        content: 'Here\'s a comprehensive guide on implementing Dijkstra\'s shortest path algorithm with code examples and visualizations.',
        author: {
          name: 'Dr. Smith',
          role: 'TEACHER'
        },
        category: 'TUTORIAL',
        tags: ['dijkstra', 'graph-algorithms', 'shortest-path'],
        likes: 45,
        replies: 12,
        createdAt: '2024-08-13T15:20:00Z',
        isLiked: true
      },
      {
        id: '3',
        title: 'Bug in Merge Sort Visualization',
        content: 'I noticed that the merge sort visualization doesn\'t properly show the merging step. The array elements seem to jump positions.',
        author: {
          name: 'Mike Chen',
          role: 'USER'
        },
        category: 'BUG_REPORT',
        tags: ['merge-sort', 'visualization', 'bug'],
        likes: 8,
        replies: 3,
        createdAt: '2024-08-13T09:15:00Z',
        isLiked: false
      }
    ];

    setPosts(mockPosts);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DISCUSSION': return 'bg-blue-100 text-blue-800';
      case 'QUESTION': return 'bg-green-100 text-green-800';
      case 'TUTORIAL': return 'bg-purple-100 text-purple-800';
      case 'BUG_REPORT': return 'bg-red-100 text-red-800';
      case 'ANNOUNCEMENT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'TEACHER': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = async () => {
    // Mock post creation
    const post: Post = {
      id: String(posts.length + 1),
      title: newPost.title,
      content: newPost.content,
      author: {
        name: 'Current User', // Replace with actual user
        role: 'USER'
      },
      category: newPost.category,
      tags: newPost.tags.split(',').map(tag => tag.trim()),
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: 'DISCUSSION', tags: '' });
    setShowNewPost(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Community
          </h1>
          <p className="text-gray-600 mt-1">Connect, discuss, and learn together</p>
        </div>
        <Button onClick={() => setShowNewPost(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="questions">Q&A</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.author.name}</span>
                        <Badge className={getRoleColor(post.author.role)}>
                          {post.author.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(post.category)}>
                    {post.category}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} className="bg-gray-100 text-gray-700">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`flex items-center gap-2 ${post.isLiked ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                      <Reply className="w-4 h-4" />
                      {post.replies} replies
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {filteredPosts.filter(post => post.category === 'QUESTION').map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{post.likes}</div>
                    <div className="text-xs text-gray-500">votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{post.replies}</div>
                    <div className="text-xs text-gray-500">answers</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <Badge key={tag} className="bg-blue-100 text-blue-800 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        asked by {post.author.name}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Topics This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Dynamic Programming Patterns</span>
                    <span className="text-sm text-gray-500">156 discussions</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Graph Algorithm Optimization</span>
                    <span className="text-sm text-gray-500">89 discussions</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">AI Assistant Best Practices</span>
                    <span className="text-sm text-gray-500">67 discussions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Posts */}
            {filteredPosts
              .sort((a, b) => b.likes + b.replies - (a.likes + a.replies))
              .slice(0, 5)
              .map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                        <Reply className="w-4 h-4 ml-2" />
                        {post.replies}
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">{post.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{post.content}</p>
                    <div className="text-xs text-gray-500">
                      by {post.author.name} • {formatDate(post.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <select 
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="DISCUSSION">Discussion</option>
                  <option value="QUESTION">Question</option>
                  <option value="TUTORIAL">Tutorial</option>
                  <option value="BUG_REPORT">Bug Report</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content..."
                  className="min-h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="algorithms, sorting, help..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewPost(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.content}
                >
                  Create Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
