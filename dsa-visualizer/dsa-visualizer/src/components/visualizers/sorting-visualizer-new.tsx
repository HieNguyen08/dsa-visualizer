"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, Shuffle, RotateCcw, BarChart3, List } from 'lucide-react';

// --- Constants ---
const MIN_ARRAY_SIZE = 5;
const MAX_ARRAY_SIZE = 50;
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_ARRAY_SIZE = 15;
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

interface StepRecord {
  step: number;
  type: 'compare' | 'swap';
  indices: [number, number];
  values: [number, number];
  description: string;
  array: number[];
}

// --- Sorting Algorithms ---
const bubbleSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      // Compare
      animations.push({ type: 'compare', indices: [j, j + 1] });
      records.push({
        step: ++stepCount,
        type: 'compare',
        indices: [j, j + 1],
        values: [array[j], array[j + 1]],
        description: `So sánh ${array[j]} và ${array[j + 1]}`,
        array: [...array]
      });

      if (array[j] > array[j + 1]) {
        // Swap
        animations.push({ type: 'swap', indices: [j, j + 1], values: [array[j], array[j + 1]] });
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        records.push({
          step: ++stepCount,
          type: 'swap',
          indices: [j, j + 1],
          values: [array[j + 1], array[j]],
          description: `Hoán đổi ${array[j + 1]} và ${array[j]} vì ${array[j + 1]} > ${array[j]}`,
          array: [...array]
        });
      }
    }
  }

  return { animations, records };
};

const selectionSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  for (let i = 0; i < array.length - 1; i++) {
    let minIdx = i;
    
    for (let j = i + 1; j < array.length; j++) {
      animations.push({ type: 'compare', indices: [minIdx, j] });
      records.push({
        step: ++stepCount,
        type: 'compare',
        indices: [minIdx, j],
        values: [array[minIdx], array[j]],
        description: `So sánh phần tử nhỏ nhất hiện tại ${array[minIdx]} với ${array[j]}`,
        array: [...array]
      });

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      animations.push({ type: 'swap', indices: [i, minIdx], values: [array[i], array[minIdx]] });
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      records.push({
        step: ++stepCount,
        type: 'swap',
        indices: [i, minIdx],
        values: [array[minIdx], array[i]],
        description: `Hoán đổi ${array[minIdx]} và ${array[i]} để đưa phần tử nhỏ nhất về đúng vị trí`,
        array: [...array]
      });
    }
  }

  return { animations, records };
};

const insertionSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  for (let i = 1; i < array.length; i++) {
    let j = i;
    while (j > 0) {
      animations.push({ type: 'compare', indices: [j - 1, j] });
      records.push({
        step: ++stepCount,
        type: 'compare',
        indices: [j - 1, j],
        values: [array[j - 1], array[j]],
        description: `So sánh ${array[j - 1]} và ${array[j]} để tìm vị trí chèn đúng`,
        array: [...array]
      });

      if (array[j - 1] > array[j]) {
        animations.push({ type: 'swap', indices: [j - 1, j], values: [array[j - 1], array[j]] });
        [array[j - 1], array[j]] = [array[j], array[j - 1]];
        records.push({
          step: ++stepCount,
          type: 'swap',
          indices: [j - 1, j],
          values: [array[j], array[j - 1]],
          description: `Hoán đổi ${array[j]} và ${array[j - 1]} để duy trì thứ tự tăng dần`,
          array: [...array]
        });
        j--;
      } else {
        break;
      }
    }
  }

  return { animations, records };
};

const quickSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  const partition = (low: number, high: number): number => {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      animations.push({ type: 'compare', indices: [j, high] });
      records.push({
        step: ++stepCount,
        type: 'compare',
        indices: [j, high],
        values: [array[j], pivot],
        description: `So sánh ${array[j]} với pivot ${pivot}`,
        array: [...array]
      });

      if (array[j] <= pivot) {
        i++;
        if (i !== j) {
          animations.push({ type: 'swap', indices: [i, j], values: [array[i], array[j]] });
          [array[i], array[j]] = [array[j], array[i]];
          records.push({
            step: ++stepCount,
            type: 'swap',
            indices: [i, j],
            values: [array[j], array[i]],
            description: `Hoán đổi ${array[j]} và ${array[i]} để đưa phần tử nhỏ hơn pivot về phía trái`,
            array: [...array]
          });
        }
      }
    }

    animations.push({ type: 'swap', indices: [i + 1, high], values: [array[i + 1], array[high]] });
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    records.push({
      step: ++stepCount,
      type: 'swap',
      indices: [i + 1, high],
      values: [array[high], array[i + 1]],
      description: `Đặt pivot ${array[i + 1]} về vị trí chính xác`,
      array: [...array]
    });

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
  return { animations, records };
};

const radixSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  const getMaxDigits = (nums: number[]): number => {
    return Math.max(...nums).toString().length;
  };

  const getDigit = (num: number, place: number): number => {
    return Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;
  };

  const maxDigits = getMaxDigits(array);

  for (let k = 0; k < maxDigits; k++) {
    const digitBuckets: number[][] = Array.from({ length: 10 }, () => []);
    
    // Distribute numbers into buckets based on current digit
    for (let i = 0; i < array.length; i++) {
      const digit = getDigit(array[i], k);
      digitBuckets[digit].push(array[i]);
      
      animations.push({ type: 'compare', indices: [i, i] });
      records.push({
        step: ++stepCount,
        type: 'compare',
        indices: [i, i],
        values: [array[i], array[i]],
        description: `Phân loại ${array[i]} vào bucket ${digit} dựa trên chữ số hàng ${Math.pow(10, k)}`,
        array: [...array]
      });
    }

    // Collect numbers back from buckets
    let index = 0;
    for (const bucket of digitBuckets) {
      for (const num of bucket) {
        if (index < array.length && array[index] !== num) {
          animations.push({ type: 'swap', indices: [index, array.indexOf(num)], values: [array[index], num] });
          const oldPos = array.indexOf(num);
          [array[index], array[oldPos]] = [array[oldPos], array[index]];
          
          records.push({
            step: ++stepCount,
            type: 'swap',
            indices: [index, oldPos],
            values: [num, array[oldPos]],
            description: `Đặt ${num} vào vị trí ${index} sau khi sắp xếp theo chữ số hàng ${Math.pow(10, k)}`,
            array: [...array]
          });
        }
        index++;
      }
    }
  }

  return { animations, records };
};

const shellSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  let gap = Math.floor(array.length / 2);

  while (gap > 0) {
    for (let i = gap; i < array.length; i++) {
      const temp = array[i];
      let j = i;

      while (j >= gap) {
        animations.push({ type: 'compare', indices: [j - gap, j] });
        records.push({
          step: ++stepCount,
          type: 'compare',
          indices: [j - gap, j],
          values: [array[j - gap], array[j]],
          description: `So sánh ${array[j - gap]} và ${array[j]} với khoảng cách gap = ${gap}`,
          array: [...array]
        });

        if (array[j - gap] > temp) {
          animations.push({ type: 'swap', indices: [j - gap, j], values: [array[j - gap], array[j]] });
          array[j] = array[j - gap];
          
          records.push({
            step: ++stepCount,
            type: 'swap',
            indices: [j - gap, j],
            values: [array[j - gap], temp],
            description: `Dịch chuyển ${array[j - gap]} sang phải với gap = ${gap}`,
            array: [...array]
          });
          
          j -= gap;
        } else {
          break;
        }
      }
      array[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }

  return { animations, records };
};

const timSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;
  const MIN_MERGE = 32;

  const insertionSortHelper = (left: number, right: number) => {
    for (let i = left + 1; i <= right; i++) {
      const key = array[i];
      let j = i - 1;

      while (j >= left) {
        animations.push({ type: 'compare', indices: [j, j + 1] });
        records.push({
          step: ++stepCount,
          type: 'compare',
          indices: [j, j + 1],
          values: [array[j], key],
          description: `So sánh ${array[j]} và ${key} trong insertion sort`,
          array: [...array]
        });

        if (array[j] > key) {
          animations.push({ type: 'swap', indices: [j, j + 1], values: [array[j], array[j + 1]] });
          array[j + 1] = array[j];
          records.push({
            step: ++stepCount,
            type: 'swap',
            indices: [j, j + 1],
            values: [array[j], key],
            description: `Dịch chuyển ${array[j]} sang phải trong insertion sort`,
            array: [...array]
          });
          j--;
        } else {
          break;
        }
      }
      array[j + 1] = key;
    }
  };

  const merge = (left: number, mid: number, right: number) => {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      animations.push({ type: 'compare', indices: [left + i, mid + 1 + j] });
      records.push({
        step: ++stepCount,
        type: 'compare',
        indices: [left + i, mid + 1 + j],
        values: [leftArr[i], rightArr[j]],
        description: `So sánh ${leftArr[i]} và ${rightArr[j]} trong quá trình merge`,
        array: [...array]
      });

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        animations.push({ type: 'swap', indices: [k, mid + 1 + j], values: [array[k], rightArr[j]] });
        array[k] = rightArr[j];
        records.push({
          step: ++stepCount,
          type: 'swap',
          indices: [k, mid + 1 + j],
          values: [array[k], rightArr[j]],
          description: `Đặt ${rightArr[j]} vào vị trí ${k} trong quá trình merge`,
          array: [...array]
        });
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

  const n = array.length;
  
  // Sort individual subarrays of size MIN_MERGE using insertion sort
  for (let i = 0; i < n; i += MIN_MERGE) {
    insertionSortHelper(i, Math.min(i + MIN_MERGE - 1, n - 1));
  }

  // Start merging from size MIN_MERGE
  let size = MIN_MERGE;
  while (size < n) {
    for (let start = 0; start < n; start += size * 2) {
      const mid = start + size - 1;
      const end = Math.min(start + size * 2 - 1, n - 1);

      if (mid < end) {
        merge(start, mid, end);
      }
    }
    size *= 2;
  }

  return { animations, records };
};

const bucketSort = (arr: number[]): { animations: Animation[], records: StepRecord[] } => {
  const animations: Animation[] = [];
  const records: StepRecord[] = [];
  const array = [...arr];
  let stepCount = 0;

  const n = array.length;
  if (n <= 0) return { animations, records };

  const maxVal = Math.max(...array);
  const minVal = Math.min(...array);
  const bucketCount = Math.floor(Math.sqrt(n));
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  // Distribute elements into buckets
  for (let i = 0; i < n; i++) {
    const bucketIndex = Math.floor(((array[i] - minVal) / (maxVal - minVal + 1)) * bucketCount);
    const actualBucketIndex = Math.min(bucketIndex, bucketCount - 1);
    buckets[actualBucketIndex].push(array[i]);

    animations.push({ type: 'compare', indices: [i, i] });
    records.push({
      step: ++stepCount,
      type: 'compare',
      indices: [i, i],
      values: [array[i], array[i]],
      description: `Đặt ${array[i]} vào bucket ${actualBucketIndex}`,
      array: [...array]
    });
  }

  // Sort each bucket and collect results
  let index = 0;
  for (let i = 0; i < bucketCount; i++) {
    if (buckets[i].length > 0) {
      buckets[i].sort((a, b) => a - b);
      
      for (let j = 0; j < buckets[i].length; j++) {
        if (array[index] !== buckets[i][j]) {
          animations.push({ type: 'swap', indices: [index, array.indexOf(buckets[i][j])], values: [array[index], buckets[i][j]] });
          const oldPos = array.indexOf(buckets[i][j]);
          array[index] = buckets[i][j];
          
          records.push({
            step: ++stepCount,
            type: 'swap',
            indices: [index, oldPos],
            values: [buckets[i][j], array[oldPos]],
            description: `Đặt ${buckets[i][j]} từ bucket ${i} vào vị trí ${index}`,
            array: [...array]
          });
        }
        index++;
      }
    }
  }

  return { animations, records };
};

// --- Main Component ---
const SortingVisualizer = () => {
  // --- State ---
  const [array, setArray] = useState<number[]>([]);
  const [originalArray, setOriginalArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(DEFAULT_ARRAY_SIZE);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [algorithm, setAlgorithm] = useState<string>('bubble');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);

  const speedRef = useRef<number>(speed);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Effects ---
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const generateNewArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 300) + 10
    );
    setArray(newArray);
    setOriginalArray([...newArray]);
    setCurrentStep(-1);
    setAnimations([]);
    setStepRecords([]);
  }, [arraySize]);

  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  const getSortingData = (algorithm: string, array: number[]) => {
    switch (algorithm) {
      case 'bubble':
        return bubbleSort(array);
      case 'selection':
        return selectionSort(array);
      case 'insertion':
        return insertionSort(array);
      case 'quick':
        return quickSort(array);
      case 'radix':
        return radixSort(array);
      case 'shell':
        return shellSort(array);
      case 'tim':
        return timSort(array);
      case 'bucket':
        return bucketSort(array);
      default:
        return { animations: [], records: [] };
    }
  };

  const startSorting = () => {
    if (isAnimating) {
      stopSorting();
      return;
    }

    const { animations: sortAnimations, records } = getSortingData(algorithm, originalArray);
    setAnimations(sortAnimations);
    setStepRecords(records);
    setArray([...originalArray]);
    setCurrentStep(-1);
    setIsAnimating(true);
    animateSort(sortAnimations);
  };

  const stopSorting = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    
    // Reset colors
    const arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      const bar = arrayBars[i] as HTMLElement;
      if (bar && bar.style) {
        bar.style.backgroundColor = PRIMARY_COLOR;
      }
    }
  };

  const resetArray = () => {
    stopSorting();
    setArray([...originalArray]);
    setCurrentStep(-1);
  };

  const animateSort = (animations: Animation[]) => {
    let animationIndex = 0;
    const arrayBars = document.getElementsByClassName('array-bar');

    const animate = () => {
      if (animationIndex >= animations.length) {
        setIsAnimating(false);
        setCurrentStep(animations.length - 1);
        
        // Mark all as sorted
        for (let i = 0; i < arrayBars.length; i++) {
          const bar = arrayBars[i] as HTMLElement;
          if (bar && bar.style) {
            bar.style.backgroundColor = SORTED_COLOR;
          }
        }
        return;
      }

      const animation = animations[animationIndex];
      const [barOneIdx, barTwoIdx] = animation.indices;

      if (animation.type === 'compare') {
        const barOne = arrayBars[barOneIdx] as HTMLElement;
        const barTwo = arrayBars[barTwoIdx] as HTMLElement;

        if (barOne && barTwo) {
          barOne.style.backgroundColor = COMPARE_COLOR;
          barTwo.style.backgroundColor = COMPARE_COLOR;

          setTimeout(() => {
            if (barOne && barTwo) {
              barOne.style.backgroundColor = PRIMARY_COLOR;
              barTwo.style.backgroundColor = PRIMARY_COLOR;
            }
          }, (11 - speedRef.current) * 50);
        }
      } else if (animation.type === 'swap') {
        const barOne = arrayBars[barOneIdx] as HTMLElement;
        const barTwo = arrayBars[barTwoIdx] as HTMLElement;

        if (barOne && barTwo && animation.values) {
          barOne.style.backgroundColor = SWAP_COLOR;
          barTwo.style.backgroundColor = SWAP_COLOR;

          // Calculate scaled heights
          const maxValue = Math.max(...array);
          const availableHeight = 350;
          const scaleFactor = maxValue > availableHeight ? availableHeight / maxValue : 1;
          
          const newHeightOne = Math.max(animation.values[1] * scaleFactor, 10);
          const newHeightTwo = Math.max(animation.values[0] * scaleFactor, 10);

          barOne.style.height = `${newHeightOne}px`;
          barTwo.style.height = `${newHeightTwo}px`;

          // Update array state
          const newArray = [...array];
          [newArray[barOneIdx], newArray[barTwoIdx]] = [animation.values[1], animation.values[0]];
          setArray(newArray);

          // Update value labels
          const labelOne = barOne.querySelector('.value-label') as HTMLElement;
          const labelTwo = barTwo.querySelector('.value-label') as HTMLElement;
          if (labelOne) labelOne.textContent = animation.values[1].toString();
          if (labelTwo) labelTwo.textContent = animation.values[0].toString();

          setTimeout(() => {
            if (barOne && barTwo) {
              barOne.style.backgroundColor = PRIMARY_COLOR;
              barTwo.style.backgroundColor = PRIMARY_COLOR;
            }
          }, (11 - speedRef.current) * 50);
        }
      }

      setCurrentStep(animationIndex);
      animationIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 100);
    };

    animate();
  };

  // Calculate scaled height for rendering
  const getScaledHeight = (value: number) => {
    const maxValue = Math.max(...array);
    const availableHeight = 350;
    const scaleFactor = maxValue > availableHeight ? availableHeight / maxValue : 1;
    return Math.max(value * scaleFactor, 10);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Sorting Algorithms Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isAnimating}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bubble">Bubble Sort</SelectItem>
                  <SelectItem value="selection">Selection Sort</SelectItem>
                  <SelectItem value="insertion">Insertion Sort</SelectItem>
                  <SelectItem value="quick">Quick Sort</SelectItem>
                  <SelectItem value="radix">Radix Sort</SelectItem>
                  <SelectItem value="shell">Shell Sort</SelectItem>
                  <SelectItem value="tim">Tim Sort</SelectItem>
                  <SelectItem value="bucket">Bucket Sort</SelectItem>
                </SelectContent>
              </Select>
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
                    Start Sorting
                  </>
                )}
              </Button>

              <Button onClick={resetArray} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Visualization Tabs */}
          <Tabs defaultValue="bargraph" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bargraph" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Bar Graph
              </TabsTrigger>
              <TabsTrigger value="stepbystep" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Step-by-Step
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bargraph" className="mt-6">
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: '450px' }}>
                <div className="flex justify-center items-end h-full gap-1">
                  {array.map((value, idx) => (
                    <div
                      key={`${idx}-${value}`}
                      className="array-bar transition-all duration-300 relative flex items-end justify-center"
                      style={{
                        height: `${getScaledHeight(value)}px`,
                        width: `${Math.max(600 / array.length, 8)}px`,
                        backgroundColor: PRIMARY_COLOR,
                        borderRadius: '4px 4px 0 0',
                        minWidth: '8px',
                      }}
                    >
                      <div
                        className="value-label absolute text-xs font-bold text-gray-800 bg-white px-1 rounded shadow-sm"
                        style={{
                          top: '-25px',
                          fontSize: `${Math.min(12, Math.max(8, 400 / array.length))}px`,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Info */}
              {isAnimating && animations.length > 0 && currentStep >= 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Animation Progress</h4>
                  <p>Step {currentStep + 1} of {animations.length}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / animations.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stepbystep" className="mt-6">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Step-by-Step View</h3>
                  <p className="text-sm text-gray-600">Current array state after each operation</p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {stepRecords.slice(0, currentStep + 1).map((record, index) => (
                    <div
                      key={index}
                      className={`p-3 border-b ${
                        index === currentStep ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          Step {record.step}: {record.type === 'compare' ? 'Compare' : 'Swap'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Indices [{record.indices[0]}, {record.indices[1]}]
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                      <div className="flex gap-1">
                        {record.array.map((value, idx) => (
                          <div
                            key={idx}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded ${
                              record.indices.includes(idx)
                                ? record.type === 'compare'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {stepRecords.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click &quot;Start Sorting&quot; to see step-by-step process</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Records Table */}
          {stepRecords.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Action Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white border-b">
                        <tr>
                          <th className="text-left p-2">Step</th>
                          <th className="text-left p-2">Action</th>
                          <th className="text-left p-2">Elements</th>
                          <th className="text-left p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stepRecords.slice(0, Math.max(currentStep + 1, 0)).map((record, index) => (
                          <tr
                            key={index}
                            className={`border-b ${
                              index === currentStep ? 'bg-blue-50 font-semibold' : ''
                            }`}
                          >
                            <td className="p-2">{record.step}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                record.type === 'compare'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {record.type === 'compare' ? 'So sánh' : 'Hoán đổi'}
                              </span>
                            </td>
                            <td className="p-2">
                              [{record.indices[0]}: {record.values[0]}, {record.indices[1]}: {record.values[1]}]
                            </td>
                            <td className="p-2">{record.description}</td>
                          </tr>
                        ))}
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

export default SortingVisualizer;
