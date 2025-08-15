import { StackVisualizer } from "@/components/visualizers/stack-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function StackPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ngăn Xếp (Stack)</h1>
            <p className="text-muted-foreground mb-6">
              Ngăn xếp là một cấu trúc dữ liệu tuyến tính tuân theo nguyên tắc Vào Sau, Ra Trước (LIFO - Last-In, First-Out). 
              Hãy nghĩ về nó như một chồng đĩa; bạn chỉ có thể thêm đĩa mới lên đầu hoặc lấy đĩa trên cùng ra.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Ngăn Xếp (Stack)"
              description="Stack là cấu trúc dữ liệu tuyến tính hoạt động theo nguyên tắc LIFO - phần tử cuối cùng được thêm vào sẽ là phần tử đầu tiên được lấy ra."
              timeComplexity={{
                best: "O(1)",
                average: "O(1)", 
                worst: "O(1)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "LIFO (Last-In, First-Out) - Vào sau ra trước",
                "Chỉ có thể truy cập phần tử ở đỉnh ngăn xếp",
                "Các thao tác chính: Push (đẩy vào) và Pop (lấy ra)",
                "Kiểm tra trạng thái rỗng trước khi Pop"
              ]}
              keySteps={[
                "Push: Thêm phần tử mới lên đỉnh ngăn xếp",
                "Pop: Lấy và xóa phần tử ở đỉnh ngăn xếp",
                "Peek/Top: Xem phần tử ở đỉnh mà không xóa",
                "isEmpty: Kiểm tra ngăn xếp có rỗng không",
                "Size: Đếm số phần tử trong ngăn xếp"
              ]}
              applications={[
                "Quản lý lời gọi hàm trong chương trình",
                "Undo/Redo trong các ứng dụng",
                "Kiểm tra cân bằng dấu ngoặc",
                "Chuyển đổi biểu thức trung tố sang hậu tố",
                "Thuật toán duyệt cây (DFS)",
                "Quản lý bộ nhớ trong compiler",
                "Navigation history trong browser",
                "Expression evaluation"
              ]}
              advantages={[
                "Thao tác O(1) cho Push và Pop",
                "Đơn giản và dễ triển khai",
                "Sử dụng bộ nhớ hiệu quả",
                "Hoàn hảo cho các thuật toán đệ quy"
              ]}
              disadvantages={[
                "Truy cập hạn chế chỉ ở đỉnh",
                "Không thể tìm kiếm phần tử ở giữa",
                "Có thể xảy ra stack overflow",
                "Không phù hợp cho tìm kiếm ngẫu nhiên"
              ]}
            />
          </div>
        </div>
        <StackVisualizer />
      </div>
    </div>
  );
}
