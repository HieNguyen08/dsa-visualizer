import EnhancedMSTVisualizer from '@/components/visualizers/enhanced-mst-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function MSTPage() {
  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cây Khung Tối Thiểu (MST)</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Cây Khung Tối Thiểu là cây con của đồ thị kết nối tất cả các đỉnh với tổng trọng số các cạnh nhỏ nhất.
              Khám phá thuật toán Kruskal và Prim với Union-Find.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Cây Khung Tối Thiểu (MST)"
              description="Tìm cây con có tổng trọng số nhỏ nhất kết nối tất cả đỉnh trong đồ thị có trọng số."
              timeComplexity={{
                best: "O(E log V)",
                average: "O(E log V)", 
                worst: "O(E log V)"
              }}
              spaceComplexity="O(V)"
              principles={[
                "Greedy approach: chọn cạnh nhỏ nhất không tạo chu trình",
                "Kruskal: sort edges, Union-Find để check cycles",
                "Prim: grow tree từ một đỉnh",
                "Cut property và cycle property"
              ]}
              keySteps={[
                "Kruskal: Sort tất cả edges theo weight",
                "Sử dụng Union-Find để check cycle",
                "Thêm edge nếu không tạo cycle",
                "Prim: Bắt đầu từ một đỉnh arbitrary",
                "Chọn minimum weight edge từ tree đến non-tree vertex"
              ]}
              applications={[
                "Network design (telecommunications, transportation)",
                "Circuit design và VLSI routing",
                "Cluster analysis trong data mining",
                "Image segmentation",
                "Approximation algorithms cho TSP",
                "Social network analysis",
                "Phylogenetic tree construction",
                "Computer graphics (mesh generation)"
              ]}
              advantages={[
                "Guaranteed optimal solution",
                "Efficient với sparse graphs",
                "Multiple algorithms available (Kruskal, Prim)",
                "Applicable cho real-world optimization"
              ]}
              disadvantages={[
                "Chỉ áp dụng cho connected graphs",
                "Cần đồ thị có trọng số",
                "Kruskal cần sort edges O(E log E)"
              ]}
            />
          </div>
        </div>
        <EnhancedMSTVisualizer />
      </div>
    </div>
  );
}
