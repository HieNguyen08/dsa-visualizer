import { AVLTreeVisualizer } from "@/components/visualizers/avl-tree-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function AvlTreePage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cây AVL</h1>
            <p className="text-muted-foreground mb-6">
              Cây AVL là một Cây Tìm Kiếm Nhị Phân tự cân bằng (BST) trong đó chênh lệch chiều cao giữa cây con trái và phải
              (hệ số cân bằng) không thể lớn hơn một cho tất cả các nút. Tính chất này đảm bảo cây luôn cân bằng,
              cung cấp độ phức tạp thời gian O(log n) cho các thao tác tìm kiếm, chèn và xóa.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Cây AVL"
              description="Cây AVL là cây tìm kiếm nhị phân tự cân bằng, được đặt tên theo hai nhà toán học Adelson-Velsky và Landis."
              timeComplexity={{
                best: "O(log n)",
                average: "O(log n)", 
                worst: "O(log n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Hệ số cân bằng của mọi nút phải là -1, 0, hoặc 1",
                "Tự động cân bằng lại sau mỗi thao tác chèn/xóa",
                "Sử dụng các phép xoay để duy trì cân bằng",
                "Duy trì tính chất của BST trong suốt quá trình"
              ]}
              keySteps={[
                "Thực hiện chèn/xóa như BST thông thường",
                "Tính toán hệ số cân bằng cho mỗi nút",
                "Phát hiện mất cân bằng (|balance factor| > 1)",
                "Xác định loại mất cân bằng (LL, RR, LR, RL)",
                "Thực hiện phép xoay phù hợp để cân bằng lại"
              ]}
              applications={[
                "Cơ sở dữ liệu với nhiều truy vấn",
                "Hệ thống file cần truy cập nhanh",
                "Từ điển và bảng ký hiệu",
                "Ứng dụng real-time cần hiệu suất ổn định",
                "Thuật toán sắp xếp nâng cao",
                "Cấu trúc dữ liệu trong compiler",
                "Game engines",
                "Memory management"
              ]}
              advantages={[
                "Đảm bảo O(log n) cho mọi thao tác",
                "Hiệu suất ổn định và có thể dự đoán",
                "Tự động duy trì cân bằng",
                "Phù hợp với ứng dụng real-time"
              ]}
              disadvantages={[
                "Phức tạp hơn BST thông thường",
                "Chi phí bổ sung cho việc cân bằng",
                "Cần lưu trữ thêm thông tin về độ cao",
                "Thao tác chèn/xóa có thể chậm hơn do phép xoay"
              ]}
            />
          </div>
        </div>
        <AVLTreeVisualizer />
      </div>
    </div>
  );
}
