
import PolynomialVisualizer from '@/components/visualizers/polynomial-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function PolynomialPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Đa Thức (Polynomial)</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Trình trực quan hóa các thao tác đa thức bao gồm cộng, trừ, nhân và đánh giá đa thức
              sử dụng các cấu trúc dữ liệu như mảng và danh sách liên kết.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Đa Thức (Polynomial)"
              description="Đa thức là biểu thức toán học gồm các biến và hệ số, có thể được biểu diễn và xử lý hiệu quả bằng các cấu trúc dữ liệu khác nhau."
              timeComplexity={{
                best: "O(n)",
                average: "O(n²)", 
                worst: "O(n²)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Biểu diễn đa thức bằng array hoặc linked list",
                "Lưu trữ hệ số và số mũ tương ứng",
                "Thao tác trên các đa thức sparse và dense",
                "Tối ưu hóa bộ nhớ cho đa thức thưa"
              ]}
              keySteps={[
                "Biểu diễn đa thức (array/linked list)",
                "Addition: Cộng các hệ số cùng số mũ",
                "Subtraction: Trừ các hệ số cùng số mũ",
                "Multiplication: Nhân từng cặp term và cộng kết quả",
                "Evaluation: Tính giá trị tại điểm cho trước"
              ]}
              applications={[
                "Computer graphics và animation",
                "Numerical analysis và scientific computing",
                "Signal processing", 
                "Computer algebra systems",
                "Finite element analysis",
                "Game physics simulation",
                "Economic modeling",
                "Machine learning (polynomial features)"
              ]}
              advantages={[
                "Biểu diễn chính xác các hàm toán học",
                "Hiệu quả cho đa thức thưa (sparse)",
                "Dễ implement các thao tác cơ bản",
                "Flexible representation"
              ]}
              disadvantages={[
                "Nhân đa thức có độ phức tạp cao",
                "Memory overhead cho đa thức dense",
                "Precision issues với coefficients lớn",
                "Không efficient cho high-degree polynomials"
              ]}
            />
          </div>
        </div>
        <PolynomialVisualizer />
      </div>
    </div>
  );
}
