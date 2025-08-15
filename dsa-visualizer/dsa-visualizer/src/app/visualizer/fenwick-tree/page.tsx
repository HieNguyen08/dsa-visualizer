"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { BarChart3, Plus, Search, Edit, RotateCcw } from 'lucide-react';

interface FenwickTreeStep {
  description: string;
  operation: 'build' | 'query' | 'update';
  array: number[];
  tree: number[];
  queryLeft?: number;
  queryRight?: number;
  updateIndex?: number;
  updateValue?: number;
  result?: number;
  highlightedIndices: number[];
}

export default function FenwickTreePage() {
  const [array, setArray] = useState<number[]>([3, 2, -1, 6, 5, 4, -3, 3]);
  const [queryLeft, setQueryLeft] = useState('');
  const [queryRight, setQueryRight] = useState('');
  const [updateIndex, setUpdateIndex] = useState('');
  const [updateValue, setUpdateValue] = useState('');
  const [steps, setSteps] = useState<FenwickTreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);
  const [arraySize, setArraySize] = useState([8]);

  // Fenwick Tree implementation
  class FenwickTree {
    private tree: number[];
    private size: number;
    private steps: FenwickTreeStep[] = [];
    private highlightedIndices: number[] = [];

    constructor(arr: number[]) {
      this.size = arr.length;
      this.tree = new Array(this.size + 1).fill(0);
      this.build(arr);
    }

    private build(arr: number[]) {
      this.addStep('Building Fenwick Tree from array', 'build', arr);
      
      for (let i = 0; i < arr.length; i++) {
        this.updateTree(i, arr[i]);
        this.addStep(`Added element arr[${i}] = ${arr[i]} to tree`, 'build', arr);
      }
    }

    private addStep(description: string, operation: 'build' | 'query' | 'update', arr: number[], queryL?: number, queryR?: number, updateIdx?: number, updateVal?: number, result?: number) {
      this.steps.push({
        description,
        operation,
        array: [...arr],
        tree: [...this.tree],
        queryLeft: queryL,
        queryRight: queryR,
        updateIndex: updateIdx,
        updateValue: updateVal,
        result,
        highlightedIndices: [...this.highlightedIndices]
      });
    }

    private updateTree(index: number, delta: number) {
      this.highlightedIndices = [];
      index++; // Convert to 1-based indexing
      
      while (index <= this.size) {
        this.highlightedIndices.push(index);
        this.tree[index] += delta;
        index += index & (-index); // Add LSB
      }
    }

    update(index: number, newValue: number, arr: number[]) {
      const oldValue = arr[index];
      const delta = newValue - oldValue;
      arr[index] = newValue;
      
      this.updateTree(index, delta);
      this.addStep(`Updated index ${index} from ${oldValue} to ${newValue} (delta: ${delta})`, 'update', arr, undefined, undefined, index, newValue);
    }

    query(index: number, arr: number[]): number {
      this.highlightedIndices = [];
      let sum = 0;
      index++; // Convert to 1-based indexing
      
      while (index > 0) {
        this.highlightedIndices.push(index);
        sum += this.tree[index];
        index -= index & (-index); // Remove LSB
      }
      
      this.addStep(`Prefix sum up to index ${index - 1} = ${sum}`, 'query', arr, undefined, undefined, undefined, undefined, sum);
      return sum;
    }

    rangeQuery(left: number, right: number, arr: number[]): number {
      let result;
      
      if (left === 0) {
        result = this.query(right, arr);
      } else {
        const rightSum = this.query(right, arr);
        const leftSum = this.query(left - 1, arr);
        result = rightSum - leftSum;
        this.addStep(`Range sum [${left}, ${right}] = ${rightSum} - ${leftSum} = ${result}`, 'query', arr, left, right, undefined, undefined, result);
      }
      
      return result;
    }

    // Helper function to get parent index
    getParent(index: number): number {
      return index - (index & (-index));
    }

    // Helper function to get next index
    getNext(index: number): number {
      return index + (index & (-index));
    }

    getSteps(): FenwickTreeStep[] {
      return this.steps;
    }
  }

  // Generate array
  const generateArray = () => {
    const newArray = Array.from({ length: arraySize[0] }, () => Math.floor(Math.random() * 10) - 5);
    setArray(newArray);
  };

  // Perform range query
  const performQuery = () => {
    const left = parseInt(queryLeft);
    const right = parseInt(queryRight);
    
    if (isNaN(left) || isNaN(right) || left < 0 || right >= array.length || left > right) return;
    
    const fenwickTree = reconstructTree();
    fenwickTree.rangeQuery(left, right, array);
    
    const newSteps = fenwickTree.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-2)]);
    
    setQueryLeft('');
    setQueryRight('');
  };

  // Perform point update
  const performUpdate = () => {
    const index = parseInt(updateIndex);
    const value = parseInt(updateValue);
    
    if (isNaN(index) || isNaN(value) || index < 0 || index >= array.length) return;
    
    const newArray = [...array];
    const fenwickTree = reconstructTree();
    fenwickTree.update(index, value, newArray);
    
    const newSteps = fenwickTree.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-1)]);
    setArray(newArray);
    
    setUpdateIndex('');
    setUpdateValue('');
  };

  // Reconstruct tree from steps
  const reconstructTree = (): FenwickTree => {
    const currentArray = [...array];
    const fenwickTree = new FenwickTree(currentArray);
    
    // Replay updates
    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (step.operation === 'update' && step.updateIndex !== undefined && step.updateValue !== undefined) {
        currentArray[step.updateIndex] = step.updateValue;
        fenwickTree.update(step.updateIndex, step.updateValue, currentArray);
      }
    }
    
    return fenwickTree;
  };

  // Demo operations
  const runDemo = () => {
    const demoArray = [3, 2, -1, 6, 5, 4, -3, 3];
    setArray(demoArray);
    
    const fenwickTree = new FenwickTree(demoArray);
    
    // Demo queries and updates
    fenwickTree.rangeQuery(2, 5, demoArray);
    fenwickTree.rangeQuery(0, 3, demoArray);
    fenwickTree.update(3, 10, demoArray);
    fenwickTree.rangeQuery(2, 5, demoArray);
    fenwickTree.rangeQuery(0, 7, demoArray);
    
    setSteps(fenwickTree.getSteps());
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
    const fenwickTree = new FenwickTree(array);
    setSteps(fenwickTree.getSteps());
    setCurrentStep(0);
  }, [array]);

  const currentStepData = steps[currentStep];

  // Convert index to binary representation
  const toBinary = (num: number) => {
    return num.toString(2).padStart(8, '0');
  };

  // Render tree visualization
  const renderTree = () => {
    if (!currentStepData) return null;

    const tree = currentStepData.tree;
    
    return (
      <div className="space-y-4">
        {/* Array Visualization */}
        <div>
          <h4 className="font-medium mb-2">Original Array</h4>
          <div className="flex gap-1 justify-center">
            {currentStepData.array.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">{index}</div>
                <div className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-sm ${
                  currentStepData.updateIndex === index ? 'bg-green-200 border-green-500' :
                  'bg-white border-gray-400'
                }`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fenwick Tree Visualization */}
        <div>
          <h4 className="font-medium mb-2">Fenwick Tree (Binary Indexed Tree)</h4>
          <div className="flex gap-1 justify-center">
            {tree.slice(1).map((value, index) => {
              const realIndex = index + 1;
              const isHighlighted = currentStepData.highlightedIndices.includes(realIndex);
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">
                    tree[{realIndex}]
                  </div>
                  <div className={`w-16 h-16 border-2 rounded flex flex-col items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isHighlighted ? 'bg-yellow-300 border-yellow-600 transform scale-105' :
                    'bg-blue-100 border-blue-400'
                  }`}>
                    <div>{value}</div>
                    <div className="text-xs text-gray-600">{toBinary(realIndex).slice(-4)}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    LSB: {realIndex & (-realIndex)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Binary Index Explanation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Binary Index Tree Properties</h4>
          <div className="text-sm space-y-2">
            <div><strong>Index i</strong> is responsible for elements in range [(i - LSB(i) + 1), i]</div>
            <div><strong>LSB(i)</strong> = i & (-i) gives the least significant bit</div>
            <div><strong>Parent(i)</strong> = i - LSB(i) for queries</div>
            <div><strong>Next(i)</strong> = i + LSB(i) for updates</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Fenwick Tree (Binary Indexed Tree)</h1>
        </div>
        <p className="text-gray-600">
          Visualize Fenwick Tree operations for efficient prefix sum queries and point updates.
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
                  <span>Operation:</span>
                  <span className="font-mono capitalize">{currentStepData?.operation || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Result:</span>
                  <span className="font-mono">{currentStepData?.result !== undefined ? currentStepData.result : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Highlighted:</span>
                  <span className="font-mono">{currentStepData?.highlightedIndices.length || 0}</span>
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
              <CardTitle>Fenwick Tree Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Build Fenwick Tree and perform range queries and point updates'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                    <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
                    <span>Currently Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-400"></div>
                    <span>Tree Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-500"></div>
                    <span>Updated Element</span>
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
            <CardTitle>Fenwick Tree Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Fenwick Tree (Binary Indexed Tree) is a data structure that efficiently supports prefix sum queries and point updates on arrays.</p>
              
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>LSB (Least Significant Bit):</strong> LSB(i) = i & (-i) determines tree structure</li>
                <li><strong>Tree Index:</strong> tree[i] stores cumulative frequency for a specific range</li>
                <li><strong>Range Responsibility:</strong> tree[i] covers range [(i - LSB(i) + 1), i]</li>
                <li><strong>1-based Indexing:</strong> Uses 1-based indexing internally for easier bit manipulation</li>
              </ul>

              <h3>Operations</h3>
              <ul>
                <li><strong>Build:</strong> Initialize tree by adding each element using update operation</li>
                <li><strong>Prefix Query:</strong> Sum elements from index 0 to i by traversing parent nodes</li>
                <li><strong>Range Query:</strong> query(right) - query(left-1) for range [left, right]</li>
                <li><strong>Point Update:</strong> Update single element and propagate to affected tree nodes</li>
              </ul>

              <h3>Bit Manipulation</h3>
              <ul>
                <li><strong>Parent Node:</strong> parent(i) = i - (i & (-i)) for queries</li>
                <li><strong>Next Node:</strong> next(i) = i + (i & (-i)) for updates</li>
                <li><strong>LSB Isolation:</strong> i & (-i) isolates the least significant bit</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Build:</strong> O(n log n) - n updates, each taking O(log n)</li>
                <li><strong>Query:</strong> O(log n) - traverse at most log n parent nodes</li>
                <li><strong>Update:</strong> O(log n) - update at most log n tree nodes</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(n) - same size as input array plus one for 1-based indexing</p>

              <h3>Advantages over Segment Tree</h3>
              <ul>
                <li>More memory efficient (same space as array)</li>
                <li>Simpler implementation</li>
                <li>Better cache performance</li>
                <li>Elegant bit manipulation approach</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Range sum queries with point updates</li>
                <li>Counting inversions in arrays</li>
                <li>2D range sum queries (2D Fenwick Tree)</li>
                <li>Order statistics problems</li>
                <li>Coordinate compression problems</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
