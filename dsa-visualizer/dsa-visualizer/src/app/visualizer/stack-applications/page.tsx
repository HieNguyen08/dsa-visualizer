
import InfixToPostfixVisualizer from '@/components/visualizers/infix-to-postfix-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function StackApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ứng Dụng Stack</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Khám phá các ứng dụng thực tế của Stack như chuyển đổi biểu thức Infix sang Postfix,
              kiểm tra cân bằng dấu ngoặc và đánh giá biểu thức.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Ứng Dụng Stack"
              description="Stack được sử dụng trong nhiều ứng dụng thực tế như chuyển đổi biểu thức, parsing, và quản lý function calls."
              timeComplexity={{
                best: "O(n)",
                average: "O(n)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "LIFO nature phù hợp với nested structures",
                "Sử dụng cho parsing và expression evaluation",
                "Backtracking và undo operations",
                "Function call management"
              ]}
              keySteps={[
                "Infix to Postfix: Scan từ trái sang phải",
                "Operand: Output trực tiếp", 
                "Operator: So sánh precedence với stack top",
                "Parentheses: Push '(' và pop đến ')'",
                "End: Pop tất cả remaining operators"
              ]}
              applications={[
                "Compiler design - expression parsing",
                "Calculator applications",
                "Undo/Redo functionality",
                "Function call stack management",
                "Syntax checking và bracket matching",
                "Postfix expression evaluation",
                "Backtracking algorithms",
                "Memory management"
              ]}
              advantages={[
                "Efficient O(n) conversion",
                "Eliminates need for parentheses trong postfix",
                "Simplifies expression evaluation",
                "Natural fit cho recursive problems"
              ]}
              disadvantages={[
                "Requires understanding of operator precedence",
                "Additional space for stack",
                "Not human-readable (postfix)",
                "Single pass limitation"
              ]}
            />
          </div>
        </div>
        <InfixToPostfixVisualizer />
      </div>
    </div>
  );
}
