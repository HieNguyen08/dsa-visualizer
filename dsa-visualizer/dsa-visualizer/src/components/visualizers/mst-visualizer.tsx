"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, Shuffle, RotateCcw, Network, Info, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// --- Types ---
interface Edge {
  from: number;
  to: number;
  weight: number;
  id: string;
}

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface MSTStep {
  step: number;
  edge: Edge;
  action: 'add' | 'reject' | 'consider';
  description: string;
  currentMST: Edge[];
  totalWeight: number;
}

// --- Constants ---
const ALGORITHMS = {
  kruskal: { name: "Kruskal's Algorithm", description: "Thuật toán tham lam sắp xếp các cạnh theo trọng số tăng dần" },
  prim: { name: "Prim's Algorithm", description: "Thuật toán tham lam bắt đầu từ một đỉnh và mở rộng cây" }
};

const NODE_RADIUS = 25;
const EDGE_COLOR = '#94a3b8';
const MST_EDGE_COLOR = '#10b981';
const CONSIDERING_EDGE_COLOR = '#f59e0b';
const REJECTED_EDGE_COLOR = '#ef4444';

// --- Algorithm Information ---
const ALGORITHM_INFO = {
  kruskal: {
    title: "Thuật toán Kruskal",
    principle: "Kruskal là thuật toán tham lam để tìm cây khung nhỏ nhất (MST) bằng cách:",
    steps: [
      "1. Sắp xếp tất cả các cạnh theo trọng số tăng dần",
      "2. Khởi tạo mỗi đỉnh như một thành phần riêng biệt",
      "3. Duyệt qua từng cạnh theo thứ tự đã sắp xếp:",
      "   - Nếu cạnh không tạo chu trình, thêm vào MST",
      "   - Nếu tạo chu trình, bỏ qua cạnh này",
      "4. Lặp lại cho đến khi có n-1 cạnh trong MST"
    ],
    complexity: "Độ phức tạp: O(E log E) với E là số cạnh",
    applications: "Ứng dụng: Thiết kế mạng, cây quyết định, phân cụm dữ liệu"
  },
  prim: {
    title: "Thuật toán Prim",
    principle: "Prim là thuật toán tham lam để tìm cây khung nhỏ nhất bằng cách:",
    steps: [
      "1. Bắt đầu từ một đỉnh bất kỳ",
      "2. Khởi tạo MST chỉ chứa đỉnh này",
      "3. Lặp lại:",
      "   - Tìm cạnh có trọng số nhỏ nhất nối MST với đỉnh ngoài",
      "   - Thêm cạnh và đỉnh mới vào MST",
      "4. Dừng khi MST chứa tất cả các đỉnh"
    ],
    complexity: "Độ phức tạp: O(E log V) với heap, O(V²) với mảng",
    applications: "Ứng dụng: Mạng viễn thông, đường ống, mạng điện"
  }
};

const MSTVisualizer = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [algorithm, setAlgorithm] = useState('kruskal');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [mstSteps, setMstSteps] = useState<MSTStep[]>([]);
  const [currentMST, setCurrentMST] = useState<Edge[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [nodeCount, setNodeCount] = useState(6);

  const speedRef = useRef(speed);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Union-Find for Kruskal's algorithm
  class UnionFind {
    parent: number[];
    rank: number[];

    constructor(n: number) {
      this.parent = Array.from({ length: n }, (_, i) => i);
      this.rank = Array(n).fill(0);
    }

    find(x: number): number {
      if (this.parent[x] !== x) {
        this.parent[x] = this.find(this.parent[x]);
      }
      return this.parent[x];
    }

    union(x: number, y: number): boolean {
      const rootX = this.find(x);
      const rootY = this.find(y);
      
      if (rootX === rootY) return false;

      if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
      return true;
    }
  }

  // Kruskal's Algorithm
  const kruskalMST = (edges: Edge[], nodeCount: number): MSTStep[] => {
    const steps: MSTStep[] = [];
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(nodeCount);
    const mst: Edge[] = [];
    let totalWeight = 0;
    let stepCount = 0;

    for (const edge of sortedEdges) {
      stepCount++;
      
      // Consider the edge
      steps.push({
        step: stepCount,
        edge,
        action: 'consider',
        description: `Xét cạnh (${edge.from}, ${edge.to}) với trọng số ${edge.weight}`,
        currentMST: [...mst],
        totalWeight
      });

      if (uf.union(edge.from, edge.to)) {
        mst.push(edge);
        totalWeight += edge.weight;
        stepCount++;
        
        steps.push({
          step: stepCount,
          edge,
          action: 'add',
          description: `Thêm cạnh (${edge.from}, ${edge.to}) vào MST. Tổng trọng số: ${totalWeight}`,
          currentMST: [...mst],
          totalWeight
        });
      } else {
        stepCount++;
        steps.push({
          step: stepCount,
          edge,
          action: 'reject',
          description: `Từ chối cạnh (${edge.from}, ${edge.to}) vì tạo chu trình`,
          currentMST: [...mst],
          totalWeight
        });
      }
    }

    return steps;
  };

  // Prim's Algorithm
  const primMST = (edges: Edge[], nodeCount: number): MSTStep[] => {
    const steps: MSTStep[] = [];
    const mst: Edge[] = [];
    const visited = Array(nodeCount).fill(false);
    let totalWeight = 0;
    let stepCount = 0;

    // Start from node 0
    visited[0] = true;

    while (mst.length < nodeCount - 1) {
      let minEdge: Edge | null = null;
      
      // Find minimum weight edge connecting visited to unvisited nodes
      for (const edge of edges) {
        const fromVisited = visited[edge.from];
        const toVisited = visited[edge.to];
        
        if (fromVisited !== toVisited) { // One visited, one not
          if (!minEdge || edge.weight < minEdge.weight) {
            minEdge = edge;
          }
        }
      }

      if (minEdge) {
        stepCount++;
        steps.push({
          step: stepCount,
          edge: minEdge,
          action: 'consider',
          description: `Xét cạnh nhỏ nhất (${minEdge.from}, ${minEdge.to}) với trọng số ${minEdge.weight}`,
          currentMST: [...mst],
          totalWeight
        });

        mst.push(minEdge);
        totalWeight += minEdge.weight;
        visited[minEdge.from] = true;
        visited[minEdge.to] = true;

        stepCount++;
        steps.push({
          step: stepCount,
          edge: minEdge,
          action: 'add',
          description: `Thêm cạnh (${minEdge.from}, ${minEdge.to}) vào MST. Tổng trọng số: ${totalWeight}`,
          currentMST: [...mst],
          totalWeight
        });
      }
    }

    return steps;
  };

  const generateRandomGraph = useCallback(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Generate nodes in a circular layout
    const centerX = 300;
    const centerY = 200;
    const radius = 150;
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (2 * Math.PI * i) / nodeCount;
      newNodes.push({
        id: i,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        label: `${i}`
      });
    }

    // Generate edges (not too dense to keep visualization clear)
    const edgeCount = Math.min(nodeCount * 2, (nodeCount * (nodeCount - 1)) / 2);
    const addedEdges = new Set<string>();
    
    while (newEdges.length < edgeCount) {
      const from = Math.floor(Math.random() * nodeCount);
      const to = Math.floor(Math.random() * nodeCount);
      
      if (from !== to) {
        const edgeKey = from < to ? `${from}-${to}` : `${to}-${from}`;
        if (!addedEdges.has(edgeKey)) {
          addedEdges.add(edgeKey);
          newEdges.push({
            from: Math.min(from, to),
            to: Math.max(from, to),
            weight: Math.floor(Math.random() * 50) + 1,
            id: edgeKey
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setCurrentStep(-1);
    setMstSteps([]);
    setCurrentMST([]);
    setTotalWeight(0);
  }, [nodeCount]);

  useEffect(() => {
    generateRandomGraph();
  }, [generateRandomGraph]);

  const startMST = () => {
    if (isAnimating) {
      stopMST();
      return;
    }

    let steps: MSTStep[];
    if (algorithm === 'kruskal') {
      steps = kruskalMST(edges, nodeCount);
    } else {
      steps = primMST(edges, nodeCount);
    }

    setMstSteps(steps);
    setCurrentStep(-1);
    setCurrentMST([]);
    setTotalWeight(0);
    setIsAnimating(true);
    
    animateMST(steps);
  };

  const stopMST = () => {
    setIsAnimating(false);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const animateMST = (steps: MSTStep[]) => {
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex >= steps.length) {
        setIsAnimating(false);
        return;
      }

      const step = steps[stepIndex];
      setCurrentStep(stepIndex);
      setCurrentMST(step.currentMST);
      setTotalWeight(step.totalWeight);

      stepIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 200);
    };

    animate();
  };

  const resetMST = () => {
    stopMST();
    setCurrentStep(-1);
    setCurrentMST([]);
    setTotalWeight(0);
  };

  const getEdgeColor = (edge: Edge) => {
    if (currentStep >= 0 && mstSteps[currentStep]) {
      const currentStepData = mstSteps[currentStep];
      if (currentStepData.edge.id === edge.id) {
        if (currentStepData.action === 'consider') return CONSIDERING_EDGE_COLOR;
        if (currentStepData.action === 'reject') return REJECTED_EDGE_COLOR;
      }
    }
    
    const isInMST = currentMST.some(mstEdge => mstEdge.id === edge.id);
    return isInMST ? MST_EDGE_COLOR : EDGE_COLOR;
  };

  const AlgorithmInfo = ({ algorithmKey }: { algorithmKey: string }) => {
    const info = ALGORITHM_INFO[algorithmKey as keyof typeof ALGORITHM_INFO];
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Nguyên lý
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {info.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Nguyên lý hoạt động:</h4>
              <p className="text-sm text-gray-700 mb-2">{info.principle}</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {info.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Phân tích:</h4>
              <p className="text-sm text-gray-700">{info.complexity}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ứng dụng thực tế:</h4>
              <p className="text-sm text-gray-700">{info.applications}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-6 h-6" />
            Minimum Spanning Tree Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isAnimating}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, alg]) => (
                    <SelectItem key={key} value={key}>
                      {alg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nodes: {nodeCount}</label>
              <Slider
                value={[nodeCount]}
                onValueChange={(value) => setNodeCount(value[0])}
                min={4}
                max={8}
                step={1}
                className="w-32"
                disabled={isAnimating}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Speed: {speed}</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-32"
              />
            </div>

            <div className="flex gap-2 items-end">
              <Button onClick={generateRandomGraph} disabled={isAnimating} variant="outline">
                <Shuffle className="w-4 h-4 mr-2" />
                New Graph
              </Button>

              <AlgorithmInfo algorithmKey={algorithm} />

              <Button
                onClick={startMST}
                className={isAnimating ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isAnimating ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start MST
                  </>
                )}
              </Button>

              <Button onClick={resetMST} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Visualization */}
          <Tabs defaultValue="graph" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="graph">Graph Visualization</TabsTrigger>
              <TabsTrigger value="steps">Step-by-Step</TabsTrigger>
            </TabsList>

            <TabsContent value="graph" className="mt-6">
              <div className="bg-white rounded-lg border p-4" style={{ height: '500px' }}>
                <svg width="100%" height="100%" viewBox="0 0 600 400">
                  {/* Edges */}
                  {edges.map((edge) => {
                    const fromNode = nodes[edge.from];
                    const toNode = nodes[edge.to];
                    const color = getEdgeColor(edge);
                    const strokeWidth = currentMST.some(mstEdge => mstEdge.id === edge.id) ? 3 : 1;
                    
                    return (
                      <g key={edge.id}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                        {/* Edge weight */}
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2}
                          textAnchor="middle"
                          className="text-sm font-medium fill-gray-800"
                          style={{ fontSize: '12px' }}
                        >
                          {edge.weight}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Nodes */}
                  {nodes.map((node) => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_RADIUS}
                        fill="#3b82f6"
                        stroke="#1e40af"
                        strokeWidth="2"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        className="text-sm font-bold fill-white"
                      >
                        {node.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Status */}
              {currentStep >= 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Current Status</h4>
                      <p className="text-sm text-gray-700">
                        Step {currentStep + 1} of {mstSteps.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Total Weight: {totalWeight}</p>
                      <p className="text-sm text-gray-600">MST Edges: {currentMST.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="steps" className="mt-6">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Algorithm Steps</h3>
                  <p className="text-sm text-gray-600">
                    {ALGORITHMS[algorithm as keyof typeof ALGORITHMS].description}
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {mstSteps.slice(0, currentStep + 1).map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 border-b ${
                        index === currentStep ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">Step {step.step}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          step.action === 'add' ? 'bg-green-100 text-green-800' :
                          step.action === 'reject' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.action === 'add' ? 'Thêm' : 
                           step.action === 'reject' ? 'Từ chối' : 'Xem xét'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  ))}
                  
                  {mstSteps.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click &quot;Start MST&quot; to see algorithm steps</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MSTVisualizer;
