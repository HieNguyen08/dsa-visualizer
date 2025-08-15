import StringMatchingVisualizer from '@/components/visualizers/string-matching-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function StringMatchingPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thuật Toán Tìm Kiếm Chuỗi</h1>
            <p className="text-muted-foreground mb-6">
              Khám phá các thuật toán tìm kiếm pattern hiệu quả như KMP, Boyer-Moore và Rabin-Karp
              để tìm kiếm chuỗi con trong văn bản lớn.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Thuật Toán Tìm Kiếm Chuỗi"
              description="Các thuật toán hiệu quả để tìm kiếm pattern trong text, sử dụng preprocessing để tránh so sánh không cần thiết."
              timeComplexity={{
                best: "O(n + m)",
                average: "O(n + m)", 
                worst: "O(nm)"
              }}
              spaceComplexity="O(m)"
              principles={[
                "Preprocessing pattern để tìm thông tin hữu ích",
                "Skip characters khi mismatch xảy ra",
                "Sử dụng failure function hoặc shift table",
                "Optimal alignment để giảm comparisons"
              ]}
              keySteps={[
                "Preprocess pattern (build failure function/shift table)",
                "Align pattern với text từ left to right",
                "So sánh characters từ pattern với text",
                "Skip theo thuật toán khi mismatch",
                "Tiếp tục cho đến khi tìm thấy hoặc hết text"
              ]}
              applications={[
                "Text editors (Find & Replace)",
                "Search engines và indexing",
                "DNA sequence analysis",
                "Plagiarism detection",
                "Network intrusion detection",
                "Compiler design (lexical analysis)",
                "Data mining và pattern recognition",
                "Log file analysis"
              ]}
              advantages={[
                "Linear time complexity O(n + m)",
                "Không cần backtrack trong text",
                "Hiệu quả với large text và small pattern",
                "Optimal cho repeated searches"
              ]}
              disadvantages={[
                "Cần preprocessing time và space",
                "Phức tạp để implement đúng",
                "Không hiệu quả cho very short patterns"
              ]}
            />
          </div>
        </div>
        <StringMatchingVisualizer />
      </div>
    </div>
  );
}
