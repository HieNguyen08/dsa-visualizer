import PathfindingVisualizer from "../../components/visualizers/pathfinding-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";
import "./styles.css";

export default function PathfindingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold mb-4">Trực Quan Hóa Thuật Toán Tìm Đường</h1>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Khám phá các thuật toán tìm đường phổ biến như Dijkstra, A* và BFS.
              Xem cách chúng hoạt động để tìm đường đi ngắn nhất trong mê cung.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Thuật Toán Tìm Đường"
              description="Các thuật toán tìm đường được thiết kế để tìm ra con đường tối ưu giữa hai điểm trong không gian có chướng ngại vật."
              timeComplexity={{
                best: "O(V + E)",
                average: "O(V log V + E)", 
                worst: "O(V²)"
              }}
              spaceComplexity="O(V)"
              principles={[
                "Duyệt qua các nút theo chiến lược cụ thể",
                "Sử dụng hàm heuristic để ước tính khoảng cách",
                "Theo dõi chi phí từ điểm bắt đầu",
                "Duy trì danh sách các nút đã thăm và chưa thăm",
                "Tối ưu hóa dựa trên trọng số cạnh"
              ]}
              keySteps={[
                "Khởi tạo điểm bắt đầu và đích",
                "Thêm điểm bắt đầu vào danh sách mở",
                "Chọn nút có chi phí thấp nhất",
                "Khám phá các nút lân cận",
                "Cập nhật chi phí và đường đi",
                "Lặp lại cho đến khi tìm thấy đích"
              ]}
              applications={[
                "Hệ thống định vị GPS và bản đồ",
                "Game AI và robotics",
                "Mạng máy tính và routing",
                "Logistics và vận chuyển",
                "Thiết kế mạch điện tử",
                "Quy hoạch đô thị",
                "Robot navigation",
                "Thuật toán đồ họa"
              ]}
              advantages={[
                "Tìm được đường đi tối ưu",
                "Hiệu quả với các hàm heuristic tốt",
                "Có thể xử lý địa hình phức tạp",
                "Linh hoạt với nhiều loại trọng số"
              ]}
              disadvantages={[
                "Có thể chậm với không gian tìm kiếm lớn",
                "Cần bộ nhớ để lưu trữ trạng thái",
                "Hiệu quả phụ thuộc vào hàm heuristic"
              ]}
            />
          </div>
        </div>
        <PathfindingVisualizer />
      </div>
    </main>
  );
}
