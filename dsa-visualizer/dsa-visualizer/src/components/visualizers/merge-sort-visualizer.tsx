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
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- Constants ---
const MIN_ARRAY_SIZE = 4;
const MAX_ARRAY_SIZE = 32;
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_ARRAY_SIZE = 16;
const DEFAULT_SPEED = 5;

const PRIMARY_COLOR = '#3b82f6';
const MERGE_COLOR = '#f59e0b';

// --- Helper Functions ---
const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// --- Types ---
interface MergeAnimation {
  type: 'divide' | 'merge' | 'compare' | 'place' | 'complete';
  indices: number[];
  values?: number[];
  description: string;
  range?: { start: number; end: number };
}

interface DetailedStep {
  step: number;
  operation: string;
  description: string;
  array: number[];
  highlight: number[];
  reasoning: string;
  leftArray?: number[];
  rightArray?: number[];
  mergedArray?: number[];
}

// --- Tree Build Step Interface ---
interface TreeBuildStep {
  step: number;
  description: string;
  array: number[];
  activeRange: { start: number; end: number } | null;
  action: 'divide' | 'merge' | 'complete';
}

// --- Merge Sort Algorithm ---
const getMergeSortAnimations = (array: number[]): MergeAnimation[] => {
  const animations: MergeAnimation[] = [];
  const auxiliaryArray = array.slice();
  
  mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations);
  
  // Mark completion
  animations.push({
    type: 'complete',
    indices: Array.from({length: array.length}, (_, i) => i),
    description: 'Merge sort completed - array is now fully sorted'
  });
  
  return animations;
};

const mergeSortHelper = (
  mainArray: number[],
  startIdx: number,
  endIdx: number,
  auxiliaryArray: number[],
  animations: MergeAnimation[]
) => {
  if (startIdx === endIdx) return;
  
  // Divide phase
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  
  animations.push({
    type: 'divide',
    indices: [startIdx, endIdx, middleIdx],
    description: `Dividing array from index ${startIdx} to ${endIdx} at position ${middleIdx}`,
    range: { start: startIdx, end: endIdx }
  });
  
  // Recursively sort left and right halves
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  
  // Merge phase
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
};

const doMerge = (
  mainArray: number[],
  startIdx: number,
  middleIdx: number,
  endIdx: number,
  auxiliaryArray: number[],
  animations: MergeAnimation[]
) => {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  
  const leftArray = auxiliaryArray.slice(startIdx, middleIdx + 1);
  const rightArray = auxiliaryArray.slice(middleIdx + 1, endIdx + 1);
  
  animations.push({
    type: 'merge',
    indices: [startIdx, middleIdx, endIdx],
    description: `Merging subarrays [${leftArray.join(', ')}] and [${rightArray.join(', ')}]`,
    range: { start: startIdx, end: endIdx }
  });
  
  while (i <= middleIdx && j <= endIdx) {
    // Compare elements
    animations.push({
      type: 'compare',
      indices: [i, j],
      values: [auxiliaryArray[i], auxiliaryArray[j]],
      description: `Comparing ${auxiliaryArray[i]} and ${auxiliaryArray[j]}`
    });
    
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      mainArray[k] = auxiliaryArray[i];
      animations.push({
        type: 'place',
        indices: [k, i],
        values: [auxiliaryArray[i]],
        description: `Placing ${auxiliaryArray[i]} at position ${k}`
      });
      i++;
    } else {
      mainArray[k] = auxiliaryArray[j];
      animations.push({
        type: 'place',
        indices: [k, j],
        values: [auxiliaryArray[j]],
        description: `Placing ${auxiliaryArray[j]} at position ${k}`
      });
      j++;
    }
    k++;
  }
  
  // Place remaining elements
  while (i <= middleIdx) {
    mainArray[k] = auxiliaryArray[i];
    animations.push({
      type: 'place',
      indices: [k, i],
      values: [auxiliaryArray[i]],
      description: `Placing remaining element ${auxiliaryArray[i]} at position ${k}`
    });
    i++;
    k++;
  }
  
  while (j <= endIdx) {
    mainArray[k] = auxiliaryArray[j];
    animations.push({
      type: 'place',
      indices: [k, j],
      values: [auxiliaryArray[j]],
      description: `Placing remaining element ${auxiliaryArray[j]} at position ${k}`
    });
    j++;
    k++;
  }
};

const getMergeSortDetailedSteps = (array: number[]): DetailedStep[] => {
  const steps: DetailedStep[] = [];
  const workingArray = [...array];
  let stepCounter = 1;
  
  const mergeSortSteps = (arr: number[], left: number, right: number, level: number = 0) => {
    if (left >= right) return;
    
    const mid = Math.floor((left + right) / 2);
    
    // Divide step
    steps.push({
      step: stepCounter++,
      operation: 'Divide',
      description: `Divide array from index ${left} to ${right}`,
      array: [...workingArray],
      highlight: Array.from({length: right - left + 1}, (_, i) => left + i),
      reasoning: `Split the array into smaller subarrays to sort them individually`,
      leftArray: arr.slice(left, mid + 1),
      rightArray: arr.slice(mid + 1, right + 1)
    });
    
    // Recursive calls
    mergeSortSteps(arr, left, mid, level + 1);
    mergeSortSteps(arr, mid + 1, right, level + 1);
    
    // Merge step
    const leftArray = arr.slice(left, mid + 1);
    const rightArray = arr.slice(mid + 1, right + 1);
    
    let i = left, j = mid + 1, k = left;
    const merged = [];
    
    while (i <= mid && j <= right) {
      if (arr[i] <= arr[j]) {
        merged.push(arr[i]);
        workingArray[k] = arr[i];
        i++;
      } else {
        merged.push(arr[j]);
        workingArray[k] = arr[j];
        j++;
      }
      k++;
    }
    
    while (i <= mid) {
      merged.push(arr[i]);
      workingArray[k] = arr[i];
      i++;
      k++;
    }
    
    while (j <= right) {
      merged.push(arr[j]);
      workingArray[k] = arr[j];
      j++;
      k++;
    }
    
    // Copy merged result back
    for (let idx = left; idx <= right; idx++) {
      arr[idx] = workingArray[idx];
    }
    
    steps.push({
      step: stepCounter++,
      operation: 'Merge',
      description: `Merged subarrays to create sorted sequence`,
      array: [...workingArray],
      highlight: Array.from({length: right - left + 1}, (_, i) => left + i),
      reasoning: `Combine two sorted subarrays into one larger sorted subarray`,
      leftArray: leftArray,
      rightArray: rightArray,
      mergedArray: merged
    });
  };
  
  mergeSortSteps(workingArray, 0, array.length - 1);
  
  return steps;
};

// --- Tree Generation Functions ---
const generateTreeBuildSteps = (array: number[]): TreeBuildStep[] => {
  const steps: TreeBuildStep[] = [];
  let stepCounter = 0;
  
  const buildSteps = (arr: number[], start: number, end: number) => {
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    
    // Divide step
    steps.push({
      step: stepCounter++,
      description: `Dividing range [${start}, ${end}] at position ${mid}`,
      array: [...arr],
      activeRange: { start, end },
      action: 'divide'
    });
    
    // Recursive calls
    buildSteps(arr, start, mid);
    buildSteps(arr, mid + 1, end);
    
    // Merge step
    steps.push({
      step: stepCounter++,
      description: `Merging ranges [${start}, ${mid}] and [${mid + 1}, ${end}]`,
      array: [...arr],
      activeRange: { start, end },
      action: 'merge'
    });
  };
  
  buildSteps(array, 0, array.length - 1);
  
  steps.push({
    step: stepCounter++,
    description: 'Merge sort tree construction complete',
    array: [...array],
    activeRange: null,
    action: 'complete'
  });
  
  return steps;
};

const generateTreeFromSteps = (steps: TreeBuildStep[], stepIndex: number): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  if (stepIndex < 0 || !steps[stepIndex]) {
    return { nodes, edges };
  }
  
  const currentStep = steps[stepIndex];
  const array = currentStep.array;
  
  // Simple tree layout for merge sort visualization
  const nodeSpacing = Math.max(60, 800 / array.length);
  
  array.forEach((value, index) => {
    const isInActiveRange = currentStep.activeRange && 
                           index >= currentStep.activeRange.start && 
                           index <= currentStep.activeRange.end;
    
    nodes.push({
      id: index.toString(),
      position: { x: index * nodeSpacing - (array.length * nodeSpacing) / 2, y: 0 },
      data: { 
        label: value.toString(),
        value: value,
        index: index
      },
      style: {
        background: isInActiveRange ? MERGE_COLOR : PRIMARY_COLOR,
        color: 'white',
        border: '2px solid #000',
        borderRadius: '8px',
        width: Math.max(40, nodeSpacing - 10),
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
  
  return { nodes, edges };
};

// --- Main Component ---
const MergeSortVisualizer = () => {
  // --- State Management ---
  const [array, setArray] = useState<number[]>([]);
  const [originalArray, setOriginalArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(DEFAULT_ARRAY_SIZE);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [animations, setAnimations] = useState<MergeAnimation[]>([]);
  const [detailedSteps, setDetailedSteps] = useState<DetailedStep[]>([]);
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  
  // Tree visualization states
  const [treeBuildSteps, setTreeBuildSteps] = useState<TreeBuildStep[]>([]);
  const [currentTreeStepIndex, setCurrentTreeStepIndex] = useState<number>(0);
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
    setHighlightIndices([]);
    
    // Generate tree build steps
    const steps = generateTreeBuildSteps(newArray);
    setTreeBuildSteps(steps);
    setCurrentTreeStepIndex(0);
    
    // Update tree visualization
    const { nodes: newNodes, edges: newEdges } = generateTreeFromSteps(steps, 0);
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
    
    const sortAnimations = getMergeSortAnimations([...originalArray]);
    const steps = getMergeSortDetailedSteps(originalArray);
    
    setAnimations(sortAnimations);
    setDetailedSteps(steps);
    setArray([...originalArray]);
    setCurrentStep(-1);
    setStepIndex(-1);
    setHighlightIndices([]);
    setIsAnimating(true);
    animateSort(sortAnimations, [...originalArray]);
  };

  const animateSort = (animations: MergeAnimation[], initialArray: number[]) => {
    let animationIndex = 0;
    const currentArray = [...initialArray];

    const animate = () => {
      if (animationIndex >= animations.length) {
        setIsAnimating(false);
        setCurrentStep(animations.length - 1);
        setHighlightIndices([]);
        return;
      }

      const animation = animations[animationIndex];

      if (animation.type === 'divide') {
        setHighlightIndices(animation.indices);
      } else if (animation.type === 'compare') {
        setHighlightIndices(animation.indices);
      } else if (animation.type === 'place') {
        const [targetIdx] = animation.indices;
        const [value] = animation.values || [];
        if (value !== undefined) {
          currentArray[targetIdx] = value;
          setArray([...currentArray]);
        }
        setHighlightIndices([targetIdx]);
      } else if (animation.type === 'merge') {
        setHighlightIndices(animation.indices);
      } else if (animation.type === 'complete') {
        setHighlightIndices([]);
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
    setHighlightIndices([]);
  };

  const resetArray = () => {
    setArray([...originalArray]);
    setCurrentStep(-1);
    setAnimations([]);
    setDetailedSteps([]);
    setStepIndex(-1);
    setHighlightIndices([]);
    setIsAnimating(false);
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const toggleStepByStep = () => {
    setIsStepByStep(!isStepByStep);
    if (!isStepByStep) {
      const steps = getMergeSortDetailedSteps(originalArray);
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

  // Tree navigation
  const nextTreeStep = () => {
    if (currentTreeStepIndex < treeBuildSteps.length - 1) {
      const newIndex = currentTreeStepIndex + 1;
      setCurrentTreeStepIndex(newIndex);
      const { nodes: newNodes, edges: newEdges } = generateTreeFromSteps(treeBuildSteps, newIndex);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  const prevTreeStep = () => {
    if (currentTreeStepIndex > 0) {
      const newIndex = currentTreeStepIndex - 1;
      setCurrentTreeStepIndex(newIndex);
      const { nodes: newNodes, edges: newEdges } = generateTreeFromSteps(treeBuildSteps, newIndex);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  const resetTreeAnimation = () => {
    setCurrentTreeStepIndex(0);
    const { nodes: newNodes, edges: newEdges } = generateTreeFromSteps(treeBuildSteps, 0);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // --- Render ---
  return (
    <div className="w-full mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-6 h-6" />
            Merge Sort Visualizer
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
                    Start Merge Sort
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
                Tree View
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
                    
                    const isHighlighted = highlightIndices.includes(idx);
                    
                    return (
                      <div
                        key={idx}
                        className="array-bar mx-1 transition-all duration-300 relative flex items-end justify-center"
                        style={{
                          height: `${scaledHeight}px`,
                          width: `${Math.max(800 / array.length, 12)}px`,
                          backgroundColor: isHighlighted ? MERGE_COLOR : PRIMARY_COLOR,
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
              <div className="mb-4 flex justify-center gap-2">
                <Button
                  onClick={prevTreeStep}
                  disabled={currentTreeStepIndex <= 0}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={resetTreeAnimation}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={nextTreeStep}
                  disabled={currentTreeStepIndex >= treeBuildSteps.length - 1}
                  variant="outline"
                  size="sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
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
              
              {treeBuildSteps[currentTreeStepIndex] && (
                <div className="mt-4 text-center text-sm font-medium">
                  {treeBuildSteps[currentTreeStepIndex].description}
                </div>
              )}
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
                  {detailedSteps[stepIndex].leftArray && detailedSteps[stepIndex].rightArray && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Left: [{detailedSteps[stepIndex].leftArray?.join(', ')}]</span>
                      <span className="ml-4 font-medium">Right: [{detailedSteps[stepIndex].rightArray?.join(', ')}]</span>
                      {detailedSteps[stepIndex].mergedArray && (
                        <span className="block font-medium text-green-700">
                          Merged: [{detailedSteps[stepIndex].mergedArray?.join(', ')}]
                        </span>
                      )}
                    </div>
                  )}
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
            <h3 className="font-semibold mb-2">About Merge Sort</h3>
            <p className="text-sm text-gray-600 mb-2">
              Merge Sort is a divide-and-conquer algorithm that recursively divides the array into smaller subarrays,
              sorts them, and then merges them back together in sorted order.
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
                <div>O(n) - Additional space</div>
              </div>
              <div>
                <span className="font-medium">Stability:</span>
                <div>Stable</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MergeSortVisualizer;
