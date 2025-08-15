"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { featureList } from '@/components/navigation/navbar';
import { Search } from 'lucide-react';

export default function VisualizerGalleryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Tất cả');

  // Group features by category
  const categories = {
    'Tất cả': featureList,
    'Cấu trúc dữ liệu': featureList.filter(f => 
      f.title.includes('Stack') || f.title.includes('Queue') || f.title.includes('Linked List') || 
      f.title.includes('Hash Table') || f.title.includes('Heap Data Structure') || f.title.includes('Tree')
    ),
    'Sắp xếp': featureList.filter(f => 
      f.title.includes('Sort') || f.title.includes('Sorting')
    ),
    'Thuật toán đồ thị': featureList.filter(f => 
      f.title.includes('Graph') || f.title.includes('Pathfinding') || f.title.includes('Spanning Tree')
    ),
    'Quy hoạch động': featureList.filter(f => 
      f.title.includes('Dynamic Programming')
    ),
    'Thuật toán chuỗi': featureList.filter(f => 
      f.title.includes('String')
    ),
    'Ứng dụng': featureList.filter(f => 
      f.title.includes('Applications') || f.title.includes('Polynomial') || f.title.includes('Huffman') || 
      f.title.includes('Message Queue')
    ),
    'Công cụ học tập': featureList.filter(f => 
      f.title.includes('Playground') || f.title.includes('Profiler') || f.title.includes('Learning') || 
      f.title.includes('Comparison')
    )
  };

  const currentFeatures = categories[selectedCategory as keyof typeof categories] || featureList;

  const filteredFeatures = currentFeatures.filter(
    (feature) =>
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: log feature count
  React.useEffect(() => {
    console.log('Dashboard loaded with', featureList.length, 'algorithms');
  }, []);

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Bảng Điều Khiển Trực Quan Thuật Toán</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Khám phá nhiều cấu trúc dữ liệu và thuật toán khác nhau thông qua các hình ảnh tương tác. 
          Tìm kiếm một chủ đề cụ thể hoặc duyệt qua bộ sưu tập bên dưới.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Tổng số thuật toán: {featureList.length} | Đang hiển thị: {filteredFeatures.length}
        </div>
      </div>

      <div className="relative mb-10 max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm thuật toán (ví dụ: 'Sắp xếp', 'Cây', 'Tìm đường')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full h-12 text-base"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Object.keys(categories).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-sm"
          >
            {category} ({categories[category as keyof typeof categories].length})
          </Button>
        ))}
      </div>

      {filteredFeatures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Link href={feature.url} key={feature.title}>
              <Card className="h-full flex flex-col hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">Không tìm thấy thuật toán phù hợp.</p>
          <p className="text-sm text-muted-foreground mt-2">Hãy thử tìm kiếm với từ khóa khác.</p>
        </div>
      )}
    </main>
  );
}
