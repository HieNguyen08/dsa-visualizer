
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DijkstraPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Graph Algorithms page since Dijkstra is included there
    router.replace('/visualizer/graph-algorithms');
  }, [router]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Đang chuyển hướng đến Thuật toán Đồ thị...</h1>
      <p className="mt-4 text-muted-foreground">
        Thuật toán Dijkstra có sẵn trong trình trực quan hóa Thuật toán Đồ thị.
      </p>
    </div>
  );
}
