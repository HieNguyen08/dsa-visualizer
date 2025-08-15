"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Play, Square, RotateCcw, Network, Plus, Trash2 } from 'lucide-react';

// --- Types ---
interface GraphNode {
  id: number;
  x: number;
  y: number;
  label: string;
  visited?: boolean;
  distance?: number;
  parent?: number;
  inMST?: boolean;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
  id: string;
  visited?: boolean;
  inMST?: boolean;
  type?: 'tree' | 'back' | 'forward' | 'cross';
}

interface AlgorithmStep {
  step: number;
  action: string;
  description: string;
  currentNode?: number;
  currentEdge?: GraphEdge;
  visitedNodes: Set<number>;
  visitedEdges: Set<string>;
  distances?: Map<number, number>;
  parents?: Map<number, number>;
  queue?: number[];
  stack?: number[];
  mstEdges?: Set<string>;
  totalWeight?: number;
}

// --- Algorithms ---

// Depth-First Search
const dfsTraversal = (nodes: GraphNode[], edges: GraphEdge[], startNode: number): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<number>();
  const visitedEdges = new Set<string>();
  const stack: number[] = [startNode];
  let stepCount = 0;

  // Build adjacency list
  const adjacencyList = new Map<number, GraphEdge[]>();
  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
    if (!adjacencyList.has(edge.to)) adjacencyList.set(edge.to, []);
    adjacencyList.get(edge.from)!.push(edge);
    adjacencyList.get(edge.to)!.push({ ...edge, from: edge.to, to: edge.from });
  }

  steps.push({
    step: ++stepCount,
    action: 'start',
    description: `Bắt đầu DFS từ đỉnh ${startNode}`,
    currentNode: startNode,
    visitedNodes: new Set(visited),
    visitedEdges: new Set(visitedEdges),
    stack: [...stack]
  });

  while (stack.length > 0) {
    const currentNode = stack.pop()!;
    
    if (visited.has(currentNode)) continue;
    
    visited.add(currentNode);
    steps.push({
      step: ++stepCount,
      action: 'visit',
      description: `Thăm đỉnh ${currentNode}`,
      currentNode,
      visitedNodes: new Set(visited),
      visitedEdges: new Set(visitedEdges),
      stack: [...stack]
    });

    // Add neighbors to stack (in reverse order for correct traversal)
    const neighbors = adjacencyList.get(currentNode) || [];
    const unvisitedNeighbors = neighbors.filter(edge => !visited.has(edge.to)).reverse();
    
    for (const edge of unvisitedNeighbors) {
      if (!visited.has(edge.to)) {
        stack.push(edge.to);
        visitedEdges.add(edge.id);
        
        steps.push({
          step: ++stepCount,
          action: 'explore',
          description: `Khám phá cạnh ${edge.from}-${edge.to}, thêm ${edge.to} vào stack`,
          currentEdge: edge,
          visitedNodes: new Set(visited),
          visitedEdges: new Set(visitedEdges),
          stack: [...stack]
        });
      }
    }
  }

  return steps;
};

// Breadth-First Search
const bfsTraversal = (nodes: GraphNode[], edges: GraphEdge[], startNode: number): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<number>();
  const visitedEdges = new Set<string>();
  const queue: number[] = [startNode];
  let stepCount = 0;

  // Build adjacency list
  const adjacencyList = new Map<number, GraphEdge[]>();
  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
    if (!adjacencyList.has(edge.to)) adjacencyList.set(edge.to, []);
    adjacencyList.get(edge.from)!.push(edge);
    adjacencyList.get(edge.to)!.push({ ...edge, from: edge.to, to: edge.from });
  }

  visited.add(startNode);
  steps.push({
    step: ++stepCount,
    action: 'start',
    description: `Bắt đầu BFS từ đỉnh ${startNode}`,
    currentNode: startNode,
    visitedNodes: new Set(visited),
    visitedEdges: new Set(visitedEdges),
    queue: [...queue]
  });

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    
    steps.push({
      step: ++stepCount,
      action: 'visit',
      description: `Thăm đỉnh ${currentNode}`,
      currentNode,
      visitedNodes: new Set(visited),
      visitedEdges: new Set(visitedEdges),
      queue: [...queue]
    });

    const neighbors = adjacencyList.get(currentNode) || [];
    
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push(edge.to);
        visitedEdges.add(edge.id);
        
        steps.push({
          step: ++stepCount,
          action: 'explore',
          description: `Khám phá cạnh ${edge.from}-${edge.to}, thêm ${edge.to} vào queue`,
          currentEdge: edge,
          visitedNodes: new Set(visited),
          visitedEdges: new Set(visitedEdges),
          queue: [...queue]
        });
      }
    }
  }

  return steps;
};

// Dijkstra's Shortest Path
const dijkstraAlgorithm = (nodes: GraphNode[], edges: GraphEdge[], startNode: number): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const distances = new Map<number, number>();
  const parents = new Map<number, number>();
  const visited = new Set<number>();
  const visitedEdges = new Set<string>();
  let stepCount = 0;

  // Initialize distances
  for (const node of nodes) {
    distances.set(node.id, node.id === startNode ? 0 : Infinity);
  }

  // Build adjacency list
  const adjacencyList = new Map<number, GraphEdge[]>();
  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
    if (!adjacencyList.has(edge.to)) adjacencyList.set(edge.to, []);
    adjacencyList.get(edge.from)!.push(edge);
    adjacencyList.get(edge.to)!.push({ ...edge, from: edge.to, to: edge.from });
  }

  steps.push({
    step: ++stepCount,
    action: 'initialize',
    description: `Khởi tạo: đặt khoảng cách từ ${startNode} đến chính nó = 0, các đỉnh khác = ∞`,
    currentNode: startNode,
    visitedNodes: new Set(visited),
    visitedEdges: new Set(visitedEdges),
    distances: new Map(distances),
    parents: new Map(parents)
  });

  while (visited.size < nodes.length) {
    // Find minimum distance unvisited node
    let minDistance = Infinity;
    let currentNode = -1;
    
    for (const [nodeId, distance] of distances.entries()) {
      if (!visited.has(nodeId) && distance < minDistance) {
        minDistance = distance;
        currentNode = nodeId;
      }
    }

    if (currentNode === -1 || minDistance === Infinity) break;

    visited.add(currentNode);
    steps.push({
      step: ++stepCount,
      action: 'select',
      description: `Chọn đỉnh ${currentNode} với khoảng cách nhỏ nhất (${minDistance === Infinity ? '∞' : minDistance})`,
      currentNode,
      visitedNodes: new Set(visited),
      visitedEdges: new Set(visitedEdges),
      distances: new Map(distances),
      parents: new Map(parents)
    });

    // Update distances to neighbors
    const neighbors = adjacencyList.get(currentNode) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        const newDistance = distances.get(currentNode)! + edge.weight;
        const currentDistance = distances.get(edge.to)!;
        
        if (newDistance < currentDistance) {
          distances.set(edge.to, newDistance);
          parents.set(edge.to, currentNode);
          visitedEdges.add(edge.id);
          
          steps.push({
            step: ++stepCount,
            action: 'relax',
            description: `Cập nhật khoảng cách đến ${edge.to}: ${currentDistance === Infinity ? '∞' : currentDistance} → ${newDistance}`,
            currentEdge: edge,
            visitedNodes: new Set(visited),
            visitedEdges: new Set(visitedEdges),
            distances: new Map(distances),
            parents: new Map(parents)
          });
        }
      }
    }
  }

  return steps;
};

// Topological Sort (DFS-based)
const topologicalSort = (nodes: GraphNode[], edges: GraphEdge[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<number>();
  const visitedEdges = new Set<string>();
  const result: number[] = [];
  let stepCount = 0;

  // Build adjacency list
  const adjacencyList = new Map<number, GraphEdge[]>();
  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
    adjacencyList.get(edge.from)!.push(edge);
  }

  const dfsVisit = (node: number) => {
    visited.add(node);
    steps.push({
      step: ++stepCount,
      action: 'visit',
      description: `Thăm đỉnh ${node}`,
      currentNode: node,
      visitedNodes: new Set(visited),
      visitedEdges: new Set(visitedEdges),
      stack: [...result]
    });

    const neighbors = adjacencyList.get(node) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visitedEdges.add(edge.id);
        steps.push({
          step: ++stepCount,
          action: 'explore',
          description: `Khám phá cạnh ${edge.from} → ${edge.to}`,
          currentEdge: edge,
          visitedNodes: new Set(visited),
          visitedEdges: new Set(visitedEdges),
          stack: [...result]
        });
        dfsVisit(edge.to);
      }
    }

    result.unshift(node);
    steps.push({
      step: ++stepCount,
      action: 'finish',
      description: `Hoàn thành đỉnh ${node}, thêm vào đầu danh sách kết quả`,
      currentNode: node,
      visitedNodes: new Set(visited),
      visitedEdges: new Set(visitedEdges),
      stack: [...result]
    });
  };

  // Start DFS from all unvisited nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfsVisit(node.id);
    }
  }

  return steps;
};

// Main Component
const GraphAlgorithmVisualizer = () => {
  const [nodes] = useState<GraphNode[]>([
    { id: 0, x: 150, y: 100, label: '0' },
    { id: 1, x: 300, y: 80, label: '1' },
    { id: 2, x: 450, y: 120, label: '2' },
    { id: 3, x: 100, y: 220, label: '3' },
    { id: 4, x: 250, y: 250, label: '4' },
    { id: 5, x: 400, y: 280, label: '5' }
  ]);

  const [edges, setEdges] = useState<GraphEdge[]>([
    { from: 0, to: 1, weight: 4, id: '0-1' },
    { from: 0, to: 3, weight: 2, id: '0-3' },
    { from: 1, to: 2, weight: 5, id: '1-2' },
    { from: 1, to: 4, weight: 10, id: '1-4' },
    { from: 2, to: 5, weight: 3, id: '2-5' },
    { from: 3, to: 4, weight: 3, id: '3-4' },
    { from: 4, to: 5, weight: 4, id: '4-5' },
    { from: 3, to: 1, weight: 8, id: '3-1' }
  ]);

  const [algorithm, setAlgorithm] = useState<'dfs' | 'bfs' | 'dijkstra' | 'topological'>('dfs');
  const [startNode, setStartNode] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);

  // Add edge inputs
  const [newEdgeFrom, setNewEdgeFrom] = useState('');
  const [newEdgeTo, setNewEdgeTo] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState('');

  const startVisualization = () => {
    if (isAnimating) {
      setIsAnimating(false);
      return;
    }

    let algorithmSteps: AlgorithmStep[] = [];
    
    switch (algorithm) {
      case 'dfs':
        algorithmSteps = dfsTraversal(nodes, edges, startNode);
        break;
      case 'bfs':
        algorithmSteps = bfsTraversal(nodes, edges, startNode);
        break;
      case 'dijkstra':
        algorithmSteps = dijkstraAlgorithm(nodes, edges, startNode);
        break;
      case 'topological':
        algorithmSteps = topologicalSort(nodes, edges);
        break;
    }
    
    setSteps(algorithmSteps);
    setCurrentStep(-1);
    setIsAnimating(true);
    animateSteps(algorithmSteps);
  };

  const animateSteps = (algorithmSteps: AlgorithmStep[]) => {
    let stepIndex = 0;
    
    const animate = () => {
      if (stepIndex >= algorithmSteps.length) {
        setIsAnimating(false);
        return;
      }
      
      setCurrentStep(stepIndex);
      stepIndex++;
      setTimeout(animate, 1500);
    };

    animate();
  };

  const addEdge = () => {
    const from = parseInt(newEdgeFrom);
    const to = parseInt(newEdgeTo);
    const weight = parseInt(newEdgeWeight);

    if (isNaN(from) || isNaN(to) || isNaN(weight) || from === to) return;
    if (from < 0 || from >= nodes.length || to < 0 || to >= nodes.length) return;
    if (edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) return;

    const newEdge: GraphEdge = {
      from,
      to,
      weight,
      id: `${from}-${to}`
    };

    setEdges([...edges, newEdge]);
    setNewEdgeFrom('');
    setNewEdgeTo('');
    setNewEdgeWeight('');
  };

  const removeEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId));
  };

  const reset = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setSteps([]);
  };

  const getNodeColor = (nodeId: number): string => {
    if (currentStep < 0) return '#3b82f6';
    
    const currentStepData = steps[currentStep];
    if (!currentStepData) return '#3b82f6';

    if (currentStepData.currentNode === nodeId) return '#ef4444'; // Red for current
    if (currentStepData.visitedNodes.has(nodeId)) return '#10b981'; // Green for visited
    
    return '#3b82f6'; // Blue for unvisited
  };

  const getEdgeColor = (edge: GraphEdge): string => {
    if (currentStep < 0) return '#64748b';
    
    const currentStepData = steps[currentStep];
    if (!currentStepData) return '#64748b';

    if (currentStepData.currentEdge?.id === edge.id) return '#f59e0b'; // Yellow for current
    if (currentStepData.visitedEdges.has(edge.id)) return '#10b981'; // Green for visited
    
    return '#64748b'; // Gray for unvisited
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-6 h-6" />
            Advanced Graph Algorithms Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(value: 'dfs' | 'bfs' | 'dijkstra' | 'topological') => setAlgorithm(value)} disabled={isAnimating}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dfs">Depth-First Search</SelectItem>
                  <SelectItem value="bfs">Breadth-First Search</SelectItem>
                  <SelectItem value="dijkstra">Dijkstra&apos;s Algorithm</SelectItem>
                  <SelectItem value="topological">Topological Sort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {algorithm !== 'topological' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Start Node</label>
                <Select value={startNode.toString()} onValueChange={(value) => setStartNode(parseInt(value))} disabled={isAnimating}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map(node => (
                      <SelectItem key={node.id} value={node.id.toString()}>{node.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <Button
                onClick={startVisualization}
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
                    Start
                  </>
                )}
              </Button>

              <Button onClick={reset} variant="outline" disabled={isAnimating}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visualization">Graph Visualization</TabsTrigger>
              <TabsTrigger value="steps">Algorithm Steps</TabsTrigger>
              <TabsTrigger value="manage">Manage Graph</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4 relative" style={{ height: '500px' }}>
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Draw edges */}
                  {edges.map(edge => {
                    const fromNode = nodes.find(n => n.id === edge.from)!;
                    const toNode = nodes.find(n => n.id === edge.to)!;
                    const color = getEdgeColor(edge);
                    const strokeWidth = color === '#10b981' ? 3 : 2;

                    return (
                      <g key={edge.id}>
                        {/* Arrow */}
                        <defs>
                          <marker
                            id={`arrowhead-${edge.id}`}
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill={color}
                            />
                          </marker>
                        </defs>
                        
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={color}
                          strokeWidth={strokeWidth}
                          markerEnd={`url(#arrowhead-${edge.id})`}
                        />
                        
                        {/* Weight label */}
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 - 10}
                          textAnchor="middle"
                          className="text-sm font-bold fill-gray-800"
                          style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 3 }}
                        >
                          {edge.weight}
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw nodes */}
                  {nodes.map(node => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={25}
                        fill={getNodeColor(node.id)}
                        stroke="#1e40af"
                        strokeWidth={2}
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        className="text-sm font-bold fill-white"
                      >
                        {node.label}
                      </text>
                      
                      {/* Show distance for Dijkstra */}
                      {algorithm === 'dijkstra' && currentStep >= 0 && steps[currentStep]?.distances && (
                        <text
                          x={node.x}
                          y={node.y - 35}
                          textAnchor="middle"
                          className="text-xs font-bold fill-red-600"
                        >
                          d={steps[currentStep].distances.get(node.id) === Infinity ? '∞' : steps[currentStep].distances.get(node.id)}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Current step info */}
                {currentStep >= 0 && steps[currentStep] && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Step {steps[currentStep].step}</h4>
                      <div className="text-sm text-gray-500">
                        {steps[currentStep].queue && (
                          <span>Queue: [{steps[currentStep].queue!.join(', ')}]</span>
                        )}
                        {steps[currentStep].stack && (
                          <span>Stack: [{steps[currentStep].stack!.join(', ')}]</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{steps[currentStep].description}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="steps" className="mt-6">
              <div className="bg-white rounded-lg border max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3">Step</th>
                      <th className="text-left p-3">Action</th>
                      <th className="text-left p-3">Current</th>
                      <th className="text-left p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.slice(0, currentStep + 1).map((step, index) => (
                      <tr
                        key={index}
                        className={`border-b ${index === currentStep ? 'bg-blue-50' : ''}`}
                      >
                        <td className="p-3">{step.step}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            step.action === 'visit' ? 'bg-green-100 text-green-800' :
                            step.action === 'explore' ? 'bg-yellow-100 text-yellow-800' :
                            step.action === 'relax' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {step.action}
                          </span>
                        </td>
                        <td className="p-3">
                          {step.currentNode !== undefined && `Node ${step.currentNode}`}
                          {step.currentEdge && `Edge ${step.currentEdge.from}-${step.currentEdge.to}`}
                        </td>
                        <td className="p-3">{step.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="mt-6">
              <div className="space-y-6">
                {/* Add Edge */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Edge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 items-end">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">From Node (0-{nodes.length - 1})</label>
                        <Input
                          type="number"
                          value={newEdgeFrom}
                          onChange={(e) => setNewEdgeFrom(e.target.value)}
                          className="w-20"
                          min="0"
                          max={nodes.length - 1}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">To Node (0-{nodes.length - 1})</label>
                        <Input
                          type="number"
                          value={newEdgeTo}
                          onChange={(e) => setNewEdgeTo(e.target.value)}
                          className="w-20"
                          min="0"
                          max={nodes.length - 1}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Weight</label>
                        <Input
                          type="number"
                          value={newEdgeWeight}
                          onChange={(e) => setNewEdgeWeight(e.target.value)}
                          className="w-20"
                          min="1"
                        />
                      </div>
                      <Button onClick={addEdge} disabled={isAnimating}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Edge
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Edges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Edges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {edges.map(edge => (
                        <div key={edge.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{edge.from} → {edge.to} ({edge.weight})</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeEdge(edge.id)}
                            disabled={isAnimating}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphAlgorithmVisualizer;
