import { BinarySearchTreeVisualizer } from "@/components/visualizers/binary-search-tree-visualizer";
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function BinaryTreePage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cây Tìm Kiếm Nhị Phân</h1>
            <p className="text-muted-foreground mb-6">
              Cây Tìm Kiếm Nhị Phân (BST) là một cấu trúc dữ liệu cây nhị phân dựa trên nút với các thuộc tính:
              Cây con trái của một nút chỉ chứa các nút có giá trị nhỏ hơn giá trị của nút đó.
              Cây con phải của một nút chỉ chứa các nút có giá trị lớn hơn giá trị của nút đó.
              Cả cây con trái và phải đều phải là cây tìm kiếm nhị phân.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Cây Tìm Kiếm Nhị Phân"
              description="BST là một cấu trúc dữ liệu cây hiệu quả cho việc tìm kiếm, chèn và xóa dữ liệu được sắp xếp."
              timeComplexity={{
                best: "O(log n)",
                average: "O(log n)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Tất cả các nút trong cây con trái có giá trị nhỏ hơn nút gốc",
                "Tất cả các nút trong cây con phải có giá trị lớn hơn nút gốc",
                "Cả hai cây con đều là BST hợp lệ",
                "Không có các nút trùng lặp (tùy theo implementation)"
              ]}
              keySteps={[
                "Bắt đầu từ nút gốc",
                "So sánh giá trị tìm kiếm với nút hiện tại",
                "Nếu nhỏ hơn, đi sang cây con trái",
                "Nếu lớn hơn, đi sang cây con phải",
                "Lặp lại cho đến khi tìm thấy hoặc đến nút lá"
              ]}
              applications={[
                "Tìm kiếm nhanh trong dữ liệu đã sắp xếp",
                "Duy trì dữ liệu theo thứ tự sắp xếp",
                "Triển khai từ điển và bảng ký hiệu",
                "Hệ thống cơ sở dữ liệu",
                "Thuật toán sắp xếp cây",
                "Biểu thức toán học",
                "File system directories",
                "Compression algorithms"
              ]}
              advantages={[
                "Tìm kiếm, chèn, xóa O(log n) trung bình",
                "Duyệt in-order cho dữ liệu đã sắp xếp", 
                "Không cần thêm bộ nhớ cho việc sắp xếp",
                "Cấu trúc dữ liệu động"
              ]}
              disadvantages={[
                "Trường hợp xấu nhất O(n) khi cây không cân bằng",
                "Không có độ phức tạp thời gian tối ưu được đảm bảo",
                "Cần bộ nhớ phụ cho con trỏ"
              ]}
            />
          </div>
        </div>
        <BinarySearchTreeVisualizer />
      </div>
    </div>
  );
}
