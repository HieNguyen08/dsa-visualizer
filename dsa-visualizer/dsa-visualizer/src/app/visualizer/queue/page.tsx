import { QueueVisualizer } from "@/components/visualizers/queue-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function QueuePage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hàng Đợi (Queue)</h1>
            <p className="text-muted-foreground mb-6">
              Hàng đợi là một cấu trúc dữ liệu tuyến tính tuân theo nguyên tắc Vào Trước, Ra Trước (FIFO - First-In, First-Out).
              Các phần tử mới được thêm vào cuối hàng (enqueue), và các phần tử được lấy ra từ đầu hàng (dequeue).
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Hàng Đợi (Queue)"
              description="Queue là cấu trúc dữ liệu tuyến tính hoạt động theo nguyên tắc FIFO - phần tử đầu tiên được thêm vào sẽ là phần tử đầu tiên được lấy ra."
              timeComplexity={{
                best: "O(1)",
                average: "O(1)", 
                worst: "O(1)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "FIFO (First-In, First-Out) - Vào trước ra trước",
                "Thêm phần tử ở cuối hàng đợi (rear/back)",
                "Lấy phần tử ở đầu hàng đợi (front)",
                "Duy trì thứ tự các phần tử được thêm vào"
              ]}
              keySteps={[
                "Enqueue: Thêm phần tử mới vào cuối hàng đợi",
                "Dequeue: Lấy và xóa phần tử ở đầu hàng đợi",
                "Front: Xem phần tử đầu tiên mà không xóa",
                "isEmpty: Kiểm tra hàng đợi có rỗng không",
                "Size: Đếm số phần tử trong hàng đợi"
              ]}
              applications={[
                "Lập lịch CPU trong hệ điều hành",
                "Xử lý buffer trong I/O operations",
                "Breadth-First Search (BFS)",
                "Xử lý yêu cầu trong web server",
                "Print queue management",
                "Streaming data processing",
                "Traffic light systems",
                "Call center phone systems"
              ]}
              advantages={[
                "Thao tác O(1) cho Enqueue và Dequeue",
                "Duy trì thứ tự FIFO một cách tự nhiên",
                "Phù hợp cho xử lý tuần tự",
                "Đơn giản và trực quan"
              ]}
              disadvantages={[
                "Truy cập hạn chế chỉ ở hai đầu",
                "Không thể tìm kiếm phần tử ở giữa",
                "Có thể lãng phí bộ nhớ trong array implementation",
                "Không phù hợp cho truy cập ngẫu nhiên"
              ]}
            />
          </div>
        </div>
        <QueueVisualizer />
      </div>
    </div>
  );
}
