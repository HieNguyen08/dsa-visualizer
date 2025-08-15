"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Shuffle, BarChart4 } from 'lucide-react';

interface ArrayElement {
  value: number;
  color: string;
  isActive: boolean;
  isPivot: boolean;
  isComparing: boolean;
  isSwapping: boolean;
}

interface SortStep {
  array: ArrayElement[];
  description: string;
  comparisons: number;
  swaps: number;
}

type SortingAlgorithm = 'merge' | 'quick' | 'heap' | 'radix' | 'counting';

const COLORS = {
  default: '#3b82f6',
  comparing: '#ef4444',
  swapping: '#10b981',
  pivot: '#f59e0b',
  sorted: '#22c55e',
  active: '#8b5cf6'
};

export default function SortingAdvancedPage() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [sortSteps, setSortSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('merge');
  const [arraySize, setArraySize] = useState([20]);
  const [speed, setSpeed] = useState([500]);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, timeComplexity: '' });

  // Generate random array
  const generateArray = () => {
    const size = arraySize[0];
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < size; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        color: COLORS.default,
        isActive: false,
        isPivot: false,
        isComparing: false,
        isSwapping: false
      });
    }
    setArray(newArray);
    setSortSteps([]);
    setCurrentStep(0);
    setStats({ comparisons: 0, swaps: 0, timeComplexity: getTimeComplexity(algorithm) });
  };

  const getTimeComplexity = (alg: SortingAlgorithm): string => {
    switch (alg) {
      case 'merge': return 'O(n log n)';
      case 'quick': return 'O(n log n) avg, O(n²) worst';
      case 'heap': return 'O(n log n)';
      case 'radix': return 'O(d × (n + k))';
      case 'counting': return 'O(n + k)';
      default: return 'O(n log n)';
    }
  };

  // Merge Sort Implementation
  const mergeSort = (arr: ArrayElement[]): SortStep[] => {
    const steps: SortStep[] = [];
    let comparisons = 0, swaps = 0;
    const arrayCopy = [...arr];

    const merge = (left: number, mid: number, right: number) => {
      const leftArr = arrayCopy.slice(left, mid + 1);
      const rightArr = arrayCopy.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      // Mark elements being merged
      for (let idx = left; idx <= right; idx++) {
        arrayCopy[idx].isActive = true;
      }
      
      steps.push({
        array: arrayCopy.map(el => ({ ...el })),
        description: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
        comparisons,
        swaps
      });

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        if (leftArr[i].value <= rightArr[j].value) {
          arrayCopy[k] = { ...leftArr[i], color: COLORS.sorted };
          i++;
        } else {
          arrayCopy[k] = { ...rightArr[j], color: COLORS.sorted };
          j++;
          swaps++;
        }
        k++;
      }

      while (i < leftArr.length) {
        arrayCopy[k] = { ...leftArr[i], color: COLORS.sorted };
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arrayCopy[k] = { ...rightArr[j], color: COLORS.sorted };
        j++;
        k++;
      }

      // Reset active state
      for (let idx = left; idx <= right; idx++) {
        arrayCopy[idx].isActive = false;
      }

      steps.push({
        array: arrayCopy.map(el => ({ ...el })),
        description: `Merged subarrays [${left}..${right}]`,
        comparisons,
        swaps
      });
    };

    const mergeSortRecursive = (left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortRecursive(left, mid);
        mergeSortRecursive(mid + 1, right);
        merge(left, mid, right);
      }
    };

    mergeSortRecursive(0, arrayCopy.length - 1);
    
    // Final step - mark all as sorted
    arrayCopy.forEach(el => el.color = COLORS.sorted);
    steps.push({
      array: arrayCopy.map(el => ({ ...el })),
      description: 'Merge sort completed! Array is now sorted.',
      comparisons,
      swaps
    });

    return steps;
  };

  // Quick Sort Implementation
  const quickSort = (arr: ArrayElement[]): SortStep[] => {
    const steps: SortStep[] = [];
    let comparisons = 0, swaps = 0;
    const arrayCopy = [...arr];

    const partition = (low: number, high: number): number => {
      const pivot = arrayCopy[high];
      pivot.isPivot = true;
      
      steps.push({
        array: arrayCopy.map(el => ({ ...el })),
        description: `Partitioning with pivot ${pivot.value} at index ${high}`,
        comparisons,
        swaps
      });

      let i = low - 1;

      for (let j = low; j < high; j++) {
        arrayCopy[j].isComparing = true;
        comparisons++;
        
        steps.push({
          array: arrayCopy.map(el => ({ ...el })),
          description: `Comparing ${arrayCopy[j].value} with pivot ${pivot.value}`,
          comparisons,
          swaps
        });

        if (arrayCopy[j].value < pivot.value) {
          i++;
          if (i !== j) {
            // Swap elements
            arrayCopy[i].isSwapping = true;
            arrayCopy[j].isSwapping = true;
            
            [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
            swaps++;
            
            steps.push({
              array: arrayCopy.map(el => ({ ...el })),
              description: `Swapped ${arrayCopy[i].value} and ${arrayCopy[j].value}`,
              comparisons,
              swaps
            });

            arrayCopy[i].isSwapping = false;
            arrayCopy[j].isSwapping = false;
          }
        }
        arrayCopy[j].isComparing = false;
      }

      // Place pivot in correct position
      if (i + 1 !== high) {
        arrayCopy[i + 1].isSwapping = true;
        pivot.isSwapping = true;
        [arrayCopy[i + 1], arrayCopy[high]] = [arrayCopy[high], arrayCopy[i + 1]];
        swaps++;
        
        steps.push({
          array: arrayCopy.map(el => ({ ...el })),
          description: `Placed pivot ${arrayCopy[i + 1].value} in correct position`,
          comparisons,
          swaps
        });

        arrayCopy[i + 1].isSwapping = false;
      }
      
      arrayCopy[i + 1].isPivot = false;
      arrayCopy[i + 1].color = COLORS.sorted;
      
      return i + 1;
    };

    const quickSortRecursive = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortRecursive(low, pi - 1);
        quickSortRecursive(pi + 1, high);
      }
    };

    quickSortRecursive(0, arrayCopy.length - 1);
    
    // Final step
    arrayCopy.forEach(el => {
      el.color = COLORS.sorted;
      el.isPivot = false;
      el.isComparing = false;
      el.isSwapping = false;
    });
    
    steps.push({
      array: arrayCopy.map(el => ({ ...el })),
      description: 'Quick sort completed! Array is now sorted.',
      comparisons,
      swaps
    });

    return steps;
  };

  // Heap Sort Implementation
  const heapSort = (arr: ArrayElement[]): SortStep[] => {
    const steps: SortStep[] = [];
    let comparisons = 0, swaps = 0;
    const arrayCopy = [...arr];
    const n = arrayCopy.length;

    const heapify = (n: number, i: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      arrayCopy[i].isActive = true;
      if (left < n) arrayCopy[left].isComparing = true;
      if (right < n) arrayCopy[right].isComparing = true;

      steps.push({
        array: arrayCopy.map(el => ({ ...el })),
        description: `Heapifying at index ${i}`,
        comparisons,
        swaps
      });

      if (left < n) {
        comparisons++;
        if (arrayCopy[left].value > arrayCopy[largest].value) {
          largest = left;
        }
      }

      if (right < n) {
        comparisons++;
        if (arrayCopy[right].value > arrayCopy[largest].value) {
          largest = right;
        }
      }

      if (largest !== i) {
        arrayCopy[i].isSwapping = true;
        arrayCopy[largest].isSwapping = true;
        
        [arrayCopy[i], arrayCopy[largest]] = [arrayCopy[largest], arrayCopy[i]];
        swaps++;

        steps.push({
          array: arrayCopy.map(el => ({ ...el })),
          description: `Swapped ${arrayCopy[i].value} and ${arrayCopy[largest].value}`,
          comparisons,
          swaps
        });

        arrayCopy[i].isSwapping = false;
        arrayCopy[largest].isSwapping = false;
        heapify(n, largest);
      }

      arrayCopy[i].isActive = false;
      if (left < n) arrayCopy[left].isComparing = false;
      if (right < n) arrayCopy[right].isComparing = false;
    };

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    // Extract elements one by one
    for (let i = n - 1; i > 0; i--) {
      arrayCopy[0].isSwapping = true;
      arrayCopy[i].isSwapping = true;
      
      [arrayCopy[0], arrayCopy[i]] = [arrayCopy[i], arrayCopy[0]];
      swaps++;
      
      arrayCopy[i].color = COLORS.sorted;
      arrayCopy[0].isSwapping = false;
      arrayCopy[i].isSwapping = false;

      steps.push({
        array: arrayCopy.map(el => ({ ...el })),
        description: `Moved maximum ${arrayCopy[i].value} to sorted position`,
        comparisons,
        swaps
      });

      heapify(i, 0);
    }

    arrayCopy[0].color = COLORS.sorted;
    steps.push({
      array: arrayCopy.map(el => ({ ...el })),
      description: 'Heap sort completed! Array is now sorted.',
      comparisons,
      swaps
    });

    return steps;
  };

  const startSorting = () => {
    let steps: SortStep[] = [];
    
    switch (algorithm) {
      case 'merge':
        steps = mergeSort(array);
        break;
      case 'quick':
        steps = quickSort(array);
        break;
      case 'heap':
        steps = heapSort(array);
        break;
      default:
        steps = mergeSort(array);
    }
    
    setSortSteps(steps);
    setCurrentStep(0);
    setStats({ 
      comparisons: 0, 
      swaps: 0, 
      timeComplexity: getTimeComplexity(algorithm) 
    });
  };

  const play = () => {
    if (sortSteps.length === 0) {
      startSorting();
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSortSteps([]);
    generateArray();
  };

  // Auto-play animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying && currentStep < sortSteps.length - 1) {
      intervalId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1100 - speed[0]);
    } else if (currentStep >= sortSteps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isPlaying, currentStep, sortSteps.length, speed]);

  // Update stats when step changes
  useEffect(() => {
    if (sortSteps[currentStep]) {
      setStats(prev => ({
        ...prev,
        comparisons: sortSteps[currentStep].comparisons,
        swaps: sortSteps[currentStep].swaps
      }));
    }
  }, [currentStep, sortSteps]);

  // Initialize array
  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const currentArray = sortSteps[currentStep]?.array || array;
  const currentDescription = sortSteps[currentStep]?.description || 'Click Start to begin sorting';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart4 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Advanced Sorting Algorithms</h1>
        </div>
        <p className="text-gray-600">
          Visualize and compare advanced sorting algorithms: Merge Sort, Quick Sort, Heap Sort, and more.
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
                <label className="text-sm font-medium mb-2 block">Algorithm</label>
                <Select value={algorithm} onValueChange={(value: SortingAlgorithm) => setAlgorithm(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">Merge Sort</SelectItem>
                    <SelectItem value="quick">Quick Sort</SelectItem>
                    <SelectItem value="heap">Heap Sort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Array Size: {arraySize[0]}</label>
                <Slider
                  value={arraySize}
                  onValueChange={setArraySize}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Speed: {speed[0]}ms</label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={50}
                  max={1000}
                  step={50}
                  className="w-full"
                />
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
                <Button onClick={generateArray} size="sm" variant="outline">
                  <Shuffle className="w-4 h-4" />
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
                  <span>Comparisons:</span>
                  <span className="font-mono">{stats.comparisons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Swaps:</span>
                  <span className="font-mono">{stats.swaps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Complexity:</span>
                  <span className="font-mono text-xs">{stats.timeComplexity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{sortSteps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
              <p className="text-sm text-gray-600">{currentDescription}</p>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80 flex items-end justify-center gap-1 p-4 bg-gray-50 rounded-lg overflow-x-auto">
                {currentArray.map((element, index) => {
                  let backgroundColor = element.color;
                  
                  if (element.isPivot) backgroundColor = COLORS.pivot;
                  else if (element.isSwapping) backgroundColor = COLORS.swapping;
                  else if (element.isComparing) backgroundColor = COLORS.comparing;
                  else if (element.isActive) backgroundColor = COLORS.active;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center transition-all duration-300"
                      style={{
                        minWidth: `${Math.max(800 / currentArray.length - 2, 8)}px`,
                      }}
                    >
                      <div
                        className="transition-all duration-300 rounded-t flex items-end justify-center text-xs font-bold text-white"
                        style={{
                          height: `${(element.value / 310) * 250}px`,
                          backgroundColor,
                          width: `${Math.max(800 / currentArray.length - 2, 8)}px`,
                        }}
                      >
                        {currentArray.length <= 30 ? element.value : ''}
                      </div>
                      <div className="text-xs mt-1 text-gray-600">
                        {currentArray.length <= 20 ? index : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.default }}></div>
                  <span>Unsorted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.comparing }}></div>
                  <span>Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.swapping }}></div>
                  <span>Swapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.pivot }}></div>
                  <span>Pivot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.sorted }}></div>
                  <span>Sorted</span>
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
            <CardTitle>Algorithm Information</CardTitle>
          </CardHeader>
          <CardContent>
            {algorithm === 'merge' && (
              <div className="prose max-w-none">
                <h3>Merge Sort</h3>
                <p>A divide-and-conquer algorithm that divides the array into halves, sorts them separately, and then merges them back together.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n log n) in all cases</li>
                  <li><strong>Space Complexity:</strong> O(n) for auxiliary arrays</li>
                  <li><strong>Stability:</strong> Stable (maintains relative order of equal elements)</li>
                  <li><strong>Best Use Case:</strong> When stability is important and worst-case performance matters</li>
                </ul>
              </div>
            )}
            
            {algorithm === 'quick' && (
              <div className="prose max-w-none">
                <h3>Quick Sort</h3>
                <p>A divide-and-conquer algorithm that selects a &quot;pivot&quot; element and partitions the array around the pivot.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n log n) average, O(n²) worst case</li>
                  <li><strong>Space Complexity:</strong> O(log n) for recursion stack</li>
                  <li><strong>Stability:</strong> Not stable</li>
                  <li><strong>Best Use Case:</strong> General-purpose sorting, good average performance</li>
                </ul>
              </div>
            )}
            
            {algorithm === 'heap' && (
              <div className="prose max-w-none">
                <h3>Heap Sort</h3>
                <p>A comparison-based algorithm that uses a binary heap data structure to sort elements.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n log n) in all cases</li>
                  <li><strong>Space Complexity:</strong> O(1) - in-place sorting</li>
                  <li><strong>Stability:</strong> Not stable</li>
                  <li><strong>Best Use Case:</strong> When memory usage is a concern and consistent performance is needed</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
