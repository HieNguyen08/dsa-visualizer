import GraphAlgorithmVisualizer from '@/components/visualizers/graph-algorithms-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function GraphAlgorithmsPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thuật Toán Đồ Thị</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Khám phá các thuật toán cơ bản trên đồ thị như DFS, BFS, Dijkstra cho đường đi ngắn nhất,
              và thuật toán sắp xếp tô-pô trên đồ thị tương tác.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Thuật Toán Đồ Thị"
              description="Các thuật toán để duyệt, tìm kiếm và giải quyết các bài toán trên cấu trúc dữ liệu đồ thị."
              timeComplexity={{
                best: "O(V + E)",
                average: "O(V + E) - O(V²)", 
                worst: "O(V²)"
              }}
              spaceComplexity="O(V)"
              principles={[
                "Duyệt các đỉnh và cạnh theo chiến lược cụ thể",
                "Sử dụng cấu trúc dữ liệu phụ (stack, queue, priority queue)",
                "Đánh dấu các đỉnh đã thăm",
                "Relaxation cho shortest path algorithms"
              ]}
              keySteps={[
                "Chọn đỉnh khởi đầu",
                "Khởi tạo cấu trúc dữ liệu hỗ trợ",
                "Duyệt các đỉnh theo thuật toán",
                "Cập nhật thông tin cho các đỉnh lân cận",
                "Lặp lại cho đến khi hoàn thành"
              ]}
              applications={[
                "Social networks analysis",
                "GPS navigation và routing",
                "Internet và network protocols",
                "Dependency resolution",
                "Game AI pathfinding",
                "Recommendation systems",
                "Circuit design",
                "Project scheduling"
              ]}
              advantages={[
                "Hiệu quả cho nhiều loại bài toán",
                "Có thể áp dụng cho đồ thị có hướng và vô hướng",
                "Scalable với đồ thị lớn",
                "Foundation cho nhiều thuật toán phức tạp khác"
              ]}
              disadvantages={[
                "Phức tạp với đồ thị có trọng số âm",
                "Cần bộ nhớ để lưu trạng thái đỉnh",
                "Một số thuật toán không optimal cho sparse graphs"
              ]}
            />
          </div>
        </div>
        <GraphAlgorithmVisualizer />
      </div>
    </div>
  );
}
