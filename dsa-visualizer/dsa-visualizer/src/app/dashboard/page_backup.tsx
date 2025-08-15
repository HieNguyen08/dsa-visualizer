"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  BarChart3, 
  BarChart4,
  GitBranch, 
  MapPin, 
  Zap, 
  Hash,
  TrendingUp,
  FileText,
  Calculator,
  Clock,
  Star,
  Play,
  Type,
  TreePine,
  Link2 as Merge,
  RotateCcw,
  TreeDeciduous,
  Binary,
  Filter,
  AlignLeft,
  Hexagon,
  Database,
  Globe,
  List,
  Repeat,
  Search,
  Award,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface AlgorithmCard {
  id: string;
  title: string;
  category: 'sorting' | 'tree' | 'graph' | 'data-structure' | 'advanced';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  description: string;
  icon: any;
  path: string;
  estimatedTime: string;
  concepts: string[];
  isCompleted?: boolean;
  rating?: number;
}

const algorithms: AlgorithmCard[] = [
  {
    id: 'sorting',
    title: 'Thuật Toán Sắp Xếp',
    category: 'sorting',
    difficulty: 'Trung bình',
    description: 'Trực quan hóa và so sánh các thuật toán sắp xếp khác nhau bao gồm Bubble Sort, Quick Sort, Merge Sort, và nhiều hơn nữa.',
    icon: BarChart3,
    path: '/sorting',
    estimatedTime: '30 phút',
    concepts: ['Độ phức tạp thời gian', 'Độ phức tạp không gian', 'Tính ổn định', 'Sắp xếp tại chỗ'],
    isCompleted: false,
    rating: 4.8
  },
  {
    id: 'binary-tree',
    title: 'Cây Tìm Kiếm Nhị Phân',
    category: 'tree',
    difficulty: 'Trung bình',
    description: 'Khám phá các thao tác BST như chèn, xóa và duyệt cây với trực quan hóa tương tác.',
    icon: GitBranch,
    path: '/visualizer/binary-tree',
    estimatedTime: '25 phút',
    concepts: ['Duyệt cây', 'Tính chất BST', 'Đệ quy'],
    isCompleted: false,
    rating: 4.6
  },
  {
    id: 'avl-tree',
    title: 'Cây AVL',
    category: 'tree',
    difficulty: 'Khó',
    description: 'Tìm hiểu về cây tìm kiếm nhị phân tự cân bằng với các phép xoay.',
    icon: GitBranch,
    path: '/visualizer/avl-tree',
    estimatedTime: '40 phút',
    concepts: ['Cân bằng cây', 'Phép xoay', 'Tính chiều cao'],
    isCompleted: false,
    rating: 4.7
  },
  {
    id: 'pathfinding',
    title: 'Thuật Toán Tìm Đường',
    category: 'graph',
    difficulty: 'Khó',
    description: 'Trực quan hóa các thuật toán duyệt đồ thị như Dijkstra, A*, BFS, và DFS.',
    icon: MapPin,
    path: '/pathfinding',
    estimatedTime: '45 phút',
    concepts: ['Duyệt đồ thị', 'Tìm đường tối ưu', 'Heuristic'],
    isCompleted: false,
    rating: 4.9
  },
  {
    id: 'linked-list',
    title: 'Danh Sách Liên Kết',
    category: 'data-structure',
    difficulty: 'Dễ',
    description: 'Hiểu về cấu trúc dữ liệu danh sách liên kết và các thao tác cơ bản.',
    icon: Link2 as any,
    path: '/visualizer/linked-list',
    estimatedTime: '20 phút',
    concepts: ['Con trỏ', 'Phân bổ động', 'Duyệt tuyến tính'],
    isCompleted: false,
    rating: 4.5
  },
  {
    id: 'stack',
    title: 'Ngăn Xếp (Stack)',
    category: 'data-structure',
    difficulty: 'Dễ',
    description: 'Học về cấu trúc dữ liệu LIFO (Last In First Out) với các thao tác push, pop.',
    icon: BarChart4,
    path: '/visualizer/stack',
    estimatedTime: '15 phút',
    concepts: ['LIFO', 'Push/Pop', 'Overflow/Underflow'],
    isCompleted: false,
    rating: 4.4
  },
  {
    id: 'queue',
    title: 'Hàng Đợi (Queue)',
    category: 'data-structure',
    difficulty: 'Dễ',
    description: 'Khám phá cấu trúc dữ liệu FIFO (First In First Out) và các ứng dụng.',
    icon: TrendingUp,
    path: '/visualizer/queue',
    estimatedTime: '15 phút',
    concepts: ['FIFO', 'Enqueue/Dequeue', 'Circular Queue'],
    isCompleted: false,
    rating: 4.3
  },
  {
    id: 'huffman',
    title: 'Mã Hóa Huffman',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Tìm hiểu thuật toán nén dữ liệu sử dụng cây Huffman và mã hóa ký tự.',
    icon: FileText,
    path: '/visualizer/huffman',
    estimatedTime: '35 phút',
    concepts: ['Nén dữ liệu', 'Cây nhị phân', 'Mã hóa tần suất'],
    isCompleted: false,
    rating: 4.8
  },
  {
    id: 'dijkstra',
    title: 'Thuật Toán Dijkstra',
    category: 'graph',
    difficulty: 'Khó',
    description: 'Thuật toán tìm đường đi ngắn nhất từ một đỉnh đến tất cả các đỉnh khác.',
    icon: MapPin,
    path: '/visualizer/dijkstra',
    estimatedTime: '40 phút',
    concepts: ['Đường đi ngắn nhất', 'Greedy', 'Trọng số dương'],
    isCompleted: false,
    rating: 4.7
  },
  {
    id: 'heap',
    title: 'Heap (Đống)',
    category: 'data-structure',
    difficulty: 'Trung bình',
    description: 'Cấu trúc dữ liệu cây nhị phân hoàn chỉnh với tính chất heap.',
    icon: TreePine,
    path: '/visualizer/heap',
    estimatedTime: '30 phút',
    concepts: ['Max/Min Heap', 'Heapify', 'Priority Queue'],
    isCompleted: false,
    rating: 4.6
  },
  {
    id: 'polynomial',
    title: 'Đa Thức và Biểu Thức',
    category: 'advanced',
    difficulty: 'Trung bình',
    description: 'Biểu diễn và tính toán với đa thức sử dụng danh sách liên kết.',
    icon: Calculator,
    path: '/visualizer/polynomial',
    estimatedTime: '25 phút',
    concepts: ['Đại số', 'Biểu diễn dữ liệu', 'Tính toán'],
    isCompleted: false,
    rating: 4.2
  },
  {
    id: 'dynamic-programming',
    title: 'Quy Hoạch Động Nâng Cao',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Các bài toán quy hoạch động phức tạp với tối ưu hóa và memoization.',
    icon: Zap,
    path: '/visualizer/dynamic-programming',
    estimatedTime: '50 phút',
    concepts: ['Memoization', 'Tối ưu con', 'Bảng DP'],
    isCompleted: false,
    rating: 4.9
  },
  {
    id: 'graph-algorithms',
    title: 'Thuật Toán Đồ Thị',
    category: 'graph',
    difficulty: 'Khó',
    description: 'Tập hợp các thuật toán đồ thị quan trọng như Kruskal, Prim, Floyd-Warshall.',
    icon: Hash,
    path: '/visualizer/graph-algorithms',
    estimatedTime: '60 phút',
    concepts: ['MST', 'Chu trình', 'Liên thông'],
    isCompleted: false,
    rating: 4.8
  },
  {
    id: 'backtracking',
    title: 'Thuật Toán Quay Lui',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Kỹ thuật giải quyết bài toán bằng cách thử tất cả các khả năng và quay lui.',
    icon: RotateCcw,
    path: '/visualizer/backtracking',
    estimatedTime: '45 phút',
    concepts: ['Brute Force', 'Pruning', 'Recursion'],
    isCompleted: false,
    rating: 4.7
  },
  {
    id: 'red-black-tree',
    title: 'Cây Đỏ-Đen',
    category: 'tree',
    difficulty: 'Khó',
    description: 'Cây tìm kiếm nhị phân tự cân bằng với các nút màu đỏ và đen.',
    icon: TreeDeciduous,
    path: '/visualizer/red-black-tree',
    estimatedTime: '50 phút',
    concepts: ['Tự cân bằng', 'Tính chất màu', 'Phép xoay'],
    isCompleted: false,
    rating: 4.8
  },
  {
    id: 'b-tree',
    title: 'Cây B',
    category: 'tree',
    difficulty: 'Khó',
    description: 'Cây cân bằng được sử dụng trong cơ sở dữ liệu và hệ thống file.',
    icon: Binary,
    path: '/visualizer/b-tree',
    estimatedTime: '45 phút',
    concepts: ['Cây đa nhánh', 'Disk I/O', 'Cân bằng'],
    isCompleted: false,
    rating: 4.6
  },
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    category: 'data-structure',
    difficulty: 'Trung bình',
    description: 'Cấu trúc dữ liệu xác suất để kiểm tra tập hợp một cách hiệu quả.',
    icon: Filter,
    path: '/visualizer/bloom-filter',
    estimatedTime: '30 phút',
    concepts: ['Xác suất', 'Hash functions', 'False positive'],
    isCompleted: false,
    rating: 4.5
  },
  {
    id: 'suffix-tree',
    title: 'Cây Hậu Tố',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Cây chứa tất cả các hậu tố của một chuỗi, dùng cho khớp mẫu nhanh.',
    icon: AlignLeft,
    path: '/visualizer/suffix-tree',
    estimatedTime: '55 phút',
    concepts: ['Khớp chuỗi', 'Suffix links', 'Linear construction'],
    isCompleted: false,
    rating: 4.9
  },
  {
    id: 'segment-tree',
    title: 'Cây Phân Đoạn',
    category: 'data-structure',
    difficulty: 'Khó',
    description: 'Cấu trúc dữ liệu cho truy vấn và cập nhật khoảng hiệu quả.',
    icon: Hexagon,
    path: '/visualizer/segment-tree',
    estimatedTime: '40 phút',
    concepts: ['Range queries', 'Lazy propagation', 'Divide & conquer'],
    isCompleted: false,
    rating: 4.7
  },
  {
    id: 'trie',
    title: 'Cây Trie (Prefix Tree)',
    category: 'data-structure',
    difficulty: 'Trung bình',
    description: 'Cây tiền tố để lưu trữ và tìm kiếm chuỗi hiệu quả.',
    icon: Database,
    path: '/visualizer/trie',
    estimatedTime: '30 phút',
    concepts: ['Tiền tố chung', 'Autocomplete', 'Dictionary'],
    isCompleted: false,
    rating: 4.6
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Kỹ thuật phân tán dữ liệu trong hệ thống phân tán với khả năng mở rộng.',
    icon: Globe,
    path: '/visualizer/consistent-hashing',
    estimatedTime: '35 phút',
    concepts: ['Hệ thống phân tán', 'Load balancing', 'Ring topology'],
    isCompleted: false,
    rating: 4.8
  },
  {
    id: 'skip-list',
    title: 'Danh Sách Bỏ Qua',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Cấu trúc dữ liệu xác suất để thực hiện tìm kiếm, chèn và xóa nhanh chóng.',
    icon: List,
    path: '/visualizer/skip-list',
    estimatedTime: '35 phút',
    concepts: ['Cấu trúc xác suất', 'Đa cấp độ', 'Tìm kiếm nhanh', 'Chiều cao ngẫu nhiên'],
    isCompleted: false,
    rating: 4.6
  },
  {
    id: 'manacher-algorithm',
    title: 'Thuật Toán Manacher',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Thuật toán thời gian tuyến tính để tìm tất cả các chuỗi con palindrome trong một chuỗi.',
    icon: Repeat,
    path: '/visualizer/manacher',
    estimatedTime: '40 phút',
    concepts: ['Palindrome', 'Thời gian tuyến tính', 'Xử lý chuỗi', 'Mở rộng tâm'],
    isCompleted: false,
    rating: 4.9
  },
  {
    id: 'z-algorithm',
    title: 'Thuật Toán Z',
    category: 'advanced',
    difficulty: 'Khó',
    description: 'Thuật toán khớp chuỗi hiệu quả để tìm các lần xuất hiện của mẫu.',
    icon: Zap,
    path: '/visualizer/z-algorithm',
    estimatedTime: '35 phút',
    concepts: ['Khớp chuỗi', 'Thời gian tuyến tính', 'Mảng Z', 'Nhận dạng mẫu'],
    isCompleted: false,
    rating: 4.7
  }
];

const categories = [
  { id: 'all', name: 'Tất cả thuật toán', icon: BookOpen },
  { id: 'sorting', name: 'Sắp xếp', icon: BarChart3 },
  { id: 'tree', name: 'Cây', icon: GitBranch },
  { id: 'graph', name: 'Đồ thị', icon: MapPin },
  { id: 'data-structure', name: 'Cấu trúc dữ liệu', icon: Hash },
  { id: 'advanced', name: 'Nâng cao', icon: Zap }
];

const difficulties = [
  { id: 'all', name: 'Tất cả cấp độ' },
  { id: 'Dễ', name: 'Dễ' },
  { id: 'Trung bình', name: 'Trung bình' },
  { id: 'Khó', name: 'Khó' }
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [filteredAlgorithms, setFilteredAlgorithms] = useState(algorithms);

  useEffect(() => {
    let filtered = algorithms;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(algo =>
        algo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.concepts.some(concept => concept.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(algo => algo.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(algo => algo.difficulty === selectedDifficulty);
    }

    setFilteredAlgorithms(filtered);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return 'bg-green-100 text-green-800';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
      case 'Khó': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sorting': return 'bg-blue-100 text-blue-800';
      case 'tree': return 'bg-green-100 text-green-800';
      case 'graph': return 'bg-purple-100 text-purple-800';
      case 'data-structure': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = algorithms.filter(algo => algo.isCompleted).length;
  const totalCount = algorithms.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển học thuật toán</h1>
        <p className="text-gray-600">Thành thạo cấu trúc dữ liệu và thuật toán thông qua trực quan hóa tương tác</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiến độ</p>
                <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thời gian học</p>
                <p className="text-2xl font-bold">12h 30m</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chuỗi ngày</p>
                <p className="text-2xl font-bold">7 ngày</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                <p className="text-2xl font-bold">4.5</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm thuật toán..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Thể loại:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cấp độ:</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlgorithms.map((algorithm) => {
          const IconComponent = algorithm.icon;
          return (
            <Card key={algorithm.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{algorithm.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getDifficultyColor(algorithm.difficulty)}>
                          {algorithm.difficulty}
                        </Badge>
                        <Badge className={getCategoryColor(algorithm.category)}>
                          {algorithm.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {algorithm.isCompleted && (
                    <div className="p-1 bg-green-100 rounded-full">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{algorithm.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {algorithm.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {algorithm.rating}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Khái niệm chính:</p>
                  <div className="flex flex-wrap gap-1">
                    {algorithm.concepts.slice(0, 3).map((concept, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Link href={algorithm.path}>
                  <Button className="w-full" variant={algorithm.isCompleted ? "outline" : "default"}>
                    <Play className="w-4 h-4 mr-2" />
                    {algorithm.isCompleted ? 'Ôn tập' : 'Bắt đầu học'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlgorithms.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy thuật toán</h3>
          <p className="text-gray-500">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc của bạn</p>
        </div>
      )}
    </div>
  );
}
