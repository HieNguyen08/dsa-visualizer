"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Trash2, TreePine, Plus, Minus, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// --- Types ---
interface HeapNode {
  value: number;
  index: number;
  x?: number;
  y?: number;
}

interface HeapOperation {
  type: 'insert' | 'extractMin' | 'extractMax' | 'delete' | 'find';
  value?: number;
  description: string;
  heap: number[];
  highlightedIndices: number[];
}

type HeapType = 'min' | 'max';

const HeapVisualizer = () => {
  const [heap, setHeap] = useState<number[]>([]);
  const [heapType, setHeapType] = useState<HeapType>('min');
  const [inputValue, setInputValue] = useState('');
  const [findValue, setFindValue] = useState('');
  const [currentOperation, setCurrentOperation] = useState<HeapOperation | null>(null);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper functions
  const parent = (i: number): number => Math.floor((i - 1) / 2);
  const leftChild = (i: number): number => 2 * i + 1;
  const rightChild = (i: number): number => 2 * i + 2;

  const compare = useCallback((a: number, b: number): boolean => {
    return heapType === 'min' ? a < b : a > b;
  }, [heapType]);

  const swap = (arr: number[], i: number, j: number): void => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  };

  // Heap operations with animation support
  const heapifyUp = useCallback((arr: number[], index: number): HeapOperation[] => {
    const ops: HeapOperation[] = [];
    let current = index;
    
    while (current > 0) {
      const parentIndex = parent(current);
      
      ops.push({
        type: 'insert',
        description: `Comparing ${arr[current]} at index ${current} with parent ${arr[parentIndex]} at index ${parentIndex}`,
        heap: [...arr],
        highlightedIndices: [current, parentIndex]
      });

      if (compare(arr[current], arr[parentIndex])) {
        swap(arr, current, parentIndex);
        ops.push({
          type: 'insert',
          description: `Swapped ${arr[current]} and ${arr[parentIndex]} to maintain heap property`,
          heap: [...arr],
          highlightedIndices: [current, parentIndex]
        });
        current = parentIndex;
      } else {
        ops.push({
          type: 'insert',
          description: `Heap property satisfied, insertion complete`,
          heap: [...arr],
          highlightedIndices: [current]
        });
        break;
      }
    }

    return ops;
  }, [compare]);

  const heapifyDown = useCallback((arr: number[], index: number, size?: number): HeapOperation[] => {
    const ops: HeapOperation[] = [];
    const heapSize = size || arr.length;
    let current = index;

    while (true) {
      const left = leftChild(current);
      const right = rightChild(current);
      let target = current;

      // Find the appropriate child to compare with
      if (left < heapSize) {
        ops.push({
          type: 'extractMin',
          description: `Comparing ${arr[current]} with left child ${arr[left]}`,
          heap: [...arr],
          highlightedIndices: [current, left]
        });

        if (compare(arr[left], arr[target])) {
          target = left;
        }
      }

      if (right < heapSize) {
        ops.push({
          type: 'extractMin',
          description: `Comparing ${arr[target]} with right child ${arr[right]}`,
          heap: [...arr],
          highlightedIndices: [target, right]
        });

        if (compare(arr[right], arr[target])) {
          target = right;
        }
      }

      if (target === current) {
        ops.push({
          type: 'extractMin',
          description: `Heap property satisfied at index ${current}`,
          heap: [...arr],
          highlightedIndices: [current]
        });
        break;
      }

      swap(arr, current, target);
      ops.push({
        type: 'extractMin',
        description: `Swapped ${arr[current]} and ${arr[target]} to maintain heap property`,
        heap: [...arr],
        highlightedIndices: [current, target]
      });

      current = target;
    }

    return ops;
  }, [compare]);

  const insertValue = useCallback(() => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    const newHeap = [...heap, value];
    const insertOps: HeapOperation[] = [];

    insertOps.push({
      type: 'insert',
      value,
      description: `Inserting ${value} at the end of heap (index ${heap.length})`,
      heap: [...newHeap],
      highlightedIndices: [heap.length]
    });

    // Heapify up
    const heapifyOps = heapifyUp(newHeap, heap.length);
    insertOps.push(...heapifyOps);

    animateOperations(insertOps, newHeap);
    setInputValue('');
  }, [inputValue, heap, heapifyUp]);

  const extractRoot = useCallback(() => {
    if (heap.length === 0) return;

    const newHeap = [...heap];
    const extractOps: HeapOperation[] = [];

    const rootValue = newHeap[0];
    extractOps.push({
      type: heapType === 'min' ? 'extractMin' : 'extractMax',
      description: `Extracting root value ${rootValue}`,
      heap: [...newHeap],
      highlightedIndices: [0]
    });

    if (newHeap.length === 1) {
      newHeap.pop();
      extractOps.push({
        type: heapType === 'min' ? 'extractMin' : 'extractMax',
        description: `Heap is now empty`,
        heap: [...newHeap],
        highlightedIndices: []
      });
    } else {
      // Move last element to root
      newHeap[0] = newHeap[newHeap.length - 1];
      newHeap.pop();

      extractOps.push({
        type: heapType === 'min' ? 'extractMin' : 'extractMax',
        description: `Moved last element ${newHeap[0]} to root position`,
        heap: [...newHeap],
        highlightedIndices: [0]
      });

      // Heapify down
      const heapifyOps = heapifyDown(newHeap, 0);
      extractOps.push(...heapifyOps);
    }

    animateOperations(extractOps, newHeap);
  }, [heap, heapType, heapifyDown]);

  const deleteValue = useCallback(() => {
    const value = parseInt(findValue);
    if (isNaN(value)) return;

    const index = heap.indexOf(value);
    if (index === -1) {
      setCurrentOperation({
        type: 'delete',
        value,
        description: `Value ${value} not found in heap`,
        heap: [...heap],
        highlightedIndices: []
      });
      return;
    }

    const newHeap = [...heap];
    const deleteOps: HeapOperation[] = [];

    deleteOps.push({
      type: 'delete',
      value,
      description: `Found ${value} at index ${index}`,
      heap: [...newHeap],
      highlightedIndices: [index]
    });

    if (index === newHeap.length - 1) {
      // If it's the last element, just remove it
      newHeap.pop();
      deleteOps.push({
        type: 'delete',
        description: `Removed last element ${value}`,
        heap: [...newHeap],
        highlightedIndices: []
      });
    } else {
      // Replace with last element and heapify
      const lastElement = newHeap[newHeap.length - 1];
      newHeap[index] = lastElement;
      newHeap.pop();

      deleteOps.push({
        type: 'delete',
        description: `Replaced ${value} with last element ${lastElement}`,
        heap: [...newHeap],
        highlightedIndices: [index]
      });

      // Try heapifying up first, then down
      const parentIndex = parent(index);
      if (index > 0 && compare(newHeap[index], newHeap[parentIndex])) {
        const heapifyUpOps = heapifyUp(newHeap, index);
        deleteOps.push(...heapifyUpOps);
      } else {
        const heapifyDownOps = heapifyDown(newHeap, index);
        deleteOps.push(...heapifyDownOps);
      }
    }

    animateOperations(deleteOps, newHeap);
    setFindValue('');
  }, [findValue, heap, compare, heapifyUp, heapifyDown]);

  const findValueInHeap = useCallback(() => {
    const value = parseInt(findValue);
    if (isNaN(value)) return;

    const index = heap.indexOf(value);
    if (index === -1) {
      setCurrentOperation({
        type: 'find',
        value,
        description: `Value ${value} not found in heap`,
        heap: [...heap],
        highlightedIndices: []
      });
    } else {
      setCurrentOperation({
        type: 'find',
        value,
        description: `Found ${value} at index ${index}`,
        heap: [...heap],
        highlightedIndices: [index]
      });
      setHighlightedIndices([index]);
    }
  }, [findValue, heap]);

  const animateOperations = (ops: HeapOperation[], finalHeap: number[]) => {
    if (ops.length === 0) return;

    setIsAnimating(true);
    let currentIndex = 0;

    const animate = () => {
      if (currentIndex >= ops.length) {
        setIsAnimating(false);
        setHeap(finalHeap);
        setHighlightedIndices([]);
        setCurrentOperation(null);
        return;
      }

      const operation = ops[currentIndex];
      setCurrentOperation(operation);
      setHighlightedIndices(operation.highlightedIndices);

      if (currentIndex === ops.length - 1) {
        // Last operation, set final heap
        setHeap(operation.heap);
      }

      currentIndex++;
      animationTimeoutRef.current = setTimeout(animate, 1500);
    };

    animate();
  };

  const clearHeap = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setHeap([]);
    setCurrentOperation(null);
    setHighlightedIndices([]);
    setIsAnimating(false);
  };

  const generateRandomHeap = () => {
    const size = Math.floor(Math.random() * 10) + 5;
    const values = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    
    // Build heap properly
    const newHeap: number[] = [];
    setHeap([]);
    
    for (const value of values) {
      newHeap.push(value);
      const tempHeap = [...newHeap];
      heapifyUp(tempHeap, newHeap.length - 1);
      Object.assign(newHeap, tempHeap);
    }
    
    setHeap(newHeap);
    setCurrentOperation(null);
    setHighlightedIndices([]);
  };

  // Calculate positions for tree visualization
  const calculateTreePositions = (heapArray: number[]): HeapNode[] => {
    const nodes: HeapNode[] = [];
    const svgWidth = 800;
    const levelHeight = 60;

    for (let i = 0; i < heapArray.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const positionInLevel = i - (Math.pow(2, level) - 1);
      const totalNodesInLevel = Math.pow(2, level);
      
      const x = (svgWidth / (totalNodesInLevel + 1)) * (positionInLevel + 1);
      const y = 50 + level * levelHeight;

      nodes.push({
        value: heapArray[i],
        index: i,
        x,
        y
      });
    }

    return nodes;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const heapNodes = calculateTreePositions(heap);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Heap Data Structure Visualizer</h1>
        <p className="text-muted-foreground">
          Interactive visualization of min/max heap operations with step-by-step explanations
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="w-5 h-5" />
              Heap Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="heap-type">Heap Type</Label>
              <Select value={heapType} onValueChange={(value: HeapType) => setHeapType(value)} disabled={isAnimating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="min">Min Heap</SelectItem>
                  <SelectItem value="max">Max Heap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={generateRandomHeap} disabled={isAnimating} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Generate Random
              </Button>
              <Button onClick={clearHeap} disabled={isAnimating} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Heap
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heap Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{heap.length}</div>
                <div className="text-sm text-muted-foreground">Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 0}
                </div>
                <div className="text-sm text-muted-foreground">Height</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {heap.length > 0 ? heap[0] : '-'}
                </div>
                <div className="text-sm text-muted-foreground">Root</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{heapType === 'min' ? 'Min' : 'Max'}</div>
                <div className="text-sm text-muted-foreground">Type</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Insert Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="insert-value">Value to Insert</Label>
              <Input
                id="insert-value"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a number"
                disabled={isAnimating}
              />
            </div>
            <Button onClick={insertValue} disabled={isAnimating || !inputValue} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Insert
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minus className="w-5 h-5" />
              Extract Root
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Extract the {heapType === 'min' ? 'minimum' : 'maximum'} value from the heap
            </p>
            <Button onClick={extractRoot} disabled={isAnimating || heap.length === 0} className="w-full">
              <Minus className="w-4 h-4 mr-2" />
              Extract {heapType === 'min' ? 'Min' : 'Max'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find & Delete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="find-value">Value to Find/Delete</Label>
              <Input
                id="find-value"
                type="number"
                value={findValue}
                onChange={(e) => setFindValue(e.target.value)}
                placeholder="Enter a number"
                disabled={isAnimating}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={findValueInHeap} disabled={isAnimating || !findValue} variant="outline" className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Find
              </Button>
              <Button onClick={deleteValue} disabled={isAnimating || !findValue} variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Operation */}
      {currentOperation && (
        <Alert>
          <AlertDescription>
            <strong>Operation:</strong> {currentOperation.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Visualization */}
      <Tabs defaultValue="tree" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tree">Tree View</TabsTrigger>
          <TabsTrigger value="array">Array View</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Heap Tree Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                {heap.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <TreePine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Heap is empty. Insert values to see the tree structure.</p>
                  </div>
                ) : (
                  <svg width="800" height="400" className="mx-auto">
                    {/* Draw edges */}
                    {heapNodes.map((node, index) => {
                      const leftChildIndex = leftChild(index);
                      const rightChildIndex = rightChild(index);
                      
                      return (
                        <g key={`edges-${index}`}>
                          {leftChildIndex < heapNodes.length && (
                            <line
                              x1={node.x}
                              y1={node.y}
                              x2={heapNodes[leftChildIndex].x}
                              y2={heapNodes[leftChildIndex].y}
                              stroke="#6b7280"
                              strokeWidth="2"
                            />
                          )}
                          {rightChildIndex < heapNodes.length && (
                            <line
                              x1={node.x}
                              y1={node.y}
                              x2={heapNodes[rightChildIndex].x}
                              y2={heapNodes[rightChildIndex].y}
                              stroke="#6b7280"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Draw nodes */}
                    {heapNodes.map((node, index) => (
                      <g key={`node-${index}`}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill={
                            highlightedIndices.includes(index)
                              ? "#fbbf24"
                              : index === 0
                              ? heapType === 'min' ? "#10b981" : "#ef4444"
                              : "#e5e7eb"
                          }
                          stroke={highlightedIndices.includes(index) ? "#f59e0b" : "#6b7280"}
                          strokeWidth="2"
                          className="transition-all duration-500"
                        />
                        <text
                          x={node.x}
                          y={(node.y || 0) + 5}
                          textAnchor="middle"
                          className="text-sm font-bold fill-gray-800 select-none"
                        >
                          {node.value}
                        </text>
                        <text
                          x={node.x}
                          y={(node.y || 0) + 35}
                          textAnchor="middle"
                          className="text-xs fill-gray-600 select-none"
                        >
                          [{index}]
                        </text>
                      </g>
                    ))}
                  </svg>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="array" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Heap Array Representation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                {heap.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <p>Heap is empty. Insert values to see the array representation.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Array visualization */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {heap.map((value, index) => (
                        <div
                          key={index}
                          className={`
                            w-16 h-16 flex flex-col items-center justify-center rounded border-2 text-sm font-medium transition-all duration-500
                            ${highlightedIndices.includes(index)
                              ? 'bg-yellow-200 border-yellow-500 text-yellow-900'
                              : index === 0
                              ? heapType === 'min' 
                                ? 'bg-green-200 border-green-500 text-green-900'
                                : 'bg-red-200 border-red-500 text-red-900'
                              : 'bg-gray-200 border-gray-400 text-gray-800'
                            }
                          `}
                        >
                          <div className="font-bold">{value}</div>
                          <div className="text-xs opacity-70">[{index}]</div>
                        </div>
                      ))}
                    </div>

                    {/* Parent-Child relationships */}
                    <div className="text-sm text-muted-foreground text-center">
                      <p><strong>Heap Properties:</strong></p>
                      <p>Parent of index i: [{`Math.floor((i-1)/2)`}]</p>
                      <p>Left child of index i: [2*i+1]</p>
                      <p>Right child of index i: [2*i+2]</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Algorithm Information */}
      <Card>
        <CardHeader>
          <CardTitle>Heap Properties & Complexity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{heapType === 'min' ? 'Min Heap' : 'Max Heap'} Properties</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete binary tree structure</li>
                <li>• {heapType === 'min' ? 'Parent ≤ Children' : 'Parent ≥ Children'} (heap property)</li>
                <li>• Root contains {heapType === 'min' ? 'minimum' : 'maximum'} element</li>
                <li>• Array-based representation</li>
                <li>• Height = O(log n)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Time Complexity</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Insert: O(log n)</li>
                <li>• Extract Min/Max: O(log n)</li>
                <li>• Find: O(n) - linear search</li>
                <li>• Delete: O(log n)</li>
                <li>• Build Heap: O(n)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeapVisualizer;
