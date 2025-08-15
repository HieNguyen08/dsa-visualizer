"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Play, Pause, Square, RotateCcw, Link2 } from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface DSUNode {
  id: number;
  parent: number;
  rank: number;
  isHighlighted: boolean;
  isRoot: boolean;
  x: number;
  y: number;
}

interface DSUStep {
  nodes: DSUNode[];
  description: string;
  operation: string;
  operationParams?: number[];
  sets: number[][];
}

export default function UnionFindPage() {
  const [nodes, setNodes] = useState<DSUNode[]>([]);
  const [nodeCount, setNodeCount] = useState([8]);
  const [steps, setSteps] = useState<DSUStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unionX, setUnionX] = useState('');
  const [unionY, setUnionY] = useState('');
  const [findNode, setFindNode] = useState('');
  const [stats, setStats] = useState({ totalSets: 0, operations: 0 });

  // Initialize Union-Find structure
  const initializeDSU = () => {
    const count = nodeCount[0];
    const newNodes: DSUNode[] = [];
    
    for (let i = 0; i < count; i++) {
      newNodes.push({
        id: i,
        parent: i,
        rank: 0,
        isHighlighted: false,
        isRoot: true,
        x: 100 + (i % 4) * 150,
        y: 100 + Math.floor(i / 4) * 100
      });
    }
    
    setNodes(newNodes);
    const initialStep: DSUStep = {
      nodes: [...newNodes],
      description: `Initialized ${count} disjoint sets. Each element is its own parent.`,
      operation: 'init',
      sets: newNodes.map(node => [node.id])
    };
    
    setSteps([initialStep]);
    setCurrentStep(0);
    setStats({ totalSets: count, operations: 0 });
  };

  // Find operation with path compression
  const find = (nodes: DSUNode[], x: number): { parent: number; path: number[]; steps: DSUStep[] } => {
    const steps: DSUStep[] = [];
    const path: number[] = [];
    let current = x;
    
    // Find root and collect path
    while (nodes[current].parent !== current) {
      path.push(current);
      current = nodes[current].parent;
      
      // Highlight current node
      const nodesCopy = nodes.map(node => ({ ...node, isHighlighted: false }));
      nodesCopy[current].isHighlighted = true;
      
      steps.push({
        nodes: nodesCopy,
        description: `Following parent pointer from ${path[path.length - 1]} to ${current}`,
        operation: 'find',
        operationParams: [x],
        sets: getSets(nodesCopy)
      });
    }
    
    path.push(current); // Add root
    
    // Path compression - make all nodes in path point directly to root
    if (path.length > 1) {
      const root = current;
      for (let i = 0; i < path.length - 1; i++) {
        nodes[path[i]].parent = root;
        nodes[path[i]].isRoot = false;
      }
      
      nodes[root].isRoot = true;
      
      const compressedNodes = nodes.map(node => ({ ...node, isHighlighted: false }));
      path.forEach(nodeId => {
        if (nodeId !== root) compressedNodes[nodeId].isHighlighted = true;
      });
      
      steps.push({
        nodes: compressedNodes,
        description: `Path compression: All nodes in path now point directly to root ${root}`,
        operation: 'compress',
        operationParams: [x],
        sets: getSets(compressedNodes)
      });
    }
    
    return { parent: current, path, steps };
  };

  // Union operation with union by rank
  const union = (nodes: DSUNode[], x: number, y: number): DSUStep[] => {
    const steps: DSUStep[] = [];
    
    // Find roots of both elements
    const findXResult = find([...nodes], x);
    const findYResult = find([...nodes], y);
    
    steps.push(...findXResult.steps);
    steps.push(...findYResult.steps);
    
    const rootX = findXResult.parent;
    const rootY = findYResult.parent;
    
    if (rootX === rootY) {
      const sameSetNodes = nodes.map(node => ({ ...node, isHighlighted: false }));
      sameSetNodes[x].isHighlighted = true;
      sameSetNodes[y].isHighlighted = true;
      
      steps.push({
        nodes: sameSetNodes,
        description: `Elements ${x} and ${y} are already in the same set (root: ${rootX})`,
        operation: 'same-set',
        operationParams: [x, y],
        sets: getSets(sameSetNodes)
      });
      
      return steps;
    }
    
    // Union by rank
    let newParent: number, newChild: number;
    
    if (nodes[rootX].rank < nodes[rootY].rank) {
      newParent = rootY;
      newChild = rootX;
    } else if (nodes[rootX].rank > nodes[rootY].rank) {
      newParent = rootX;
      newChild = rootY;
    } else {
      // Same rank, choose arbitrarily and increment rank
      newParent = rootX;
      newChild = rootY;
      nodes[rootX].rank++;
    }
    
    // Perform union
    nodes[newChild].parent = newParent;
    nodes[newChild].isRoot = false;
    nodes[newParent].isRoot = true;
    
    // Highlight the union
    const unionNodes = nodes.map(node => ({ ...node, isHighlighted: false }));
    unionNodes[x].isHighlighted = true;
    unionNodes[y].isHighlighted = true;
    unionNodes[newParent].isHighlighted = true;
    unionNodes[newChild].isHighlighted = true;
    
    steps.push({
      nodes: unionNodes,
      description: `Union by rank: Made ${newParent} parent of ${newChild}. Rank of ${newParent}: ${nodes[newParent].rank}`,
      operation: 'union',
      operationParams: [x, y],
      sets: getSets(unionNodes)
    });
    
    return steps;
  };

  // Get all disjoint sets
  const getSets = (nodes: DSUNode[]): number[][] => {
    const sets: { [key: number]: number[] } = {};
    
    nodes.forEach(node => {
      const root = findRoot(nodes, node.id);
      if (!sets[root]) sets[root] = [];
      sets[root].push(node.id);
    });
    
    return Object.values(sets);
  };

  // Helper function to find root without path compression (for display)
  const findRoot = (nodes: DSUNode[], x: number): number => {
    let current = x;
    while (nodes[current].parent !== current) {
      current = nodes[current].parent;
    }
    return current;
  };

  // Perform union operation
  const performUnion = () => {
    const x = parseInt(unionX);
    const y = parseInt(unionY);
    
    if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x >= nodeCount[0] || y >= nodeCount[0]) {
      alert('Please enter valid node indices');
      return;
    }
    
    const currentNodes = [...(steps[currentStep]?.nodes || nodes)];
    const unionSteps = union(currentNodes, x, y);
    
    setSteps(prev => [...prev, ...unionSteps]);
    setStats(prev => ({ 
      ...prev, 
      operations: prev.operations + 1,
      totalSets: getSets(unionSteps[unionSteps.length - 1].nodes).length
    }));
    
    setUnionX('');
    setUnionY('');
  };

  // Perform find operation
  const performFind = () => {
    const x = parseInt(findNode);
    
    if (isNaN(x) || x < 0 || x >= nodeCount[0]) {
      alert('Please enter a valid node index');
      return;
    }
    
    const currentNodes = [...(steps[currentStep]?.nodes || nodes)];
    const findResult = find(currentNodes, x);
    
    const findSteps = findResult.steps;
    findSteps.push({
      nodes: currentNodes.map(node => ({ ...node, isHighlighted: node.id === findResult.parent })),
      description: `Find(${x}) = ${findResult.parent}`,
      operation: 'find-result',
      operationParams: [x],
      sets: getSets(currentNodes)
    });
    
    setSteps(prev => [...prev, ...findSteps]);
    setStats(prev => ({ ...prev, operations: prev.operations + 1 }));
    
    setFindNode('');
  };

  // Auto-play animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      intervalId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isPlaying, currentStep, steps.length]);

  // Initialize when component mounts or node count changes
  useEffect(() => {
    initializeDSU();
  }, [nodeCount]);

  const currentStepData = steps[currentStep];

  // Render node
  const renderNode = (node: DSUNode) => {
    const isParent = node.parent === node.id;
    const nodeStyle = {
      left: node.x - 25,
      top: node.y - 25,
    };

    let nodeClass = "w-12 h-12 rounded-full border-3 flex flex-col items-center justify-center text-xs font-bold absolute transition-all duration-500 ";
    
    if (node.isHighlighted) {
      nodeClass += "bg-yellow-300 border-yellow-600 transform scale-110 ";
    } else if (isParent) {
      nodeClass += "bg-blue-200 border-blue-600 ";
    } else {
      nodeClass += "bg-gray-100 border-gray-400 ";
    }

    return (
      <div key={node.id} style={nodeStyle} className={nodeClass}>
        <div className="text-lg">{node.id}</div>
        {node.rank > 0 && <div className="text-xs text-gray-600">r:{node.rank}</div>}
      </div>
    );
  };

  // Render edge from child to parent
  const renderEdge = (child: DSUNode, parent: DSUNode) => {
    if (child.id === parent.id) return null; // No self-loop
    
    return (
      <line
        key={`edge-${child.id}-${parent.id}`}
        x1={child.x}
        y1={child.y}
        x2={parent.x}
        y2={parent.y}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className="transition-all duration-500"
      />
    );
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Link2 className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Union-Find (Tập Rời Rạc)</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Union-Find (Disjoint Set)"
              description="Union-Find là cấu trúc dữ liệu để quản lý tập hợp các phần tử rời rạc, hỗ trợ hai thao tác chính: Union (hợp nhất) và Find (tìm kiếm)."
              timeComplexity={{
                best: "O(α(n))",
                average: "O(α(n))", 
                worst: "O(α(n))"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Mỗi tập hợp được đại diện bởi một cây",
                "Path compression để làm phẳng cây",
                "Union by rank để cân bằng chiều cao",
                "Find operation tìm đại diện của tập hợp"
              ]}
              applications={[
                "Thuật toán Kruskal's MST",
                "Kiểm tra chu trình trong đồ thị",
                "Dynamic connectivity problems",
                "Phân loại thành phần liên thông"
              ]}
              advantages={[
                "Thời gian gần như hằng số O(α(n))",
                "Tiết kiệm bộ nhớ",
                "Dễ cài đặt và hiểu",
                "Tối ưu cho bài toán connectivity"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa các thao tác Union-Find với tối ưu hóa nén đường đi và hợp nhất theo rank.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Elements: {nodeCount[0]}</label>
                <Slider
                  value={nodeCount}
                  onValueChange={setNodeCount}
                  min={4}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Union Operation</label>
                <div className="flex gap-2">
                  <Input
                    value={unionX}
                    onChange={(e) => setUnionX(e.target.value)}
                    placeholder="x"
                    className="w-16"
                  />
                  <Input
                    value={unionY}
                    onChange={(e) => setUnionY(e.target.value)}
                    placeholder="y"
                    className="w-16"
                  />
                  <Button onClick={performUnion} size="sm">
                    Union
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Find Operation</label>
                <div className="flex gap-2">
                  <Input
                    value={findNode}
                    onChange={(e) => setFindNode(e.target.value)}
                    placeholder="node"
                    className="w-16"
                  />
                  <Button onClick={performFind} size="sm">
                    Find
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={play} disabled={isPlaying} size="sm">
                  <Play className="w-4 h-4" />
                </Button>
                <Button onClick={pause} disabled={!isPlaying} size="sm" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
                <Button onClick={reset} size="sm" variant="outline">
                  <Square className="w-4 h-4" />
                </Button>
                <Button onClick={initializeDSU} size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Disjoint Sets:</span>
                  <span className="font-mono">{stats.totalSets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operations:</span>
                  <span className="font-mono">{stats.operations}</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Sets Display */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Current Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStepData?.sets.map((set, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded text-sm">
                    <span className="font-mono">{`{${set.join(', ')}}`}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Union-Find Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Initialize the data structure and perform operations'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 overflow-auto border rounded-lg bg-gray-50">
                <svg width="600" height="400" className="absolute">
                  {/* Arrow marker definition */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="10"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>
                  
                  {/* Render edges */}
                  {currentStepData?.nodes.map(node => {
                    if (node.parent === node.id) return null;
                    const parent = currentStepData.nodes.find(n => n.id === node.parent);
                    return parent ? renderEdge(node, parent) : null;
                  })}
                </svg>
                
                {/* Render nodes */}
                <div className="absolute w-full h-full">
                  {currentStepData?.nodes.map(renderNode)}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 border-2 border-blue-600 rounded-full"></div>
                  <span>Root Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-400 rounded-full"></div>
                  <span>Child Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-300 border-2 border-yellow-600 rounded-full"></div>
                  <span>Active/Highlighted</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="10">
                    <line x1="0" y1="5" x2="15" y2="5" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                  <span>Parent Pointer</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Algorithm Information */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Union-Find Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Union-Find (Disjoint Set Union) is a data structure that keeps track of elements partitioned into disjoint sets. It supports two main operations efficiently:</p>
              
              <h3>Operations</h3>
              <ul>
                <li><strong>Find(x):</strong> Determine which set element x belongs to. Returns the representative of the set.</li>
                <li><strong>Union(x, y):</strong> Merge the sets containing elements x and y.</li>
              </ul>

              <h3>Optimizations</h3>
              <ul>
                <li><strong>Path Compression:</strong> During Find operations, make all nodes point directly to the root to flatten the tree.</li>
                <li><strong>Union by Rank:</strong> Always attach the smaller tree under the root of the larger tree to keep trees balanced.</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Without optimizations:</strong> O(n) per operation in worst case</li>
                <li><strong>With both optimizations:</strong> O(α(n)) per operation, where α is the inverse Ackermann function (practically constant)</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Kruskal&apos;s algorithm for Minimum Spanning Tree</li>
                <li>Detecting cycles in undirected graphs</li>
                <li>Connected components in dynamic graphs</li>
                <li>Least Common Ancestor (LCA) queries</li>
                <li>Image processing (connected component labeling)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
