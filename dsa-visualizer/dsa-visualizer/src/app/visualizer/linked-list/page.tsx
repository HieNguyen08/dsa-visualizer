import { LinkedListVisualizer } from "@/components/visualizers/linked-list-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function LinkedListPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Danh Sách Liên Kết</h1>
            <p className="text-muted-foreground mb-6">
              Danh sách liên kết là một cấu trúc dữ liệu tuyến tính trong đó các phần tử không được lưu trữ tại các vị trí bộ nhớ liền kề.
              Các phần tử được liên kết bằng con trỏ. Mỗi phần tử là một đối tượng riêng biệt, được gọi là nút.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Danh Sách Liên Kết"
              description="Linked List là cấu trúc dữ liệu tuyến tính động trong đó các phần tử được lưu trữ trong các nút và liên kết với nhau thông qua con trỏ."
              timeComplexity={{
                best: "O(1) - O(n)",
                average: "O(n)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Các nút được liên kết thông qua con trỏ",
                "Kích thước động, có thể thay đổi trong runtime",
                "Truy cập tuần tự từ nút đầu (head)",
                "Mỗi nút chứa dữ liệu và con trỏ đến nút tiếp theo"
              ]}
              keySteps={[
                "Tạo nút mới với dữ liệu",
                "Thiết lập con trỏ liên kết",
                "Cập nhật head pointer nếu cần",
                "Duyệt từ head đến vị trí mong muốn",
                "Thực hiện thao tác (insert/delete/search)"
              ]}
              applications={[
                "Implementation của Stack và Queue",
                "Undo functionality trong applications",
                "Music playlist (next/previous song)",
                "Image viewer (next/previous image)",
                "Polynomial manipulation",
                "Memory management trong OS",
                "Hash table collision handling",
                "Graph representation"
              ]}
              advantages={[
                "Kích thước động, không cần khai báo trước",
                "Insertion/deletion hiệu quả ở đầu list O(1)",
                "Sử dụng bộ nhớ hiệu quả (không lãng phí)",
                "Dễ dàng implement các cấu trúc dữ liệu khác"
              ]}
              disadvantages={[
                "Truy cập ngẫu nhiên O(n) (không như array O(1))",
                "Bộ nhớ phụ cho con trỏ",
                "Không cache-friendly do bộ nhớ không liên tục",
                "Không thể sử dụng binary search"
              ]}
            />
          </div>
        </div>
        <LinkedListVisualizer />
      </div>
    </div>
  );
}
