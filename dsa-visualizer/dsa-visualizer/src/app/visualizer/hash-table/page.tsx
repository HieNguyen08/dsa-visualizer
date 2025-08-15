import HashTableVisualizer from '@/components/visualizers/hash-table-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function HashTablePage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bảng Băm (Hash Table)</h1>
            <p className="text-muted-foreground mb-6">
              Bảng Băm là một cấu trúc dữ liệu cho phép lưu trữ và truy xuất dữ liệu một cách hiệu quả
              thông qua việc sử dụng hàm băm để ánh xạ khóa tới vị trí trong bảng.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Bảng Băm (Hash Table)"
              description="Hash Table sử dụng hàm băm để ánh xạ khóa thành chỉ số trong mảng, cung cấp thời gian truy cập trung bình O(1)."
              timeComplexity={{
                best: "O(1)",
                average: "O(1)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Sử dụng hàm băm để ánh xạ khóa thành chỉ số",
                "Xử lý xung đột bằng chaining hoặc open addressing",
                "Load factor ảnh hưởng đến hiệu suất",
                "Rehashing khi bảng quá đầy"
              ]}
              keySteps={[
                "Tính hash value từ khóa",
                "Ánh xạ hash value thành chỉ số trong bảng",
                "Xử lý xung đột nếu có",
                "Chèn/tìm kiếm/xóa phần tử",
                "Resize bảng nếu cần thiết"
              ]}
              applications={[
                "Databases và indexing",
                "Caching systems",
                "Compilers (symbol tables)",
                "Associative arrays",
                "Set implementations",
                "Password verification",
                "Blockchain và cryptography",
                "Web browsers (URL mapping)"
              ]}
              advantages={[
                "Truy cập O(1) trung bình",
                "Hiệu quả cho tìm kiếm, chèn, xóa",
                "Flexible với nhiều loại dữ liệu",
                "Phù hợp cho large datasets"
              ]}
              disadvantages={[
                "Worst case O(n) khi có nhiều xung đột",
                "Cần bộ nhớ phụ cho chaining",
                "Không duy trì thứ tự các phần tử",
                "Hiệu suất phụ thuộc vào hàm băm"
              ]}
            />
          </div>
        </div>
        <HashTableVisualizer />
      </div>
    </div>
  );
}
