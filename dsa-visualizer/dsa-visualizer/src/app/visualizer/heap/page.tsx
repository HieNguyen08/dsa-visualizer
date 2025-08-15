import HeapVisualizer from '@/components/visualizers/heap-data-structure-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function HeapPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Heap (Đống)</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Heap là một cấu trúc dữ liệu cây nhị phân đặc biệt thỏa mãn tính chất heap:
              trong max-heap, nút cha luôn lớn hơn hoặc bằng nút con, trong min-heap thì ngược lại.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Heap (Đống)"
              description="Heap là cấu trúc dữ liệu cây nhị phân hoàn chỉnh có tính chất đặc biệt về thứ tự các phần tử, thường được implement bằng array."
              timeComplexity={{
                best: "O(1) - O(log n)",
                average: "O(log n)", 
                worst: "O(log n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Cây nhị phân hoàn chỉnh (complete binary tree)",
                "Tính chất heap: parent ≥ children (max-heap) hoặc parent ≤ children (min-heap)",
                "Thường implement bằng array với index mapping",
                "Root element là max (max-heap) hoặc min (min-heap)"
              ]}
              keySteps={[
                "Insert: Thêm vào cuối, sau đó heapify up",
                "Extract: Lấy root, thay bằng phần tử cuối, heapify down",
                "Heapify up: So sánh với parent, swap nếu cần",
                "Heapify down: So sánh với children, swap với appropriate child",
                "Build heap: Heapify từ dưới lên"
              ]}
              applications={[
                "Priority Queue implementation",
                "Heap Sort algorithm", 
                "Dijkstra's shortest path algorithm",
                "Prim's minimum spanning tree",
                "Job scheduling trong OS",
                "Memory management",
                "Huffman coding tree construction",
                "Top K problems"
              ]}
              advantages={[
                "Insert và extract O(log n)",
                "Find min/max O(1)",
                "Space efficient (array implementation)",
                "Cache-friendly memory access pattern"
              ]}
              disadvantages={[
                "Search element tùy ý O(n)",
                "Không maintain sorted order",
                "Delete arbitrary element O(n)",
                "Không hỗ trợ merge hai heap hiệu quả"
              ]}
            />
          </div>
        </div>
        <HeapVisualizer />
      </div>
    </div>
  );
}
