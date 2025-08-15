import SortingVisualizer from "@/components/visualizers/sorting-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function SortingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold mb-2">Thuật Toán Sắp Xếp</h1>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Thuật toán sắp xếp là một phần cơ bản của khoa học máy tính.
              Chúng sắp xếp các mục theo một trình tự, giúp dữ liệu dễ tìm kiếm và phân tích hơn.
              Trực quan hóa quy trình của chúng bên dưới.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Thuật Toán Sắp Xếp"
              description="Các thuật toán sắp xếp tổ chức dữ liệu theo thứ tự tăng dần hoặc giảm dần để tăng hiệu quả tìm kiếm và xử lý."
              timeComplexity={{
                best: "O(n) - O(n log n)",
                average: "O(n log n) - O(n²)", 
                worst: "O(n²)"
              }}
              spaceComplexity="O(1) - O(n)"
              principles={[
                "So sánh và hoán đổi các phần tử",
                "Chia để trị (divide and conquer)",
                "Sắp xếp tại chỗ (in-place) hoặc sử dụng bộ nhớ phụ",
                "Ổn định (stable) hoặc không ổn định",
                "Thích ứng với dữ liệu đã được sắp xếp một phần"
              ]}
              keySteps={[
                "Xác định tiêu chí sắp xếp (tăng dần/giảm dần)",
                "Chọn thuật toán phù hợp dựa trên kích thước dữ liệu",
                "So sánh và sắp xếp theo quy tắc đã định",
                "Lặp lại cho đến khi hoàn thành",
                "Kiểm tra tính đúng đắn của kết quả"
              ]}
              applications={[
                "Sắp xếp dữ liệu trong cơ sở dữ liệu",
                "Tối ưu hóa thuật toán tìm kiếm",
                "Xử lý dữ liệu lớn (Big Data)",
                "Giao diện người dùng (sắp xếp danh sách)",
                "Thuật toán đồ họa và game",
                "Phân tích thống kê",
                "Nén dữ liệu",
                "Lập lịch hệ điều hành"
              ]}
              advantages={[
                "Tăng tốc độ tìm kiếm dữ liệu",
                "Cải thiện hiệu quả xử lý dữ liệu",
                "Dễ dàng phát hiện trùng lặp",
                "Hỗ trợ các thuật toán khác như tìm kiếm nhị phân"
              ]}
              disadvantages={[
                "Một số thuật toán có độ phức tạp cao",
                "Có thể tốn bộ nhớ với dữ liệu lớn",
                "Không phải lúc nào cũng cần thiết cho dữ liệu nhỏ"
              ]}
            />
          </div>
        </div>
        <SortingVisualizer />
      </div>
    </div>
  );
}
