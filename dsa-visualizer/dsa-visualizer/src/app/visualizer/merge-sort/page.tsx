import MergeSortVisualizer from "@/components/visualizers/merge-sort-visualizer-new";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function MergeSortPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-2">Merge Sort (Sắp Xếp Trộn)</h1>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto sm:mx-0">
              Merge Sort là thuật toán chia để trị chia mảng thành các nửa,
              sắp xếp chúng riêng biệt, sau đó trộn chúng lại với nhau.
              Trực quan hóa cấu trúc cây và quá trình sắp xếp bên dưới.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Merge Sort (Sắp Xếp Trộn)"
              description="Thuật toán sắp xếp divide-and-conquer ổn định với độ phức tạp O(n log n) trong mọi trường hợp."
              timeComplexity={{
                best: "O(n log n)",
                average: "O(n log n)", 
                worst: "O(n log n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Chia mảng thành hai nửa bằng nhau",
                "Đệ quy sắp xếp từng nửa",
                "Trộn hai nửa đã sắp xếp thành một mảng",
                "Thuật toán ổn định (stable sorting)"
              ]}
              keySteps={[
                "Chia mảng thành hai nửa tại điểm giữa",
                "Đệ quy áp dụng merge sort cho nửa trái",
                "Đệ quy áp dụng merge sort cho nửa phải",
                "Trộn hai nửa đã sắp xếp",
                "Trả về mảng đã được trộn"
              ]}
              applications={[
                "External sorting cho dữ liệu lớn",
                "Stable sorting requirements",
                "Linked list sorting",
                "Inversion count problems",
                "Large dataset processing",
                "Database sorting operations",
                "Parallel processing algorithms",
                "Library implementations"
              ]}
              advantages={[
                "Độ phức tạp O(n log n) được đảm bảo",
                "Thuật toán ổn định",
                "Hiệu quả với dữ liệu lớn",
                "Có thể parallel hóa"
              ]}
              disadvantages={[
                "Cần thêm O(n) bộ nhớ",
                "Chậm hơn quicksort trên average case",
                "Không adaptive với dữ liệu gần như đã sắp xếp"
              ]}
            />
          </div>
        </div>
        <MergeSortVisualizer />
      </div>
    </div>
  );
}
