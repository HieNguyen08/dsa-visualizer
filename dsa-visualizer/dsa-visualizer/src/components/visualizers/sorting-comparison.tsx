"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Shuffle, RotateCcw, TrendingUp } from 'lucide-react';

// --- Constants ---
const MIN_ARRAY_SIZE = 10;
const MAX_ARRAY_SIZE = 50;
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_ARRAY_SIZE = 20;
const DEFAULT_SPEED = 5;

const PRIMARY_COLOR = '#3b82f6';
const COMPARE_COLOR = '#8b5cf6';
const SWAP_COLOR = '#ef4444';
const SORTED_COLOR = '#10b981';

// --- Types ---
interface Animation {
  type: 'compare' | 'swap';
  indices: [number, number];
  values?: [number, number];
}

interface ComparisonData {
  algorithm: string;
  array: number[];
  animations: Animation[];
  currentStep: number;
  isCompleted: boolean;
  comparisons: number;
  swaps: number;
  timeComplexity: string;
  highlightedIndices: {[key: number]: 'compare' | 'swap'};
}

interface AlgorithmInfo {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

// --- Algorithm Information ---
const algorithmInfo: {[key: string]: AlgorithmInfo} = {
  bubble: {
    name: "Bubble Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description: "So sánh các cặp phần tử liền kề và hoán đổi nếu cần"
  },
  selection: {
    name: "Selection Sort", 
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    description: "Tìm phần tử nhỏ nhất và đưa về đầu dãy"
  },
  insertion: {
    name: "Insertion Sort",
    timeComplexity: "O(n²)", 
    spaceComplexity: "O(1)",
    description: "Chèn từng phần tử vào đúng vị trí trong phần đã sắp xếp"
  },
  quick: {
    name: "Quick Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)", 
    description: "Chia mảng theo pivot và sắp xếp đệ quy"
  },
  merge: {
    name: "Merge Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description: "Chia đôi mảng và trộn lại theo thứ tự"
  },
  heap: {
    name: "Heap Sort", 
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    description: "Sử dụng cấu trúc heap để sắp xếp"
  }
};

// --- Sorting Algorithms (simplified versions for comparison) ---
const bubbleSort = (arr: number[]): { animations: Animation[], comparisons: number, swaps: number } => {
  const animations: Animation[] = [];
  const array = [...arr];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      animations.push({ type: 'compare', indices: [j, j + 1] });
      comparisons++;

      if (array[j] > array[j + 1]) {
        animations.push({ type: 'swap', indices: [j, j + 1], values: [array[j], array[j + 1]] });
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swaps++;
      }
    }
  }

  return { animations, comparisons, swaps };
};

const selectionSort = (arr: number[]): { animations: Animation[], comparisons: number, swaps: number } => {
  const animations: Animation[] = [];
  const array = [...arr];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < array.length - 1; i++) {
    let minIdx = i;
    
    for (let j = i + 1; j < array.length; j++) {
      animations.push({ type: 'compare', indices: [minIdx, j] });
      comparisons++;

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      animations.push({ type: 'swap', indices: [i, minIdx], values: [array[i], array[minIdx]] });
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      swaps++;
    }
  }

  return { animations, comparisons, swaps };
};

const insertionSort = (arr: number[]): { animations: Animation[], comparisons: number, swaps: number } => {
  const animations: Animation[] = [];
  const array = [...arr];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 1; i < array.length; i++) {
    let j = i;
    while (j > 0) {
      animations.push({ type: 'compare', indices: [j - 1, j] });
      comparisons++;

      if (array[j - 1] > array[j]) {
        animations.push({ type: 'swap', indices: [j - 1, j], values: [array[j - 1], array[j]] });
        [array[j - 1], array[j]] = [array[j], array[j - 1]];
        swaps++;
        j--;
      } else {
        break;
      }
    }
  }

  return { animations, comparisons, swaps };
};

const quickSort = (arr: number[]): { animations: Animation[], comparisons: number, swaps: number } => {
  const animations: Animation[] = [];
  const array = [...arr];
  let comparisons = 0;
  let swaps = 0;

  const partition = (low: number, high: number): number => {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      animations.push({ type: 'compare', indices: [j, high] });
      comparisons++;

      if (array[j] <= pivot) {
        i++;
        if (i !== j) {
          animations.push({ type: 'swap', indices: [i, j], values: [array[i], array[j]] });
          [array[i], array[j]] = [array[j], array[i]];
          swaps++;
        }
      }
    }

    animations.push({ type: 'swap', indices: [i + 1, high], values: [array[i + 1], array[high]] });
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    swaps++;
    return i + 1;
  };

  const quickSortHelper = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  };

  quickSortHelper(0, array.length - 1);
  return { animations, comparisons, swaps };
};

const mergeSort = (arr: number[]): { animations: Animation[], comparisons: number, swaps: number } => {
  const animations: Animation[] = [];
  const array = [...arr];
  let comparisons = 0;
  let swaps = 0;

  const merge = (left: number, mid: number, right: number) => {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      animations.push({ type: 'compare', indices: [left + i, mid + 1 + j] });
      comparisons++;

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        animations.push({ type: 'swap', indices: [k, mid + 1 + j], values: [array[k], rightArr[j]] });
        array[k] = rightArr[j];
        swaps++;
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      j++;
      k++;
    }
  };

  const mergeSortHelper = (left: number, right: number) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    }
  };

  mergeSortHelper(0, array.length - 1);
  return { animations, comparisons, swaps };
};

const heapSort = (arr: number[]): { animations: Animation[], comparisons: number, swaps: number } => {
  const animations: Animation[] = [];
  const array = [...arr];
  let comparisons = 0;
  let swaps = 0;

  const heapify = (n: number, i: number) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      animations.push({ type: 'compare', indices: [left, largest] });
      comparisons++;
      if (array[left] > array[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      animations.push({ type: 'compare', indices: [right, largest] });
      comparisons++;
      if (array[right] > array[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      animations.push({ type: 'swap', indices: [i, largest], values: [array[i], array[largest]] });
      [array[i], array[largest]] = [array[largest], array[i]];
      swaps++;
      heapify(n, largest);
    }
  };

  // Build heap
  for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
    heapify(array.length, i);
  }

  // Extract elements from heap
  for (let i = array.length - 1; i > 0; i--) {
    animations.push({ type: 'swap', indices: [0, i], values: [array[0], array[i]] });
    [array[0], array[i]] = [array[i], array[0]];
    swaps++;
    heapify(i, 0);
  }

  return { animations, comparisons, swaps };
};

// --- Main Component ---
const SortingComparison = () => {
  // --- State ---
  const [originalArray, setOriginalArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(DEFAULT_ARRAY_SIZE);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['bubble', 'selection']);
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);

  const speedRef = useRef<number>(speed);
  const animationTimeoutRefs = useRef<{[key: string]: NodeJS.Timeout | null}>({});

  // --- Effects ---
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const generateNewArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 300) + 10
    );
    setOriginalArray([...newArray]);
    
    // Initialize comparison data
    const newComparisons: ComparisonData[] = selectedAlgorithms.map(algorithm => ({
      algorithm,
      array: [...newArray],
      animations: [],
      currentStep: -1,
      isCompleted: false,
      comparisons: 0,
      swaps: 0,
      timeComplexity: algorithmInfo[algorithm]?.timeComplexity || '',
      highlightedIndices: {}
    }));
    
    setComparisons(newComparisons);
  }, [arraySize, selectedAlgorithms]);

  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  const getSortingData = (algorithm: string, array: number[]) => {
    switch (algorithm) {
      case 'bubble': return bubbleSort(array);
      case 'selection': return selectionSort(array);
      case 'insertion': return insertionSort(array);
      case 'quick': return quickSort(array);
      case 'merge': return mergeSort(array);
      case 'heap': return heapSort(array);
      default: return { animations: [], comparisons: 0, swaps: 0 };
    }
  };

  const startSorting = () => {
    if (isAnimating) {
      stopSorting();
      return;
    }

    setIsAnimating(true);

    // Prepare sorting data for each algorithm
    const updatedComparisons = comparisons.map(comp => {
      const { animations, comparisons: compCount, swaps } = getSortingData(comp.algorithm, originalArray);
      return {
        ...comp,
        animations,
        comparisons: compCount,
        swaps,
        currentStep: 0,
        isCompleted: false,
        array: [...originalArray],
        highlightedIndices: {}
      };
    });

    setComparisons(updatedComparisons);

    // Start animations for each algorithm
    updatedComparisons.forEach((comp, index) => {
      animateAlgorithm(comp.algorithm, comp.animations, index);
    });
  };

  const stopSorting = () => {
    setIsAnimating(false);
    Object.values(animationTimeoutRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    animationTimeoutRefs.current = {};
  };

  const animateAlgorithm = (algorithm: string, animations: Animation[], compIndex: number) => {
    let animationIndex = 0;
    // eslint-disable-next-line prefer-const
    let currentArrayState = [...originalArray];

    const animate = () => {
      if (animationIndex >= animations.length) {
        // Mark as completed
        setComparisons(prev => prev.map((comp, index) => 
          index === compIndex ? { ...comp, isCompleted: true, highlightedIndices: {} } : comp
        ));
        
        // Check if all animations are complete
        const allComplete = comparisons.every((comp, index) => 
          index === compIndex || comp.isCompleted
        );
        if (allComplete) {
          setIsAnimating(false);
        }
        return;
      }

      const animation = animations[animationIndex];
      const [barOneIdx, barTwoIdx] = animation.indices;

      if (animation.type === 'compare') {
        // Highlight comparison
        setComparisons(prev => prev.map((comp, index) => 
          index === compIndex ? {
            ...comp,
            currentStep: animationIndex,
            highlightedIndices: { [barOneIdx]: 'compare', [barTwoIdx]: 'compare' }
          } : comp
        ));

        // Clear highlighting after delay
        setTimeout(() => {
          setComparisons(prev => prev.map((comp, index) => 
            index === compIndex ? { ...comp, highlightedIndices: {} } : comp
          ));
        }, (11 - speedRef.current) * 50);

      } else if (animation.type === 'swap' && animation.values) {
        // Highlight swap
        setComparisons(prev => prev.map((comp, index) => 
          index === compIndex ? {
            ...comp,
            currentStep: animationIndex,
            highlightedIndices: { [barOneIdx]: 'swap', [barTwoIdx]: 'swap' }
          } : comp
        ));

        // Perform swap
        [currentArrayState[barOneIdx], currentArrayState[barTwoIdx]] = [animation.values[1], animation.values[0]];
        
        setComparisons(prev => prev.map((comp, index) => 
          index === compIndex ? { ...comp, array: [...currentArrayState] } : comp
        ));

        // Clear highlighting after delay
        setTimeout(() => {
          setComparisons(prev => prev.map((comp, index) => 
            index === compIndex ? { ...comp, highlightedIndices: {} } : comp
          ));
        }, (11 - speedRef.current) * 50);
      }

      animationIndex++;
      animationTimeoutRefs.current[algorithm] = setTimeout(animate, (11 - speedRef.current) * 100);
    };

    animate();
  };

  const resetArrays = () => {
    stopSorting();
    generateNewArray();
  };

  const handleAlgorithmChange = (algorithm: string, isSelected: boolean) => {
    if (isSelected && selectedAlgorithms.length < 4) {
      setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
    } else if (!isSelected) {
      setSelectedAlgorithms(selectedAlgorithms.filter(alg => alg !== algorithm));
    }
  };

  // Helper function to get bar color based on state
  const getBarColor = (compIndex: number, barIndex: number) => {
    const comp = comparisons[compIndex];
    if (comp.isCompleted) return SORTED_COLOR;
    if (comp.highlightedIndices[barIndex]) {
      return comp.highlightedIndices[barIndex] === 'compare' ? COMPARE_COLOR : SWAP_COLOR;
    }
    return PRIMARY_COLOR;
  };

  // Calculate scaled height for rendering
  const getScaledHeight = (value: number, maxValue: number) => {
    const availableHeight = 200;
    const scaleFactor = maxValue > availableHeight ? availableHeight / maxValue : 1;
    return Math.max(value * scaleFactor, 8);
  };

  const availableAlgorithms = Object.keys(algorithmInfo);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Split-Screen Algorithm Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Algorithms (Max 4)</label>
              <div className="grid grid-cols-2 gap-2">
                {availableAlgorithms.map(alg => (
                  <label key={alg} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAlgorithms.includes(alg)}
                      onChange={(e) => handleAlgorithmChange(alg, e.target.checked)}
                      disabled={isAnimating || (!selectedAlgorithms.includes(alg) && selectedAlgorithms.length >= 4)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{algorithmInfo[alg].name}</span>
                  </label>
                ))}
              </div>
            </div>

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
                disabled={selectedAlgorithms.length === 0}
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
                    Start Comparison
                  </>
                )}
              </Button>

              <Button onClick={resetArrays} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className={`grid gap-4 ${
            selectedAlgorithms.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
          }`}>
            {comparisons.map((comp, compIndex) => {
              const maxValue = Math.max(...comp.array);
              const info = algorithmInfo[comp.algorithm];
              
              return (
                <Card key={comp.algorithm} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{info.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                      </div>
                      {comp.isCompleted && (
                        <div className="text-green-600 font-semibold text-sm">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Visualization */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4" style={{ height: '250px' }}>
                      <div className="flex justify-center items-end h-full gap-1">
                        {comp.array.map((value, idx) => (
                          <div
                            key={`${comp.algorithm}-${idx}-${value}`}
                            className="transition-all duration-200 relative flex items-end justify-center"
                            style={{
                              height: `${getScaledHeight(value, maxValue)}px`,
                              width: `${Math.max(400 / comp.array.length, 6)}px`,
                              backgroundColor: getBarColor(compIndex, idx),
                              borderRadius: '2px 2px 0 0',
                              minWidth: '4px',
                            }}
                          >
                            <div
                              className="value-label absolute text-xs font-bold text-gray-800 bg-white px-1 rounded shadow-sm"
                              style={{
                                top: '-20px',
                                fontSize: `${Math.min(10, Math.max(6, 200 / comp.array.length))}px`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Time Complexity:</span>
                        <div className="text-blue-600 font-mono">{info.timeComplexity}</div>
                      </div>
                      <div>
                        <span className="font-medium">Space Complexity:</span>
                        <div className="text-purple-600 font-mono">{info.spaceComplexity}</div>
                      </div>
                      <div>
                        <span className="font-medium">Comparisons:</span>
                        <div className="text-orange-600 font-mono">{comp.comparisons}</div>
                      </div>
                      <div>
                        <span className="font-medium">Swaps:</span>
                        <div className="text-red-600 font-mono">{comp.swaps}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {isAnimating && comp.animations.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{comp.currentStep + 1} / {comp.animations.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                            style={{ 
                              width: `${comp.animations.length > 0 ? ((comp.currentStep + 1) / comp.animations.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary Table */}
          {comparisons.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2">Algorithm</th>
                          <th className="text-left p-2">Time Complexity</th>
                          <th className="text-left p-2">Space Complexity</th>
                          <th className="text-left p-2">Comparisons</th>
                          <th className="text-left p-2">Swaps</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisons.map((comp) => {
                          const info = algorithmInfo[comp.algorithm];
                          return (
                            <tr key={comp.algorithm} className="border-b">
                              <td className="p-2 font-medium">{info.name}</td>
                              <td className="p-2 font-mono text-blue-600">{info.timeComplexity}</td>
                              <td className="p-2 font-mono text-purple-600">{info.spaceComplexity}</td>
                              <td className="p-2 font-mono text-orange-600">{comp.comparisons}</td>
                              <td className="p-2 font-mono text-red-600">{comp.swaps}</td>
                              <td className="p-2">
                                {comp.isCompleted ? (
                                  <span className="text-green-600 font-semibold">✓ Complete</span>
                                ) : isAnimating ? (
                                  <span className="text-blue-600">Running...</span>
                                ) : (
                                  <span className="text-gray-500">Ready</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SortingComparison;
