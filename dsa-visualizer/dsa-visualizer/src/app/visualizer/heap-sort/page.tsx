import HeapSortVisualizer from "@/components/visualizers/heap-sort-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function HeapSortPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-2">Heap Sort (Sắp Xếp Heap)</h1>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto sm:mx-0">
              Heap Sort là thuật toán sắp xếp dựa trên so sánh sử dụng cấu trúc dữ liệu heap nhị phân.
              Nó đầu tiên xây dựng max heap, sau đó liên tục trích xuất phần tử lớn nhất.
              Trực quan hóa cấu trúc heap và quá trình sắp xếp bên dưới.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Heap Sort (Sắp Xếp Heap)"
              description="Thuật toán sắp xếp in-place sử dụng binary heap với độ phức tạp O(n log n) guaranteed."
              timeComplexity={{
                best: "O(n log n)",
                average: "O(n log n)", 
                worst: "O(n log n)"
              }}
              spaceComplexity="O(1)"
              principles={[
                "Xây dựng max heap từ array không có thứ tự",
                "Repeatedly extract max element",
                "Heapify để duy trì heap property",
                "In-place sorting algorithm"
              ]}
              keySteps={[
                "Build max heap từ input array",
                "Swap root (max element) với last element",
                "Giảm heap size và heapify root",
                "Lặp lại cho đến khi heap empty",
                "Array được sắp xếp tăng dần"
              ]}
              applications={[
                "Systems yêu cầu guaranteed O(n log n)",
                "Memory-constrained environments",
                "Priority queue implementations",
                "Selection algorithms (k largest elements)",
                "Operating system scheduling",
                "External sorting algorithms",
                "Real-time systems",
                "Embedded systems programming"
              ]}
              advantages={[
                "In-place sorting (O(1) space)",
                "Guaranteed O(n log n) performance",
                "Không phụ thuộc vào input distribution",
                "Không có worst-case như quicksort"
              ]}
              disadvantages={[
                "Không stable sorting",
                "Poor cache performance",
                "Chậm hơn quicksort trên average case",
                "Không adaptive với partially sorted data"
              ]}
            />
          </div>
        </div>
        <HeapSortVisualizer />
      </div>
    </div>
  );
}
