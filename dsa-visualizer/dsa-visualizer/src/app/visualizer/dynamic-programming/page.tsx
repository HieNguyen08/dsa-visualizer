import EnhancedDynamicProgrammingVisualizer from '@/components/visualizers/enhanced-dynamic-programming-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function DynamicProgrammingPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quy Hoạch Động</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Quy hoạch động là phương pháp giải thuật tối ưu hóa bằng cách chia bài toán thành các bài toán con,
              lưu trữ kết quả và sử dụng lại để tránh tính toán trùng lặp.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Quy Hoạch Động"
              description="Kỹ thuật tối ưu hóa kết hợp divide-and-conquer với memoization để giải quyết các bài toán có cấu trúc con tối ưu."
              timeComplexity={{
                best: "O(n)",
                average: "O(n²) - O(n³)", 
                worst: "O(2^n) → O(n²)"
              }}
              spaceComplexity="O(n) - O(n²)"
              principles={[
                "Optimal substructure property",
                "Overlapping subproblems",
                "Memoization hoặc tabulation",
                "Bottom-up hoặc top-down approach"
              ]}
              keySteps={[
                "Xác định recursive relation",
                "Định nghĩa base cases",
                "Xác định overlapping subproblems",
                "Chọn memoization hoặc tabulation",
                "Implement solution với DP table"
              ]}
              applications={[
                "Longest Common Subsequence (LCS)",
                "Knapsack Problem",
                "Edit Distance",
                "Fibonacci sequence optimization",
                "Path counting problems",
                "Optimal Binary Search Trees",
                "Matrix Chain Multiplication",
                "Coin Change Problem"
              ]}
              advantages={[
                "Giảm exponential time thành polynomial",
                "Tránh redundant calculations",
                "Systemic approach cho optimization problems",
                "Có thể optimize space complexity"
              ]}
              disadvantages={[
                "Cần thêm memory cho memoization",
                "Không phù hợp với mọi recursive problems",
                "Có thể phức tạp để implement đúng"
              ]}
            />
          </div>
        </div>
        <EnhancedDynamicProgrammingVisualizer />
      </div>
    </div>
  );
}
