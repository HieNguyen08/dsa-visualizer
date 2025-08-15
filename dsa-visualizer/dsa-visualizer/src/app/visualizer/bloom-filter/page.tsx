"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Filter, Plus, Search, RotateCcw, Hash } from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface BloomFilterStep {
  description: string;
  operation: 'add' | 'query' | 'init';
  element?: string;
  bitArray: boolean[];
  hashIndices?: number[];
  result?: boolean | null;
  falsePositiveRate: number;
  elementsAdded: number;
}

export default function BloomFilterPage() {
  const [inputElement, setInputElement] = useState('');
  const [queryElement, setQueryElement] = useState('');
  const [steps, setSteps] = useState<BloomFilterStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);
  const [filterSize, setFilterSize] = useState([32]);
  const [numHashFunctions, setNumHashFunctions] = useState([3]);

  // Bloom Filter implementation
  class BloomFilter {
    private bitArray: boolean[];
    private size: number;
    private numHashFunctions: number;
    private steps: BloomFilterStep[] = [];
    private elementsAdded: number = 0;

    constructor(size: number, numHashFunctions: number) {
      this.size = size;
      this.numHashFunctions = numHashFunctions;
      this.bitArray = new Array(size).fill(false);

      this.addStep('Bloom Filter initialized with ' + size + ' bits and ' + numHashFunctions + ' hash functions', 'init');
    }

    private addStep(description: string, operation: 'add' | 'query' | 'init', element?: string, hashIndices?: number[], result?: boolean | null) {
      const falsePositiveRate = this.calculateFalsePositiveRate();
      
      this.steps.push({
        description,
        operation,
        element,
        bitArray: [...this.bitArray],
        hashIndices: hashIndices || [],
        result,
        falsePositiveRate,
        elementsAdded: this.elementsAdded
      });
    }

    private calculateFalsePositiveRate(): number {
      if (this.elementsAdded === 0) return 0;
      
      // Formula: (1 - e^(-k*n/m))^k
      // k = number of hash functions, n = number of elements, m = size of bit array
      const k = this.numHashFunctions;
      const n = this.elementsAdded;
      const m = this.size;
      
      return Math.pow(1 - Math.exp(-k * n / m), k) * 100;
    }

    private hash1(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash) % this.size;
    }

    private hash2(str: string): number {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
      }
      return Math.abs(hash) % this.size;
    }

    private hash3(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 6) + (hash << 16) - hash);
      }
      return Math.abs(hash) % this.size;
    }

    private hash4(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 3) + hash + char) % this.size;
      }
      return Math.abs(hash) % this.size;
    }

    private getHashIndices(element: string): number[] {
      const hashFunctions = [this.hash1, this.hash2, this.hash3, this.hash4];
      const indices: number[] = [];
      
      for (let i = 0; i < Math.min(this.numHashFunctions, hashFunctions.length); i++) {
        indices.push(hashFunctions[i].call(this, element));
      }
      
      return indices;
    }

    add(element: string) {
      const hashIndices = this.getHashIndices(element);
      
      this.addStep(`Computing hash indices for "${element}"`, 'add', element, hashIndices);
      
      // Set bits at hash indices
      hashIndices.forEach(index => {
        this.bitArray[index] = true;
      });
      
      this.elementsAdded++;
      
      this.addStep(`Added "${element}" to Bloom Filter. Set bits at positions: ${hashIndices.join(', ')}`, 'add', element, hashIndices);
    }

    query(element: string): boolean {
      const hashIndices = this.getHashIndices(element);
      
      this.addStep(`Checking hash indices for "${element}": ${hashIndices.join(', ')}`, 'query', element, hashIndices);
      
      // Check if all bits are set
      const allBitsSet = hashIndices.every(index => this.bitArray[index]);
      
      const resultDescription = allBitsSet 
        ? `"${element}" might be in the set (all bits set)`
        : `"${element}" is definitely NOT in the set (at least one bit is 0)`;
        
      this.addStep(resultDescription, 'query', element, hashIndices, allBitsSet);
      
      return allBitsSet;
    }

    getSteps(): BloomFilterStep[] {
      return this.steps;
    }
  }

  // Perform operations
  const performAdd = () => {
    if (!inputElement.trim()) return;
    
    const currentFilter = reconstructFilter();
    currentFilter.add(inputElement.trim());
    
    const newSteps = currentFilter.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-2)]);
    
    setInputElement('');
  };

  const performQuery = () => {
    if (!queryElement.trim()) return;
    
    const currentFilter = reconstructFilter();
    currentFilter.query(queryElement.trim());
    
    const newSteps = currentFilter.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-2)]);
    
    setQueryElement('');
  };

  // Reconstruct filter from steps
  const reconstructFilter = (): BloomFilter => {
    const filter = new BloomFilter(filterSize[0], numHashFunctions[0]);
    
    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (step.operation === 'add' && step.element) {
        filter.add(step.element);
      }
    }
    
    return filter;
  };

  // Demo operations
  const runDemo = () => {
    const filter = new BloomFilter(filterSize[0], numHashFunctions[0]);
    
    // Demo sequence
    const elementsToAdd = ['apple', 'banana', 'orange', 'grape', 'cherry'];
    const elementsToQuery = ['apple', 'watermelon', 'banana', 'kiwi', 'orange'];
    
    elementsToAdd.forEach(element => filter.add(element));
    elementsToQuery.forEach(element => filter.query(element));
    
    setSteps(filter.getSteps());
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

  // Initialize filter on mount or parameter change
  useEffect(() => {
    class LocalBloomFilter {
      private bitArray: boolean[];
      private size: number;
      private numHashFunctions: number;
      private steps: BloomFilterStep[] = [];
      private elementsAdded: number = 0;

      constructor(size: number, numHashFunctions: number) {
        this.size = size;
        this.numHashFunctions = numHashFunctions;
        this.bitArray = new Array(size).fill(false);

        this.steps.push({
          description: 'Bloom Filter initialized with ' + size + ' bits and ' + numHashFunctions + ' hash functions',
          operation: 'init',
          bitArray: [...this.bitArray],
          falsePositiveRate: 0,
          elementsAdded: this.elementsAdded
        });
      }

      getSteps(): BloomFilterStep[] {
        return this.steps;
      }
    }
    
    const filter = new LocalBloomFilter(filterSize[0], numHashFunctions[0]);
    const initialSteps = filter.getSteps();
    setSteps(initialSteps);
    setCurrentStep(0);
  }, [filterSize, numHashFunctions]);

  const currentStepData = steps[currentStep];

  // Render bit array visualization
  const renderBitArray = () => {
    if (!currentStepData) return null;

    const bitsPerRow = Math.min(16, filterSize[0]);
    const rows = Math.ceil(filterSize[0] / bitsPerRow);
    
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {Array.from({ length: bitsPerRow }, (_, colIndex) => {
              const bitIndex = rowIndex * bitsPerRow + colIndex;
              if (bitIndex >= filterSize[0]) return null;
              
              const isHighlighted = currentStepData.hashIndices?.includes(bitIndex);
              const bit = currentStepData.bitArray[bitIndex];
              
              return (
                <div key={bitIndex} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{bitIndex}</div>
                  <div className={`w-8 h-8 border-2 rounded flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isHighlighted ? 'bg-yellow-300 border-yellow-600 transform scale-110' :
                    bit ? 'bg-green-200 border-green-500' :
                    'bg-gray-100 border-gray-400'
                  }`}>
                    {bit ? '1' : '0'}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render hash function visualization
  const renderHashFunctions = () => {
    if (!currentStepData || !currentStepData.element || !currentStepData.hashIndices) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-center">Hash Functions for &ldquo;{currentStepData.element}&rdquo;</h4>
        <div className="grid gap-2">
          {currentStepData.hashIndices.map((index, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="font-mono text-sm">h{i + 1}({currentStepData.element})</span>
              </div>
              <span className="text-gray-400">=</span>
              <div className="font-mono font-bold text-blue-600">{index}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bộ Lọc Bloom (Bloom Filter)</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Bộ Lọc Bloom (Bloom Filter)"
              description="Bloom Filter là cấu trúc dữ liệu xác suất tiết kiệm bộ nhớ để kiểm tra sự tồn tại của phần tử trong tập hợp với khả năng có false positive."
              timeComplexity={{
                best: "O(k)",
                average: "O(k)", 
                worst: "O(k)"
              }}
              spaceComplexity="O(m)"
              principles={[
                "Sử dụng nhiều hàm băm độc lập",
                "Mảng bit để lưu trữ thông tin",
                "Không thể xóa phần tử",
                "False positive có thể xảy ra"
              ]}
              applications={[
                "Kiểm tra URL có trong blacklist",
                "Cache layer để tránh truy vấn DB",
                "Tối ưu hóa tìm kiếm trong big data",
                "Phân tán dữ liệu trong NoSQL"
              ]}
              advantages={[
                "Tiết kiệm bộ nhớ",
                "Thời gian kiểm tra cố định O(k)",
                "Không false negative",
                "Dễ song song hóa"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa các thao tác Bloom Filter - cấu trúc dữ liệu xác suất tiết kiệm không gian để kiểm tra tư cách thành viên.
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
                <label className="text-sm font-medium mb-2 block">Filter Size: {filterSize[0]} bits</label>
                <Slider
                  value={filterSize}
                  onValueChange={setFilterSize}
                  min={16}
                  max={64}
                  step={16}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Hash Functions: {numHashFunctions[0]}</label>
                <Slider
                  value={numHashFunctions}
                  onValueChange={setNumHashFunctions}
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Element</label>
                <div className="space-y-2">
                  <Input
                    value={inputElement}
                    onChange={(e) => setInputElement(e.target.value)}
                    placeholder="Enter string"
                  />
                  <Button onClick={performAdd} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Query Element</label>
                <div className="space-y-2">
                  <Input
                    value={queryElement}
                    onChange={(e) => setQueryElement(e.target.value)}
                    placeholder="Enter string"
                  />
                  <Button onClick={performQuery} size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    Query
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Animation Speed: {speed[0]}ms</label>
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
                <Button onClick={play} disabled={isPlaying} size="sm">
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
                  <span>Filter Size:</span>
                  <span className="font-mono">{filterSize[0]} bits</span>
                </div>
                <div className="flex justify-between">
                  <span>Hash Functions:</span>
                  <span className="font-mono">{numHashFunctions[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Elements Added:</span>
                  <span className="font-mono">{currentStepData?.elementsAdded || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bits Set:</span>
                  <span className="font-mono">{currentStepData?.bitArray.filter(bit => bit).length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>False Positive Rate:</span>
                  <span className="font-mono">{currentStepData?.falsePositiveRate?.toFixed(2) || 0}%</span>
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
              <CardTitle>Bloom Filter Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Initialize Bloom Filter and perform operations'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bit Array */}
                <div>
                  <h4 className="font-medium mb-3">Bit Array</h4>
                  {renderBitArray()}
                </div>

                {/* Hash Functions */}
                {currentStepData && currentStepData.element && (
                  <div>
                    {renderHashFunctions()}
                  </div>
                )}

                {/* Operation Result */}
                {currentStepData && currentStepData.operation === 'query' && currentStepData.result !== undefined && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.result 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentStepData.result 
                        ? `"${currentStepData.element}" might be in the set (possible false positive)`
                        : `"${currentStepData.element}" is definitely NOT in the set`
                      }
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
                    <span>Current Operation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-500"></div>
                    <span>Bit Set (1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-400"></div>
                    <span>Bit Not Set (0)</span>
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
            <CardTitle>Bloom Filter Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>A Bloom Filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. It can have false positives but never false negatives.</p>
              
              <h3>Key Properties</h3>
              <ul>
                <li><strong>Space Efficient:</strong> Uses a bit array much smaller than the data set</li>
                <li><strong>Fast Operations:</strong> Both insertion and query are O(k) where k is the number of hash functions</li>
                <li><strong>No False Negatives:</strong> If the filter says an element is not present, it&apos;s definitely not present</li>
                <li><strong>Possible False Positives:</strong> If the filter says an element might be present, it could be a false positive</li>
              </ul>

              <h3>Operations</h3>
              <ul>
                <li><strong>Add:</strong> Hash the element with k hash functions and set corresponding bits to 1</li>
                <li><strong>Query:</strong> Hash the element and check if all corresponding bits are 1</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Add:</strong> O(k) where k is the number of hash functions</li>
                <li><strong>Query:</strong> O(k) where k is the number of hash functions</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(m) where m is the size of the bit array</p>

              <h3>False Positive Rate</h3>
              <p>The probability of false positives is approximately: (1 - e^(-kn/m))^k</p>
              <p>Where k = hash functions, n = inserted elements, m = bit array size</p>

              <h3>Applications</h3>
              <ul>
                <li>Web crawlers (avoiding duplicate URLs)</li>
                <li>Database systems (reducing disk lookups)</li>
                <li>CDN caching (checking if content exists)</li>
                <li>Blockchain (checking transaction existence)</li>
                <li>Spell checkers (word existence)</li>
                <li>Network security (malicious IP detection)</li>
              </ul>

              <h3>Advantages</h3>
              <ul>
                <li>Extremely space efficient</li>
                <li>Fast insertion and lookup</li>
                <li>No false negatives</li>
              </ul>

              <h3>Disadvantages</h3>
              <ul>
                <li>Possible false positives</li>
                <li>Cannot delete elements</li>
                <li>Cannot retrieve stored elements</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
