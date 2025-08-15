'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  RotateCcw, 
  ListTree, 
  Search, 
  Plus, 
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface SkipListNode {
  value: number;
  forward: (SkipListNode | null)[];
}

interface SkipListStep {
  description: string;
  operation: 'insert' | 'search' | 'build';
  targetValue: number;
  found: boolean;
  searchPath: SkipListNode[];
  comparisons: number;
  levels: SkipListNode[][];
  highlightedNodes: number[];
}

// Skip List implementation
class SkipList {
  private head: SkipListNode;
  private maxLevel: number;
  private currentLevel: number;
  private steps: SkipListStep[] = [];

  constructor(maxLevel: number) {
    this.maxLevel = maxLevel;
    this.currentLevel = 0;
    this.head = {
      value: -Infinity,
      forward: new Array(maxLevel + 1).fill(null)
    };
  }

  private randomLevel(): number {
    let level = 1;
    while (Math.random() < 0.5 && level < this.maxLevel) {
      level++;
    }
    return level;
  }

  insert(value: number) {
    const update: (SkipListNode | null)[] = new Array(this.maxLevel + 1).fill(null);
    let current: SkipListNode | null = this.head;
    let comparisons = 0;
    const searchPath: SkipListNode[] = [];

    for (let level = this.currentLevel; level >= 0; level--) {
      while (current && current.forward[level] && current.forward[level]!.value < value) {
        current = current.forward[level]!;
        searchPath.push(current);
        comparisons++;
      }
      if (current) update[level] = current;
    }

    if (current) current = current.forward[0] || null;
    
    if (current && current.value === value) {
      this.addStep(`Value ${value} already exists in skip list`, 'insert', value, true, searchPath, comparisons);
      return;
    }

    const newLevel = this.randomLevel();
    
    if (newLevel > this.currentLevel) {
      for (let level = this.currentLevel; level < newLevel; level++) {
        update[level] = this.head;
      }
      this.currentLevel = newLevel - 1;
    }

    const newNode: SkipListNode = {
      value: value,
      forward: new Array(newLevel).fill(null)
    };

    for (let level = 0; level < newLevel; level++) {
      if (update[level]) {
        newNode.forward[level] = update[level]!.forward[level];
        update[level]!.forward[level] = newNode;
      }
    }

    this.addStep(`Inserted ${value} at level ${newLevel}`, 'insert', value, true, searchPath, comparisons);
  }

  search(value: number): boolean {
    let current: SkipListNode | null = this.head;
    let comparisons = 0;
    const searchPath: SkipListNode[] = [];

    for (let level = this.currentLevel; level >= 0; level--) {
      while (current && current.forward[level] && current.forward[level]!.value < value) {
        current = current.forward[level]!;
        searchPath.push(current);
        comparisons++;
      }
    }

    if (current) current = current.forward[0] || null;
    
    const found = current !== null && current.value === value;
    this.addStep(
      found ? `Found ${value}` : `${value} not found`,
      'search',
      value,
      found,
      searchPath,
      comparisons
    );
    
    return found;
  }

  private addStep(
    description: string,
    operation: 'insert' | 'search' | 'build',
    targetValue: number,
    found: boolean,
    searchPath: SkipListNode[],
    comparisons: number
  ) {
    const levels = this.getLevels();
    
    this.steps.push({
      description,
      operation,
      targetValue,
      found,
      searchPath: [...searchPath],
      comparisons,
      levels,
      highlightedNodes: searchPath.map(node => node.value)
    });
  }

  private getLevels(): SkipListNode[][] {
    const levels: SkipListNode[][] = [];
    
    for (let level = this.currentLevel; level >= 0; level--) {
      const levelNodes: SkipListNode[] = [];
      let current: SkipListNode | null = this.head.forward[level];
      
      while (current) {
        levelNodes.push(current);
        current = current.forward[level];
      }
      
      levels.push(levelNodes);
    }
    
    return levels;
  }

  getSteps(): SkipListStep[] {
    return this.steps;
  }
}

export default function SkipListPage() {
  const [searchValue, setSearchValue] = useState('');
  const [insertValue, setInsertValue] = useState('');
  const [steps, setSteps] = useState<SkipListStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);
  const [maxLevel] = useState(4);

  // Initialize skip list
  const initializeSkipList = useCallback(() => {
    const skipListInstance = new SkipList(maxLevel);
    const values = [1, 3, 7, 9, 12, 19, 21, 25];
    values.forEach(value => skipListInstance.insert(value));
    
    const newSteps = skipListInstance.getSteps();
    setSteps(newSteps);
    setCurrentStep(0);
  }, [maxLevel]);

  // Perform search
  const performSearch = () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) return;
    
    const skipListInstance = new SkipList(maxLevel);
    const currentData = [1, 3, 7, 9, 12, 19, 21, 25];
    currentData.forEach(v => skipListInstance.insert(v));
    skipListInstance.search(value);
    
    const newSteps = skipListInstance.getSteps();
    setSteps(newSteps);
    setCurrentStep(newSteps.length - 1);
    setSearchValue('');
  };

  // Perform insertion
  const performInsert = () => {
    const value = parseInt(insertValue);
    if (isNaN(value)) return;
    
    const skipListInstance = new SkipList(maxLevel);
    const currentData = [1, 3, 7, 9, 12, 19, 21, 25];
    currentData.forEach(v => skipListInstance.insert(v));
    skipListInstance.insert(value);
    
    const newSteps = skipListInstance.getSteps();
    setSteps(newSteps);
    setCurrentStep(newSteps.length - 1);
    setInsertValue('');
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

  // Initialize on mount
  useEffect(() => {
    initializeSkipList();
  }, [initializeSkipList]);

  const currentStepData = steps[currentStep];

  // Render skip list visualization
  const renderSkipList = () => {
    if (!currentStepData) return null;

    const { levels, highlightedNodes, targetValue, operation } = currentStepData;

    return (
      <div className="space-y-4">
        {levels.map((level, levelIndex) => (
          <div key={levelIndex} className="flex items-center gap-2">
            <div className="w-16 text-right text-sm font-medium text-gray-600">
              Level {levels.length - levelIndex - 1}:
            </div>
            
            <div className="flex items-center gap-1">
              {level.map((node, nodeIndex) => (
                <React.Fragment key={node.value}>
                  <div
                    className={`px-3 py-2 border-2 rounded font-bold text-sm transition-all duration-300 ${
                      highlightedNodes.includes(node.value)
                        ? 'bg-yellow-300 border-yellow-600 transform scale-105'
                        : node.value === targetValue && operation === 'search'
                        ? 'bg-green-300 border-green-600'
                        : 'bg-blue-100 border-blue-400'
                    }`}
                  >
                    {node.value}
                  </div>
                  
                  {nodeIndex < level.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        
        <div className="text-xs text-gray-500 text-center">
          <ArrowDown className="w-4 h-4 mx-auto mb-1" />
          Nodes exist on multiple levels with probability-based distribution
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-4">
            <ListTree className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Danh Sách Bỏ Qua (Skip List)</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Danh Sách Bỏ Qua (Skip List)"
              description="Skip List là cấu trúc dữ liệu xác suất cho phép tìm kiếm, chèn và xóa nhanh chóng bằng cách sử dụng nhiều mức liên kết."
              timeComplexity={{
                best: "O(log n)",
                average: "O(log n)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n log n)"
              principles={[
                "Sử dụng nhiều mức liên kết song song",
                "Mức cao hơn có ít phần tử hơn",
                "Xác suất 1/2 để thăng cấp lên mức cao hơn",
                "Tìm kiếm từ mức cao xuống mức thấp"
              ]}
              applications={[
                "Cơ sở dữ liệu Redis (sorted set)",
                "Hệ thống file system",
                "Caching với thời gian truy cập nhanh",
                "Thay thế cây cân bằng đơn giản"
              ]}
              advantages={[
                "Cài đặt đơn giản hơn cây cân bằng",
                "Tìm kiếm O(log n) trung bình",
                "Hiệu suất tốt trên thực tế",
                "Không cần phép xoay như cây AVL"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa cấu trúc dữ liệu Skip List với cân bằng xác suất.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Value</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Value to search..."
                  />
                  <Button onClick={performSearch} size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Insert Value</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    placeholder="Value to insert..."
                  />
                  <Button onClick={performInsert} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Insert
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
                <Button onClick={initializeSkipList} size="sm" variant="outline">
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
                  <span>Max Level:</span>
                  <span className="font-mono">{maxLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operation:</span>
                  <span className="font-mono capitalize">{currentStepData?.operation || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-mono">{currentStepData?.targetValue || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comparisons:</span>
                  <span className="font-mono">{currentStepData?.comparisons || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Found:</span>
                  <span className="font-mono">{currentStepData?.found ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Skip List Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Probabilistic data structure with multiple levels'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderSkipList()}

                {currentStepData && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.operation === 'insert' ? 'bg-green-100 text-green-800' :
                      currentStepData.operation === 'search' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentStepData.operation.toUpperCase()} - {currentStepData.targetValue}
                      {currentStepData.operation === 'search' && (
                        currentStepData.found ? ' (FOUND)' : ' (NOT FOUND)'
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
                    <span>Search Path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-300 border border-green-600"></div>
                    <span>Target Found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-400"></div>
                    <span>Skip List Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span>Forward Pointer</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Skip List Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>A skip list is a probabilistic data structure that allows fast search, insertion, and deletion operations in O(log n) expected time.</p>
              
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>Multiple Levels:</strong> Each node can exist on multiple levels</li>
                <li><strong>Probabilistic Balancing:</strong> Level assignment based on random probability</li>
                <li><strong>Express Lanes:</strong> Higher levels act as express lanes for faster traversal</li>
                <li><strong>Ordered Structure:</strong> Maintains sorted order across all levels</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Search:</strong> O(log n) expected, O(n) worst case</li>
                <li><strong>Insert:</strong> O(log n) expected, O(n) worst case</li>
                <li><strong>Delete:</strong> O(log n) expected, O(n) worst case</li>
                <li><strong>Space:</strong> O(n) expected</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Database indexing systems</li>
                <li>Priority queues and ordered sets</li>
                <li>Redis sorted sets implementation</li>
                <li>Memory allocation systems</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
