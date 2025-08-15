"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Shuffle, BarChartHorizontal, ArrowLeft, ArrowRight, RotateCcw, TreePine, Square } from 'lucide-react';

// Dynamically import ReactFlow to avoid SSR issues
const ReactFlow = dynamic(() => import('reactflow').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading...</div>
});

const Controls = dynamic(() => import('reactflow').then(mod => mod.Controls), { ssr: false });
const Background = dynamic(() => import('reactflow').then(mod => mod.Background), { ssr: false });

import { 
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- Constants ---
const MIN_ARRAY_SIZE = 5;
const MAX_ARRAY_SIZE = 31;
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_ARRAY_SIZE = 15;
const DEFAULT_SPEED = 5;

const PRIMARY_COLOR = '#3b82f6';
const COMPARE_COLOR = '#8b5cf6';
const FINAL_COLOR = '#10b981';

// --- Helper Functions ---
const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// --- Types ---
interface HeapAnimation {
  type: 'compare' | 'swap' | 'heapify' | 'sorted';
  indices: [number, number?];
  description: string;
}

interface DetailedStep {
  step: number;
  operation: string;
  description: string;
  array: number[];
  highlight: number[];
  reasoning: string;
}

// --- Heap Sort Algorithm ---
const getHeapSortAnimations = (array: number[]): HeapAnimation[] => {
  const animations: HeapAnimation[] = [];
  const arr = [...array];
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, animations);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    [arr[0], arr[i]] = [arr[i], arr[0]];
    animations.push({
      type: 'swap',
      indices: [0, i],
      description: `Move max element ${arr[i]} to position ${i}`
    });

    // Mark as sorted
    animations.push({
      type: 'sorted',
      indices: [i],
      description: `Element ${arr[i]} is now in final position`
    });

    // Call heapify on the reduced heap
    heapify(arr, i, 0, animations);
  }

  // Mark the last element as sorted
  animations.push({
    type: 'sorted',
    indices: [0],
    description: `Element ${arr[0]} is now in final position`
  });

  return animations;
};

const heapify = (arr: number[], n: number, i: number, animations: HeapAnimation[]) => {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // Compare with left child
  if (left < n) {
    animations.push({
      type: 'compare',
      indices: [largest, left],
      description: `Compare ${arr[largest]} with left child ${arr[left]}`
    });
    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  // Compare with right child
  if (right < n) {
    animations.push({
      type: 'compare',
      indices: [largest, right],
      description: `Compare ${arr[largest]} with right child ${arr[right]}`
    });
    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  // If largest is not root
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    animations.push({
      type: 'swap',
      indices: [i, largest],
      description: `Swap ${arr[largest]} with ${arr[i]} to maintain heap property`
    });

    // Recursively heapify the affected sub-tree
    heapify(arr, n, largest, animations);
  }
};

const getHeapSortDetailedSteps = (array: number[]): DetailedStep[] => {
  const steps: DetailedStep[] = [];
  const arr = [...array];
  const n = arr.length;
  let stepCounter = 1;

  // Build max heap
  steps.push({
    step: stepCounter++,
    operation: 'Build Max Heap',
    description: 'Building max heap from unsorted array',
    array: [...arr],
    highlight: [],
    reasoning: 'Start by converting the array into a max heap structure'
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapifySteps(arr, n, i, steps, stepCounter);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    steps.push({
      step: stepCounter++,
      operation: 'Extract Max',
      description: `Moved max element ${arr[i]} to final position`,
      array: [...arr],
      highlight: [0, i],
      reasoning: `The root (${arr[i]}) is the maximum element, move it to the sorted portion`
    });

    heapifySteps(arr, i, 0, steps, stepCounter);
  }

  return steps;
};

const heapifySteps = (arr: number[], n: number, i: number, steps: DetailedStep[], stepCounter: number) => {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    steps.push({
      step: stepCounter++,
      operation: 'Heapify',
      description: `Swapped ${arr[largest]} with ${arr[i]}`,
      array: [...arr],
      highlight: [i, largest],
      reasoning: `Maintain heap property by ensuring parent is larger than children`
    });

    heapifySteps(arr, n, largest, steps, stepCounter);
  }
};

// --- Tree Generation Functions ---
const generateHeapTree = (array: number[], highlightIndices: number[] = [], sortedIndices: Set<number> = new Set()): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  if (array.length === 0) return { nodes, edges };

  // Calculate positions for heap visualization (complete binary tree)
  const getNodePosition = (index: number) => {
    const level = Math.floor(Math.log2(index + 1));
    const maxNodesAtLevel = Math.pow(2, level);
    const positionInLevel = index - (Math.pow(2, level) - 1);
    
    const levelWidth = 800;
    const nodeSpacing = levelWidth / maxNodesAtLevel;
    const x = (positionInLevel * nodeSpacing) + (nodeSpacing / 2) - (levelWidth / 2);
    const y = level * 80;
    
    return { x, y };
  };

  // Create nodes
  array.forEach((value, index) => {
    const pos = getNodePosition(index);
    const isHighlighted = highlightIndices.includes(index);
    const isSorted = sortedIndices.has(index);
    
    nodes.push({
      id: index.toString(),
      position: pos,
      data: { 
        label: value.toString(),
        value: value,
        index: index
      },
      style: {
        background: isSorted ? FINAL_COLOR : (isHighlighted ? COMPARE_COLOR : PRIMARY_COLOR),
        color: 'white',
        border: '2px solid #000',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
      },
      type: 'default',
    });
  });

  // Create edges (heap relationships)
  array.forEach((_, index) => {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;

    if (leftChild < array.length) {
      edges.push({
        id: `${index}-${leftChild}`,
        source: index.toString(),
        target: leftChild.toString(),
        type: 'straight',
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#000',
        },
      });
    }

    if (rightChild < array.length) {
      edges.push({
        id: `${index}-${rightChild}`,
        source: index.toString(),
        target: rightChild.toString(),
        type: 'straight',
        style: { stroke: '#000', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#000',
        },
      });
    }
  });

  return { nodes, edges };
};

// --- Main Component ---
const HeapSortVisualizer = () => {
  // --- State Management ---
  const [array, setArray] = useState<number[]>([]);
  const [originalArray, setOriginalArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(DEFAULT_ARRAY_SIZE);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [animations, setAnimations] = useState<HeapAnimation[]>([]);
  const [detailedSteps, setDetailedSteps] = useState<DetailedStep[]>([]);
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
  
  // Tree visualization states
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const speedRef = useRef<number>(speed);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update speed ref when speed changes
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // --- ReactFlow handlers ---
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // --- Handlers ---
  const generateNewArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () => 
      randomIntFromInterval(10, 100)
    );
    setArray(newArray);
    setOriginalArray([...newArray]);
    setCurrentStep(-1);
    setAnimations([]);
    setDetailedSteps([]);
    setStepIndex(-1);
    setSortedIndices(new Set());
    
    // Update tree visualization
    const { nodes: newNodes, edges: newEdges } = generateHeapTree(newArray);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [arraySize]);

  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  const startSorting = () => {
    if (isAnimating) {
      stopSorting();
      return;
    }
    
    const sortAnimations = getHeapSortAnimations(originalArray);
    const steps = getHeapSortDetailedSteps(originalArray);
    
    setAnimations(sortAnimations);
    setDetailedSteps(steps);
    setArray([...originalArray]);
    setCurrentStep(-1);
    setStepIndex(-1);
    setSortedIndices(new Set());
    setIsAnimating(true);
    animateSort(sortAnimations, [...originalArray]);
  };

  const animateSort = (animations: HeapAnimation[], initialArray: number[]) => {
    let animationIndex = 0;
    const currentArray = [...initialArray];
    const sorted = new Set<number>();

    const animate = () => {
      if (animationIndex >= animations.length) {
        setIsAnimating(false);
        setCurrentStep(animations.length - 1);
        
        // Mark all as sorted
        const finalSorted = new Set<number>();
        for (let i = 0; i < currentArray.length; i++) {
          finalSorted.add(i);
        }
        setSortedIndices(finalSorted);
        
        // Update tree with final state
        const { nodes: newNodes, edges: newEdges } = generateHeapTree(currentArray, [], finalSorted);
        setNodes(newNodes);
        setEdges(newEdges);
        return;
      }

      const animation = animations[animationIndex];
      const [firstIdx, secondIdx] = animation.indices;

      if (animation.type === 'compare') {
        // Update tree to highlight compared nodes
        if (firstIdx !== undefined && secondIdx !== undefined) {
          const { nodes: newNodes, edges: newEdges } = generateHeapTree(currentArray, [firstIdx, secondIdx], sorted);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      } else if (animation.type === 'swap') {
        // Perform the swap
        if (firstIdx !== undefined && secondIdx !== undefined) {
          [currentArray[firstIdx], currentArray[secondIdx]] = [currentArray[secondIdx], currentArray[firstIdx]];
          setArray([...currentArray]);
          
          // Update tree to show the swap
          const { nodes: newNodes, edges: newEdges } = generateHeapTree(currentArray, [firstIdx, secondIdx], sorted);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      } else if (animation.type === 'sorted') {
        // Mark element as sorted
        if (firstIdx !== undefined) {
          sorted.add(firstIdx);
          setSortedIndices(new Set(sorted));
          
          // Update tree to show sorted element
          const { nodes: newNodes, edges: newEdges } = generateHeapTree(currentArray, [], sorted);
          setNodes(newNodes);
          setEdges(newEdges);
        }
      }

      setCurrentStep(animationIndex);
      animationIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 100);
    };

    animate();
  };

  const stopSorting = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setCurrentStep(-1);
    setArray([...originalArray]);
    setSortedIndices(new Set());
    
    // Reset tree visualization
    const { nodes: newNodes, edges: newEdges } = generateHeapTree(originalArray);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const resetArray = () => {
    setArray([...originalArray]);
    setCurrentStep(-1);
    setAnimations([]);
    setDetailedSteps([]);
    setStepIndex(-1);
    setSortedIndices(new Set());
    setIsAnimating(false);
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Reset tree visualization
    const { nodes: newNodes, edges: newEdges } = generateHeapTree(originalArray);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const toggleStepByStep = () => {
    setIsStepByStep(!isStepByStep);
    if (!isStepByStep) {
      const steps = getHeapSortDetailedSteps(originalArray);
      setDetailedSteps(steps);
      setStepIndex(0);
      if (steps.length > 0) {
        setArray([...steps[0].array]);
      }
    } else {
      setArray([...originalArray]);
      setStepIndex(-1);
    }
  };

  const nextStep = () => {
    if (stepIndex < detailedSteps.length - 1) {
      const newIndex = stepIndex + 1;
      setStepIndex(newIndex);
      setArray([...detailedSteps[newIndex].array]);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      const newIndex = stepIndex - 1;
      setStepIndex(newIndex);
      setArray([...detailedSteps[newIndex].array]);
    }
  };

  // --- Render ---
  return (
    <div className="w-full mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-6 h-6" />
            Heap Sort Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Array Size: {arraySize}</label>
              <Slider
                value={[arraySize]}
                onValueChange={(value) => setArraySize(value[0])}
                min={MIN_ARRAY_SIZE}
                max={MAX_ARRAY_SIZE}
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
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={1}
                className="w-32"
              />
            </div>
            
            <div className="flex gap-2 items-end">
              <Button onClick={generateNewArray} disabled={isAnimating} variant="outline">
                <Shuffle className="w-4 h-4 mr-2" />
                Generate Array
              </Button>
              
              <Button 
                onClick={startSorting} 
                disabled={isStepByStep} 
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
                    Start Heap Sort
                  </>
                )}
              </Button>
              
              <Button onClick={resetArray} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <Button 
                onClick={toggleStepByStep} 
                disabled={isAnimating}
                variant={isStepByStep ? "default" : "outline"}
              >
                Step Mode
              </Button>
            </div>
          </div>

          {/* Step-by-step controls */}
          {isStepByStep && (
            <div className="flex justify-center gap-2 mb-4">
              <Button onClick={prevStep} disabled={stepIndex <= 0} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-4 text-sm font-medium">
                Step {stepIndex + 1} of {detailedSteps.length}
              </span>
              <Button onClick={nextStep} disabled={stepIndex >= detailedSteps.length - 1} variant="outline" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Visualization Tabs */}
          <Tabs defaultValue="array" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="array" className="flex items-center gap-2">
                <BarChartHorizontal className="w-4 h-4" />
                Array View
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex items-center gap-2">
                <TreePine className="w-4 h-4" />
                Heap Tree View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="array" className="mt-4">
              <div className="mb-8">
                <div className="flex justify-center items-end relative bg-gray-50 rounded-lg p-4" style={{ height: '450px', paddingBottom: '50px' }}>
                  {array.map((value, idx) => {
                    const maxValue = Math.max(...array);
                    const availableHeight = 350;
                    const scaleFactor = maxValue > availableHeight ? availableHeight / maxValue : 1;
                    const scaledHeight = Math.max(value * scaleFactor, 10);
                    
                    return (
                      <div
                        key={idx}
                        className="array-bar mx-1 transition-all duration-300 relative flex items-end justify-center"
                        style={{
                          height: `${scaledHeight}px`,
                          width: `${Math.max(800 / array.length, 12)}px`,
                          backgroundColor: sortedIndices.has(idx) ? FINAL_COLOR : PRIMARY_COLOR,
                          borderRadius: '4px 4px 0 0',
                        }}
                      >
                        <div 
                          className="absolute text-xs font-bold text-gray-800 bg-white px-1 rounded shadow-sm"
                          style={{
                            top: '-25px',
                            fontSize: `${Math.min(12, Math.max(8, 800 / array.length / 8))}px`,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tree" className="mt-4">
              <div style={{ height: '500px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>
            </TabsContent>
          </Tabs>

          {/* Algorithm Information and Step Recording */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            <div className="space-y-4">
              {isAnimating && animations.length > 0 && currentStep >= 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Animation Progress</h4>
                  <p>
                    Step {currentStep + 1} of {animations.length}
                    {currentStep >= 0 && animations[currentStep] && (
                      <span className="block mt-1 font-medium text-blue-700">
                        {animations[currentStep].description}
                      </span>
                    )}
                  </p>
                </div>
              )}
              
              {isStepByStep && detailedSteps.length > 0 && stepIndex >= 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Step-by-Step Mode</h4>
                  <p className="font-medium">
                    Step {stepIndex + 1}: {detailedSteps[stepIndex].operation}
                  </p>
                  <p className="text-sm mt-1">{detailedSteps[stepIndex].description}</p>
                  <p className="text-xs text-gray-600 mt-1">{detailedSteps[stepIndex].reasoning}</p>
                </div>
              )}
            </div>

            {/* Step Recording Table */}
            {(detailedSteps.length > 0 || animations.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <h4 className="font-semibold mb-2">Step Recording</h4>
                <div className="text-xs">
                  {isStepByStep && detailedSteps.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-1">Step</th>
                          <th className="p-1">Operation</th>
                          <th className="p-1">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedSteps.slice(0, stepIndex + 1).map((step, index) => (
                          <tr key={index} className={`border-b ${index === stepIndex ? 'bg-blue-100 font-semibold' : ''}`}>
                            <td className="p-1">{step.step}</td>
                            <td className="p-1">{step.operation}</td>
                            <td className="p-1">{step.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : animations.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-1">Step</th>
                          <th className="p-1">Action</th>
                          <th className="p-1">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {animations.slice(0, currentStep + 1).map((animation, index) => (
                          <tr key={index} className={`border-b ${index === currentStep ? 'bg-blue-100 font-semibold' : ''}`}>
                            <td className="p-1">{index + 1}</td>
                            <td className="p-1 capitalize">{animation.type}</td>
                            <td className="p-1">{animation.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Algorithm Information */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2">About Heap Sort</h3>
            <p className="text-sm text-gray-600 mb-2">
              Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure.
              It has a time complexity of O(n log n) for all cases.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Time Complexity:</span>
                <div>Best: O(n log n)</div>
                <div>Average: O(n log n)</div>
                <div>Worst: O(n log n)</div>
              </div>
              <div>
                <span className="font-medium">Space Complexity:</span>
                <div>O(1) - In-place</div>
              </div>
              <div>
                <span className="font-medium">Stability:</span>
                <div>Not stable</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeapSortVisualizer;
