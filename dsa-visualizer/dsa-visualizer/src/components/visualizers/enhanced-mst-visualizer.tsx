"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, RotateCcw, Network, BookOpen, Trash2 } from 'lucide-react';

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
  edge?: Edge;
  action: 'add' | 'reject' | 'consider' | 'start' | 'complete';
  description: string;
  currentMST: Edge[];
  totalWeight: number;
  sortedEdges?: Edge[];
  unionFind?: number[];
  visited?: Set<number>;
}

// --- Union-Find Data Structure ---
class UnionFind {
  parent: number[];
  rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
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

  getParentArray(): number[] {
    return [...this.parent];
  }
}

// --- Constants ---
const ALGORITHMS = {
  kruskal: { name: "Kruskal's Algorithm", description: "Greedy algorithm sorting edges by weight" },
  prim: { name: "Prim's Algorithm", description: "Greedy algorithm starting from a vertex" }
};

const NODE_RADIUS = 30;
const EDGE_COLOR = '#94a3b8';
const MST_EDGE_COLOR = '#10b981';
const CONSIDERING_EDGE_COLOR = '#f59e0b';
const REJECTED_EDGE_COLOR = '#ef4444';

// --- Algorithm Information ---
const ALGORITHM_INFO = {
  kruskal: {
    title: "Kruskal's Minimum Spanning Tree Algorithm",
    principle: "Sort all edges by weight and add them to MST if they don't create a cycle:",
    steps: [
      "1. Sort all edges in ascending order of weight",
      "2. Initialize Union-Find data structure",
      "3. For each edge (u,v) in sorted order:",
      "   - If u and v are in different components, add edge to MST",
      "   - Otherwise, skip the edge (would create cycle)",
      "4. Continue until MST has V-1 edges"
    ],
    complexity: "Time: O(E log E), Space: O(V)",
    applications: "Network design, clustering, image segmentation"
  },
  prim: {
    title: "Prim's Minimum Spanning Tree Algorithm",
    principle: "Start from arbitrary vertex and grow MST by adding minimum weight edge:",
    steps: [
      "1. Start with arbitrary vertex in MST",
      "2. Mark vertex as visited",
      "3. Find minimum weight edge connecting visited to unvisited vertex",
      "4. Add this edge to MST and mark destination as visited",
      "5. Repeat until all vertices are in MST"
    ],
    complexity: "Time: O(E log V) or O(V²), Space: O(V)",
    applications: "Network routing protocols, approximation algorithms"
  }
};

// --- Predefined Graphs ---
const SAMPLE_GRAPHS = {
  small: {
    name: "Small Graph (5 vertices)",
    nodes: [
      { id: 0, x: 200, y: 100, label: "A" },
      { id: 1, x: 350, y: 100, label: "B" },
      { id: 2, x: 100, y: 250, label: "C" },
      { id: 3, x: 275, y: 250, label: "D" },
      { id: 4, x: 450, y: 250, label: "E" }
    ],
    edges: [
      { from: 0, to: 1, weight: 4, id: "e01" },
      { from: 0, to: 2, weight: 2, id: "e02" },
      { from: 1, to: 3, weight: 3, id: "e13" },
      { from: 1, to: 4, weight: 8, id: "e14" },
      { from: 2, to: 3, weight: 1, id: "e23" },
      { from: 3, to: 4, weight: 5, id: "e34" }
    ]
  },
  medium: {
    name: "Medium Graph (7 vertices)",
    nodes: [
      { id: 0, x: 300, y: 80, label: "A" },
      { id: 1, x: 150, y: 180, label: "B" },
      { id: 2, x: 450, y: 180, label: "C" },
      { id: 3, x: 100, y: 320, label: "D" },
      { id: 4, x: 300, y: 280, label: "E" },
      { id: 5, x: 500, y: 320, label: "F" },
      { id: 6, x: 300, y: 420, label: "G" }
    ],
    edges: [
      { from: 0, to: 1, weight: 7, id: "e01" },
      { from: 0, to: 2, weight: 5, id: "e02" },
      { from: 1, to: 2, weight: 8, id: "e12" },
      { from: 1, to: 3, weight: 9, id: "e13" },
      { from: 1, to: 4, weight: 7, id: "e14" },
      { from: 2, to: 4, weight: 5, id: "e24" },
      { from: 2, to: 5, weight: 6, id: "e25" },
      { from: 3, to: 4, weight: 15, id: "e34" },
      { from: 3, to: 6, weight: 6, id: "e36" },
      { from: 4, to: 5, weight: 8, id: "e45" },
      { from: 4, to: 6, weight: 9, id: "e46" },
      { from: 5, to: 6, weight: 11, id: "e56" }
    ]
  }
};

const EnhancedMSTVisualizer = () => {
  const [algorithm, setAlgorithm] = useState('kruskal');
  const [nodes, setNodes] = useState<Node[]>(SAMPLE_GRAPHS.small.nodes);
  const [edges, setEdges] = useState<Edge[]>(SAMPLE_GRAPHS.small.edges);
  const [steps, setSteps] = useState<MSTStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [selectedGraph, setSelectedGraph] = useState('small');

  // Interactive editing states
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState(1);

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Kruskal's Algorithm Implementation
  const generateKruskalSteps = useCallback((nodeList: Node[], edgeList: Edge[]): MSTStep[] => {
    const steps: MSTStep[] = [];
    const sortedEdges = [...edgeList].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(nodeList.length);
    const mst: Edge[] = [];
    let totalWeight = 0;

    steps.push({
      step: 0,
      action: 'start',
      description: `Starting Kruskal's algorithm. Sorted ${edgeList.length} edges by weight.`,
      currentMST: [],
      totalWeight: 0,
      sortedEdges: [...sortedEdges],
      unionFind: uf.getParentArray()
    });

    for (let i = 0; i < sortedEdges.length && mst.length < nodeList.length - 1; i++) {
      const edge = sortedEdges[i];
      
      steps.push({
        step: steps.length,
        edge,
        action: 'consider',
        description: `Considering edge ${nodeList[edge.from].label}-${nodeList[edge.to].label} with weight ${edge.weight}`,
        currentMST: [...mst],
        totalWeight,
        sortedEdges: [...sortedEdges],
        unionFind: uf.getParentArray()
      });

      if (uf.union(edge.from, edge.to)) {
        mst.push(edge);
        totalWeight += edge.weight;
        
        steps.push({
          step: steps.length,
          edge,
          action: 'add',
          description: `Added edge ${nodeList[edge.from].label}-${nodeList[edge.to].label}. No cycle formed. MST weight: ${totalWeight}`,
          currentMST: [...mst],
          totalWeight,
          sortedEdges: [...sortedEdges],
          unionFind: uf.getParentArray()
        });
      } else {
        steps.push({
          step: steps.length,
          edge,
          action: 'reject',
          description: `Rejected edge ${nodeList[edge.from].label}-${nodeList[edge.to].label}. Would create a cycle.`,
          currentMST: [...mst],
          totalWeight,
          sortedEdges: [...sortedEdges],
          unionFind: uf.getParentArray()
        });
      }
    }

    steps.push({
      step: steps.length,
      action: 'complete',
      description: `MST completed! Total weight: ${totalWeight}. Used ${mst.length} edges.`,
      currentMST: [...mst],
      totalWeight,
      sortedEdges: [...sortedEdges],
      unionFind: uf.getParentArray()
    });

    return steps;
  }, []);

  // Prim's Algorithm Implementation
  const generatePrimSteps = useCallback((nodeList: Node[], edgeList: Edge[]): MSTStep[] => {
    const steps: MSTStep[] = [];
    const mst: Edge[] = [];
    const visited = new Set<number>();
    let totalWeight = 0;

    // Start from vertex 0
    visited.add(0);
    
    steps.push({
      step: 0,
      action: 'start',
      description: `Starting Prim's algorithm from vertex ${nodeList[0].label}`,
      currentMST: [],
      totalWeight: 0,
      visited: new Set(visited)
    });

    while (visited.size < nodeList.length) {
      let minEdge: Edge | null = null;
      let minWeight = Infinity;

      // Find minimum weight edge connecting visited to unvisited
      for (const edge of edgeList) {
        const fromVisited = visited.has(edge.from);
        const toVisited = visited.has(edge.to);
        
        if (fromVisited !== toVisited && edge.weight < minWeight) {
          minEdge = edge;
          minWeight = edge.weight;
        }
      }

      if (minEdge) {
        steps.push({
          step: steps.length,
          edge: minEdge,
          action: 'consider',
          description: `Considering edge ${nodeList[minEdge.from].label}-${nodeList[minEdge.to].label} with weight ${minEdge.weight}`,
          currentMST: [...mst],
          totalWeight,
          visited: new Set(visited)
        });

        mst.push(minEdge);
        totalWeight += minEdge.weight;
        
        // Add the unvisited vertex
        if (!visited.has(minEdge.from)) {
          visited.add(minEdge.from);
        } else {
          visited.add(minEdge.to);
        }

        steps.push({
          step: steps.length,
          edge: minEdge,
          action: 'add',
          description: `Added edge ${nodeList[minEdge.from].label}-${nodeList[minEdge.to].label}. MST weight: ${totalWeight}`,
          currentMST: [...mst],
          totalWeight,
          visited: new Set(visited)
        });
      }
    }

    steps.push({
      step: steps.length,
      action: 'complete',
      description: `MST completed! Total weight: ${totalWeight}. Used ${mst.length} edges.`,
      currentMST: [...mst],
      totalWeight,
      visited: new Set(visited)
    });

    return steps;
  }, []);

  // Generate steps based on selected algorithm
  const generateSteps = useCallback(() => {
    let newSteps: MSTStep[] = [];
    
    if (algorithm === 'kruskal') {
      newSteps = generateKruskalSteps(nodes, edges);
    } else if (algorithm === 'prim') {
      newSteps = generatePrimSteps(nodes, edges);
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
  }, [algorithm, nodes, edges, generateKruskalSteps, generatePrimSteps]);

  // Animation functions
  const startAnimation = () => {
    if (steps.length === 0) generateSteps();
    setIsAnimating(true);
    animateSteps();
  };

  const animateSteps = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    
    animationRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsAnimating(false);
          if (animationRef.current) clearInterval(animationRef.current);
          return prev;
        }
        return next;
      });
    }, speed);
  }, [speed, steps.length]);

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  const reset = () => {
    stopAnimation();
    setCurrentStep(0);
  };

  // Load predefined graph
  const loadGraph = (graphKey: keyof typeof SAMPLE_GRAPHS) => {
    const graph = SAMPLE_GRAPHS[graphKey];
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setSelectedGraph(graphKey);
    reset();
  };

  // Interactive editing functions
  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isEditMode) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add new node
    if (selectedNodes.length === 0) {
      const newId = Math.max(...nodes.map(n => n.id), -1) + 1;
      const label = newNodeLabel || String.fromCharCode(65 + newId);
      
      setNodes(prev => [...prev, { id: newId, x, y, label }]);
      setNewNodeLabel('');
    }
  };

  const handleNodeClick = (nodeId: number, e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(prev => prev.filter(id => id !== nodeId));
    } else if (selectedNodes.length < 2) {
      setSelectedNodes(prev => [...prev, nodeId]);
      
      // If two nodes selected, create edge
      if (selectedNodes.length === 1) {
        const from = selectedNodes[0];
        const to = nodeId;
        const newEdgeId = `e${from}${to}`;
        
        if (!edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
          setEdges(prev => [...prev, { from, to, weight: newEdgeWeight, id: newEdgeId }]);
        }
        
        setSelectedNodes([]);
      }
    }
  };

  const removeNode = (nodeId: number) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    reset();
  };

  const removeEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    reset();
  };

  // Get edge styling based on current step
  const getEdgeStyle = (edge: Edge) => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return { stroke: EDGE_COLOR, strokeWidth: 2 };

    if (currentStepData.currentMST.some(e => e.id === edge.id)) {
      return { stroke: MST_EDGE_COLOR, strokeWidth: 4 };
    }
    
    if (currentStepData.edge?.id === edge.id) {
      switch (currentStepData.action) {
        case 'consider':
          return { stroke: CONSIDERING_EDGE_COLOR, strokeWidth: 4 };
        case 'add':
          return { stroke: MST_EDGE_COLOR, strokeWidth: 4 };
        case 'reject':
          return { stroke: REJECTED_EDGE_COLOR, strokeWidth: 4 };
      }
    }

    return { stroke: EDGE_COLOR, strokeWidth: 2 };
  };

  // Effects
  useEffect(() => {
    generateSteps();
  }, [generateSteps]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const currentStepData = steps[currentStep] || { currentMST: [], totalWeight: 0 };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Minimum Spanning Tree Visualizer</h1>
        <p className="text-muted-foreground">
          Visualize Kruskal&apos;s and Prim&apos;s algorithms with interactive graph editing
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Algorithm & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="algorithm">Select Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, alg]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{alg.name}</div>
                        <div className="text-sm text-muted-foreground">{alg.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={startAnimation} disabled={isAnimating} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                {isAnimating ? 'Running...' : 'Start'}
              </Button>
              <Button onClick={stopAnimation} disabled={!isAnimating} variant="outline">
                <Square className="w-4 h-4" />
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label>Speed: {speed}ms</Label>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={200}
                max={3000}
                step={100}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Graph Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="graph-select">Predefined Graphs</Label>
              <Select value={selectedGraph} onValueChange={(value) => loadGraph(value as keyof typeof SAMPLE_GRAPHS)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SAMPLE_GRAPHS).map(([key, graph]) => (
                    <SelectItem key={key} value={key}>
                      {graph.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                variant={isEditMode ? "destructive" : "outline"}
                className="flex-1"
              >
                {isEditMode ? 'Exit Edit' : 'Edit Mode'}
              </Button>
              <Button onClick={() => { setNodes([]); setEdges([]); reset(); }} variant="outline">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MST Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
                <div className="text-sm text-muted-foreground">Vertices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{edges.length}</div>
                <div className="text-sm text-muted-foreground">Edges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentStepData.currentMST.length}</div>
                <div className="text-sm text-muted-foreground">MST Edges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{currentStepData.totalWeight}</div>
                <div className="text-sm text-muted-foreground">Total Weight</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Editing Panel */}
      {isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>Interactive Editing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="node-label">New Node Label</Label>
                <Input
                  id="node-label"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="Auto-generated"
                />
                <p className="text-sm text-muted-foreground mt-1">Click on SVG to add node</p>
              </div>
              <div>
                <Label htmlFor="edge-weight">New Edge Weight</Label>
                <Input
                  id="edge-weight"
                  type="number"
                  value={newEdgeWeight}
                  onChange={(e) => setNewEdgeWeight(parseInt(e.target.value) || 1)}
                  min={1}
                />
                <p className="text-sm text-muted-foreground mt-1">Click two nodes to connect</p>
              </div>
              <div>
                <Label>Selected Nodes: {selectedNodes.length}/2</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedNodes.map(id => nodes.find(n => n.id === id)?.label).join(', ') || 'None'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress and Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>Progress: Step {currentStep} of {steps.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          {steps[currentStep] && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Current Step:</h4>
              <p className="text-blue-800">{steps[currentStep].description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Graph Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <svg
              ref={svgRef}
              width="600"
              height="500"
              className="border rounded-lg bg-white cursor-pointer"
              onClick={handleSVGClick}
            >
              {/* Edges */}
              {edges.map(edge => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const style = getEdgeStyle(edge);
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={edge.id}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      className="transition-all duration-300"
                    />
                    <text
                      x={midX}
                      y={midY - 5}
                      textAnchor="middle"
                      className="text-sm font-medium fill-gray-700 select-none"
                      style={{ fontSize: '12px' }}
                    >
                      {edge.weight}
                    </text>
                    {isEditMode && (
                      <circle
                        cx={midX}
                        cy={midY + 10}
                        r="8"
                        fill="red"
                        className="cursor-pointer opacity-70 hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); removeEdge(edge.id); }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={selectedNodes.includes(node.id) ? "#fbbf24" : "#e5e7eb"}
                    stroke={selectedNodes.includes(node.id) ? "#f59e0b" : "#6b7280"}
                    strokeWidth="2"
                    className="cursor-pointer transition-colors duration-200 hover:fill-gray-300"
                    onClick={(e) => handleNodeClick(node.id, e)}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="text-sm font-bold fill-gray-800 select-none pointer-events-none"
                  >
                    {node.label}
                  </text>
                  {isEditMode && (
                    <circle
                      cx={node.x + NODE_RADIUS - 5}
                      cy={node.y - NODE_RADIUS + 5}
                      r="8"
                      fill="red"
                      className="cursor-pointer opacity-70 hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                    />
                  )}
                </g>
              ))}
            </svg>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Algorithm Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO] && (
              <div className="space-y-3">
                <h4 className="font-semibold">{ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].title}</h4>
                <p className="text-sm text-muted-foreground">
                  {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].principle}
                </p>
                <div>
                  <h5 className="font-medium mb-2">Steps:</h5>
                  <ul className="text-sm space-y-1">
                    {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].steps.map((step, index) => (
                      <li key={index} className="text-muted-foreground">{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Complexity:</span> {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].complexity}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Applications:</span> {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].applications}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edge List for Kruskal */}
      {algorithm === 'kruskal' && steps[currentStep]?.sortedEdges && (
        <Card>
          <CardHeader>
            <CardTitle>Sorted Edge List (Kruskal&apos;s Algorithm)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {steps[currentStep].sortedEdges?.map((edge) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                const isInMST = currentStepData.currentMST.some(e => e.id === edge.id);
                const isCurrent = steps[currentStep].edge?.id === edge.id;
                const isRejected = steps.slice(0, currentStep + 1).some(s => s.action === 'reject' && s.edge?.id === edge.id);

                return (
                  <div
                    key={edge.id}
                    className={`
                      p-2 rounded border text-center text-sm
                      ${isCurrent ? 'bg-yellow-100 border-yellow-500' :
                        isInMST ? 'bg-green-100 border-green-500' :
                        isRejected ? 'bg-red-100 border-red-500' :
                        'bg-gray-50 border-gray-300'}
                    `}
                  >
                    <div className="font-medium">{fromNode?.label}-{toNode?.label}</div>
                    <div className="text-xs text-muted-foreground">Weight: {edge.weight}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMSTVisualizer;
