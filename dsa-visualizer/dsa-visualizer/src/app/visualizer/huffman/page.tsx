
import { HuffmanCodingVisualizer } from '@/components/visualizers/huffman-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function HuffmanPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mã Hóa Huffman</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Mã hóa Huffman là một thuật toán nén dữ liệu không tổn hao sử dụng mã có độ dài thay đổi
              để biểu diễn các ký tự. Ký tự xuất hiện thường xuyên sẽ có mã ngắn hơn.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Mã Hóa Huffman"
              description="Thuật toán nén dữ liệu optimal sử dụng cây nhị phân để tạo ra mã có độ dài thay đổi dựa trên tần số xuất hiện của ký tự."
              timeComplexity={{
                best: "O(n log n)",
                average: "O(n log n)", 
                worst: "O(n log n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Ký tự có tần số cao được mã hóa bằng bit ít hơn",
                "Sử dụng cây nhị phân để tạo mã prefix-free",
                "Thuật toán tham lam (greedy algorithm)",
                "Tối ưu theo nghĩa minimize weighted path length"
              ]}
              keySteps={[
                "Đếm tần số xuất hiện của mỗi ký tự",
                "Tạo min-heap với các nút lá",
                "Lặp lại: lấy 2 nút có tần số nhỏ nhất",
                "Tạo nút cha mới với tổng tần số",
                "Thêm nút cha vào heap",
                "Lặp đến khi chỉ còn 1 nút (root)"
              ]}
              applications={[
                "Nén file (ZIP, GZIP, PNG)",
                "Truyền dữ liệu qua mạng",
                "Lưu trữ dữ liệu hiệu quả",
                "JPEG image compression",
                "MP3 audio compression",
                "Fax machine encoding",
                "Data compression trong databases",
                "Network protocols"
              ]}
              advantages={[
                "Thuật toán optimal cho prefix-free codes",
                "Tỷ lệ nén cao với dữ liệu có phân bố không đều",
                "Không mất dữ liệu (lossless)",
                "Dễ hiểu và implement"
              ]}
              disadvantages={[
                "Cần biết tần số trước khi encode",
                "Không hiệu quả với dữ liệu có phân bố đều",
                "Overhead để lưu trữ cây Huffman",
                "Không phù hợp cho streaming data"
              ]}
            />
          </div>
        </div>
        <HuffmanCodingVisualizer />
      </div>
    </div>
  );
}
