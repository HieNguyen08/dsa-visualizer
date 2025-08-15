"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { TreePine, Plus, Search, Edit, RotateCcw } from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface TreeNode {
  id: number;
  value: number;
  left: number;
  right: number;
  children: TreeNode[];
  isHighlighted: boolean;
  isQuerying: boolean;
  isUpdating: boolean;
  level: number;
}

interface SegmentTreeStep {
  description: string;
  operation: 'build' | 'query' | 'update';
  tree: TreeNode[];
  array: number[];
  queryLeft?: number;
  queryRight?: number;
  updateIndex?: number;
  updateValue?: number;
  result?: number;
  visitedNodes: number[];
}

export default function SegmentTreePage() {
  const [array, setArray] = useState<number[]>([1, 3, 5, 7, 9, 11]);
  const [queryLeft, setQueryLeft] = useState('');
  const [queryRight, setQueryRight] = useState('');
  const [updateIndex, setUpdateIndex] = useState('');
  const [updateValue, setUpdateValue] = useState('');
  const [steps, setSteps] = useState<SegmentTreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);
  const [arraySize, setArraySize] = useState([6]);

  // Segment Tree implementation
  class SegmentTree {
    private tree: number[];
    private size: number;
    private steps: SegmentTreeStep[] = [];
    private visitedNodes: number[] = [];

    constructor(arr: number[]) {
      this.size = arr.length;
      this.tree = new Array(4 * this.size).fill(0);
      this.build(arr, 1, 0, this.size - 1);
    }

    private build(arr: number[], node: number, start: number, end: number) {
      if (start === end) {
        this.tree[node] = arr[start];
      } else {
        const mid = Math.floor((start + end) / 2);
        this.build(arr, 2 * node, start, mid);
        this.build(arr, 2 * node + 1, mid + 1, end);
        this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
      }

      this.addStep(`Built node ${node} for range [${start}, ${end}] with sum ${this.tree[node]}`, 'build', arr);
    }

    private addStep(description: string, operation: 'build' | 'query' | 'update', arr: number[], queryL?: number, queryR?: number, updateIdx?: number, updateVal?: number, result?: number) {
      const treeNodes = this.buildTreeStructure();
      
      this.steps.push({
        description,
        operation,
        tree: treeNodes,
        array: [...arr],
        queryLeft: queryL,
        queryRight: queryR,
        updateIndex: updateIdx,
        updateValue: updateVal,
        result,
        visitedNodes: [...this.visitedNodes]
      });
    }

    private buildTreeStructure(): TreeNode[] {
      const nodes: TreeNode[] = [];
      const nodeCount = this.getNodeCount(1, 0, this.size - 1);
      
      for (let i = 1; i <= nodeCount; i++) {
        if (this.tree[i] !== undefined) {
          const range = this.getNodeRange(i, 0, this.size - 1);
          nodes.push({
            id: i,
            value: this.tree[i],
            left: range.left,
            right: range.right,
            children: [],
            isHighlighted: this.visitedNodes.includes(i),
            isQuerying: false,
            isUpdating: false,
            level: Math.floor(Math.log2(i))
          });
        }
      }

      // Build parent-child relationships
      nodes.forEach(node => {
        const leftChild = nodes.find(n => n.id === 2 * node.id);
        const rightChild = nodes.find(n => n.id === 2 * node.id + 1);
        if (leftChild) node.children.push(leftChild);
        if (rightChild) node.children.push(rightChild);
      });

      return nodes;
    }

    private getNodeCount(node: number, start: number, end: number): number {
      if (start > end) return 0;
      if (start === end) return node;
      
      const mid = Math.floor((start + end) / 2);
      const leftMax = this.getNodeCount(2 * node, start, mid);
      const rightMax = this.getNodeCount(2 * node + 1, mid + 1, end);
      
      return Math.max(node, Math.max(leftMax, rightMax));
    }

    private getNodeRange(nodeId: number, globalStart: number, globalEnd: number): { left: number, right: number } {
      if (nodeId === 1) return { left: globalStart, right: globalEnd };
      
      const parentId = Math.floor(nodeId / 2);
      const parentRange = this.getNodeRange(parentId, globalStart, globalEnd);
      const mid = Math.floor((parentRange.left + parentRange.right) / 2);
      
      if (nodeId % 2 === 0) { // Left child
        return { left: parentRange.left, right: mid };
      } else { // Right child
        return { left: mid + 1, right: parentRange.right };
      }
    }

    query(left: number, right: number, arr: number[]): number {
      this.visitedNodes = [];
      const result = this.queryRange(1, 0, this.size - 1, left, right);
      this.addStep(`Range sum query [${left}, ${right}] = ${result}`, 'query', arr, left, right, undefined, undefined, result);
      return result;
    }

    private queryRange(node: number, start: number, end: number, left: number, right: number): number {
      this.visitedNodes.push(node);
      
      if (right < start || end < left) {
        return 0;
      }
      
      if (left <= start && end <= right) {
        return this.tree[node];
      }
      
      const mid = Math.floor((start + end) / 2);
      const leftSum = this.queryRange(2 * node, start, mid, left, right);
      const rightSum = this.queryRange(2 * node + 1, mid + 1, end, left, right);
      
      return leftSum + rightSum;
    }

    update(index: number, value: number, arr: number[]) {
      this.visitedNodes = [];
      arr[index] = value;
      this.updateTree(1, 0, this.size - 1, index, value);
      this.addStep(`Updated index ${index} to value ${value}`, 'update', arr, undefined, undefined, index, value);
    }

    private updateTree(node: number, start: number, end: number, index: number, value: number) {
      this.visitedNodes.push(node);
      
      if (start === end) {
        this.tree[node] = value;
      } else {
        const mid = Math.floor((start + end) / 2);
        if (index <= mid) {
          this.updateTree(2 * node, start, mid, index, value);
        } else {
          this.updateTree(2 * node + 1, mid + 1, end, index, value);
        }
        this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
      }
    }

    getSteps(): SegmentTreeStep[] {
      return this.steps;
    }
  }

  // Generate array
  const generateArray = () => {
    const newArray = Array.from({ length: arraySize[0] }, () => Math.floor(Math.random() * 20) + 1);
    setArray(newArray);
  };

  // Perform range query
  const performQuery = () => {
    const left = parseInt(queryLeft);
    const right = parseInt(queryRight);
    
    if (isNaN(left) || isNaN(right) || left < 0 || right >= array.length || left > right) return;
    
    const segmentTree = reconstructTree();
    segmentTree.query(left, right, array);
    
    const newSteps = segmentTree.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-1)]);
    
    setQueryLeft('');
    setQueryRight('');
  };

  // Perform point update
  const performUpdate = () => {
    const index = parseInt(updateIndex);
    const value = parseInt(updateValue);
    
    if (isNaN(index) || isNaN(value) || index < 0 || index >= array.length) return;
    
    const newArray = [...array];
    const segmentTree = reconstructTree();
    segmentTree.update(index, value, newArray);
    
    const newSteps = segmentTree.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-1)]);
    setArray(newArray);
    
    setUpdateIndex('');
    setUpdateValue('');
  };

  // Reconstruct tree from steps
  const reconstructTree = (): SegmentTree => {
    const currentArray = [...array];
    const segmentTree = new SegmentTree(currentArray);
    
    // Replay updates
    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (step.operation === 'update' && step.updateIndex !== undefined && step.updateValue !== undefined) {
        currentArray[step.updateIndex] = step.updateValue;
        segmentTree.update(step.updateIndex, step.updateValue, currentArray);
      }
    }
    
    return segmentTree;
  };

  // Demo operations
  const runDemo = () => {
    const demoArray = [1, 3, 5, 7, 9, 11];
    setArray(demoArray);
    
    const segmentTree = new SegmentTree(demoArray);
    
    // Demo queries and updates
    segmentTree.query(1, 3, demoArray);
    segmentTree.query(2, 5, demoArray);
    segmentTree.update(2, 10, demoArray);
    segmentTree.query(1, 3, demoArray);
    segmentTree.query(0, 5, demoArray);
    
    setSteps(segmentTree.getSteps());
    setCurrentStep(0);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Auto-play animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      intervalId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1100 - speed[0]);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  // Build tree on array change
  useEffect(() => {
    class LocalSegmentTree {
      private tree: number[];
      private size: number;
      private steps: SegmentTreeStep[] = [];

      constructor(arr: number[]) {
        this.size = arr.length;
        this.tree = new Array(4 * this.size).fill(0);
        this.build(arr, 1, 0, this.size - 1);
      }

      private build(arr: number[], node: number, start: number, end: number) {
        if (start === end) {
          this.tree[node] = arr[start];
        } else {
          const mid = Math.floor((start + end) / 2);
          this.build(arr, 2 * node, start, mid);
          this.build(arr, 2 * node + 1, mid + 1, end);
          this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
        }

        this.steps.push({
          description: `Built node ${node} for range [${start}, ${end}] with sum ${this.tree[node]}`,
          operation: 'build',
          tree: [],
          array: [...arr],
          visitedNodes: []
        });
      }

      getSteps(): SegmentTreeStep[] {
        return this.steps;
      }
    }

    const segmentTree = new LocalSegmentTree(array);
    setSteps(segmentTree.getSteps());
    setCurrentStep(0);
  }, [array]);

  const currentStepData = steps[currentStep];

  // Render tree visualization
  const renderTree = () => {
    if (!currentStepData || !currentStepData.tree.length) return null;

    const nodes = currentStepData.tree;
    
    return (
      <div className="relative w-full h-96 overflow-auto bg-gray-50 rounded-lg p-4">
        <svg width="800" height="400" className="mx-auto">
          {/* Render edges first */}
          {nodes.map(node => (
            node.children.map((child) => {
              const parentX = 400 + (node.id - Math.pow(2, node.level)) * (600 / Math.pow(2, node.level)) - 300;
              const parentY = 50 + node.level * 80;
              const childX = 400 + (child.id - Math.pow(2, child.level)) * (600 / Math.pow(2, child.level)) - 300;
              const childY = 50 + child.level * 80;
              
              return (
                <line
                  key={`edge-${node.id}-${child.id}`}
                  x1={parentX}
                  y1={parentY + 20}
                  x2={childX}
                  y2={childY - 20}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              );
            })
          )).flat()}
          
          {/* Render nodes */}
          {nodes.map(node => {
            const x = 400 + (node.id - Math.pow(2, node.level)) * (600 / Math.pow(2, node.level)) - 300;
            const y = 50 + node.level * 80;
            
            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="25"
                  fill={node.isHighlighted ? '#fbbf24' : '#e2e8f0'}
                  stroke={node.isHighlighted ? '#f59e0b' : '#64748b'}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-sm font-bold fill-gray-800"
                >
                  {node.value}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  [{node.left},{node.right}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-4">
            <TreePine className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Cây Phân Đoạn (Segment Tree)</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Cây Phân Đoạn (Segment Tree)"
              description="Segment Tree là cấu trúc dữ liệu dạng cây nhị phân được sử dụng để thực hiện các truy vấn khoảng và cập nhật điểm hiệu quả trên mảng."
              timeComplexity={{
                best: "O(log n)",
                average: "O(log n)", 
                worst: "O(log n)"
              }}
              spaceComplexity="O(4n)"
              principles={[
                "Mỗi nút lưu trữ thông tin của một đoạn",
                "Nút lá đại diện cho phần tử đơn",
                "Nút trong kết hợp thông tin từ con",
                "Chia để trị trong truy vấn và cập nhật"
              ]}
              applications={[
                "Range sum/min/max queries",
                "Lazy propagation cho batch updates",
                "Geometric queries trong 2D",
                "Competitive programming"
              ]}
              advantages={[
                "Truy vấn và cập nhật O(log n)",
                "Linh hoạt cho nhiều phép toán",
                "Hỗ trợ lazy propagation",
                "Cài đặt tương đối đơn giản"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa các thao tác Segment Tree cho truy vấn khoảng và cập nhật điểm hiệu quả.
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
                <label className="text-sm font-medium mb-2 block">Array Size: {arraySize[0]}</label>
                <Slider
                  value={arraySize}
                  onValueChange={setArraySize}
                  min={4}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button onClick={generateArray} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                Generate Array
              </Button>

              <div>
                <label className="text-sm font-medium mb-2 block">Current Array</label>
                <div className="text-sm bg-gray-100 p-2 rounded font-mono">
                  [{array.join(', ')}]
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Range Query</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={queryLeft}
                      onChange={(e) => setQueryLeft(e.target.value)}
                      placeholder="Left"
                      min="0"
                      max={array.length - 1}
                    />
                    <Input
                      type="number"
                      value={queryRight}
                      onChange={(e) => setQueryRight(e.target.value)}
                      placeholder="Right"
                      min="0"
                      max={array.length - 1}
                    />
                  </div>
                  <Button onClick={performQuery} size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    Query Range
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Point Update</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={updateIndex}
                      onChange={(e) => setUpdateIndex(e.target.value)}
                      placeholder="Index"
                      min="0"
                      max={array.length - 1}
                    />
                    <Input
                      type="number"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      placeholder="Value"
                    />
                  </div>
                  <Button onClick={performUpdate} size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-1" />
                    Update
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Speed: {speed[0]}ms</label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={100}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={play} disabled={isPlaying || steps.length === 0} size="sm">
                  Play
                </Button>
                <Button onClick={pause} disabled={!isPlaying} size="sm" variant="outline">
                  Pause
                </Button>
                <Button onClick={reset} size="sm" variant="outline">
                  Reset
                </Button>
                <Button onClick={runDemo} size="sm" variant="outline">
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
                  <span>Array Size:</span>
                  <span className="font-mono">{array.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tree Nodes:</span>
                  <span className="font-mono">{currentStepData?.tree.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operation:</span>
                  <span className="font-mono capitalize">{currentStepData?.operation || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Result:</span>
                  <span className="font-mono">{currentStepData?.result || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Segment Tree Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Build segment tree and perform range queries and point updates'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tree Structure */}
                {renderTree()}

                {/* Operation Info */}
                {currentStepData && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.operation === 'build' ? 'bg-blue-100 text-blue-800' :
                      currentStepData.operation === 'query' ? 'bg-green-100 text-green-800' :
                      currentStepData.operation === 'update' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentStepData.operation.toUpperCase()}
                      {currentStepData.queryLeft !== undefined && currentStepData.queryRight !== undefined && 
                        ` - Range [${currentStepData.queryLeft}, ${currentStepData.queryRight}]`
                      }
                      {currentStepData.updateIndex !== undefined && 
                        ` - Index ${currentStepData.updateIndex}`
                      }
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600"></div>
                    <span>Visited Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-500"></div>
                    <span>Tree Node</span>
                  </div>
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
            <CardTitle>Segment Tree Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Segment Tree is a binary tree data structure used for efficient range queries and point updates on arrays.</p>
              
              <h3>Key Operations</h3>
              <ul>
                <li><strong>Build:</strong> Construct the tree from the input array in O(n) time</li>
                <li><strong>Range Query:</strong> Find sum/min/max over a range [L, R] in O(log n) time</li>
                <li><strong>Point Update:</strong> Update a single element and propagate changes in O(log n) time</li>
              </ul>

              <h3>Tree Structure</h3>
              <ul>
                <li>Each leaf represents an array element</li>
                <li>Each internal node represents some range of elements</li>
                <li>Root represents the entire array range [0, n-1]</li>
                <li>Node i has children at 2*i and 2*i+1</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Build:</strong> O(n) - visit each array element once</li>
                <li><strong>Query:</strong> O(log n) - traverse at most log n levels</li>
                <li><strong>Update:</strong> O(log n) - update path from leaf to root</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(4n) - in worst case, need 4n nodes for complete binary tree</p>

              <h3>Applications</h3>
              <ul>
                <li>Range sum/min/max queries</li>
                <li>Online algorithms requiring frequent updates</li>
                <li>Computational geometry problems</li>
                <li>Database indexing</li>
                <li>Image processing (2D segment trees)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
