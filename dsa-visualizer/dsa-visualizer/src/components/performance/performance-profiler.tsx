"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Clock, Zap, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Simple Progress component
const Progress = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

interface PerformanceResult {
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  executionTime: number;
  memoryUsage: number;
  operations: number;
  inputSize: number;
}

interface ComplexityAnalysis {
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stability: boolean;
  adaptive: boolean;
}

const algorithmComplexities: Record<string, ComplexityAnalysis> = {
  'bubble-sort': {
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stability: true,
    adaptive: true
  },
  'quick-sort': {
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stability: false,
    adaptive: false
  },
  'merge-sort': {
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stability: true,
    adaptive: false
  },
  'binary-search': {
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    stability: true,
    adaptive: false
  }
};

const PerformanceProfiler = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble-sort');
  const [inputSizes] = useState([10, 50, 100, 500, 1000]);
  const [performanceData, setPerformanceData] = useState<PerformanceResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ComplexityAnalysis | null>(null);

  // Simulate performance testing
  const runPerformanceTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setPerformanceData([]);

    const results: PerformanceResult[] = [];

    for (let i = 0; i < inputSizes.length; i++) {
      const size = inputSizes[i];
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const complexity = algorithmComplexities[selectedAlgorithm];
      let executionTime: number;
      
      // Calculate simulated execution time based on complexity
      switch (selectedAlgorithm) {
        case 'bubble-sort':
          executionTime = Math.pow(size, 2) * 0.001 + Math.random() * 5;
          break;
        case 'quick-sort':
        case 'merge-sort':
          executionTime = size * Math.log2(size) * 0.01 + Math.random() * 2;
          break;
        case 'binary-search':
          executionTime = Math.log2(size) * 0.1 + Math.random() * 0.5;
          break;
        default:
          executionTime = size * 0.01 + Math.random() * 1;
      }

      const result: PerformanceResult = {
        algorithm: selectedAlgorithm,
        timeComplexity: complexity.timeComplexity.average,
        spaceComplexity: complexity.spaceComplexity,
        executionTime: Math.round(executionTime * 100) / 100,
        memoryUsage: Math.round((size * 4 + Math.random() * 100) * 100) / 100, // bytes
        operations: Math.floor(executionTime * size * 10),
        inputSize: size
      };

      results.push(result);
      setPerformanceData([...results]);
      setProgress(((i + 1) / inputSizes.length) * 100);
    }

    setIsRunning(false);
  };

  const analyzeUserCode = () => {
    const code = userCode.toLowerCase();
    let analysis: ComplexityAnalysis;

    // Simple code analysis (in real app, this would be more sophisticated)
    if (code.includes('for') && code.includes('for')) {
      analysis = {
        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stability: true,
        adaptive: false
      };
    } else if (code.includes('recursion') || code.includes('divide')) {
      analysis = {
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(log n)',
        stability: false,
        adaptive: false
      };
    } else {
      analysis = {
        timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
        spaceComplexity: 'O(1)',
        stability: true,
        adaptive: true
      };
    }

    setAnalysisResult(analysis);
  };

  const getComplexityColor = (complexity: string) => {
    if (complexity.includes('O(1)') || complexity.includes('O(log n)')) return 'text-green-600';
    if (complexity.includes('O(n log n)') || complexity.includes('O(n)')) return 'text-yellow-600';
    if (complexity.includes('O(n²)')) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Algorithm Performance Profiler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="benchmark" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="benchmark" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Benchmark
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Code Analyzer
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Comparison
              </TabsTrigger>
            </TabsList>

            <TabsContent value="benchmark" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Performance Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Algorithm</label>
                      <select 
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="bubble-sort">Bubble Sort</option>
                        <option value="quick-sort">Quick Sort</option>
                        <option value="merge-sort">Merge Sort</option>
                        <option value="binary-search">Binary Search</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Input Sizes</label>
                      <div className="flex gap-2 mt-1">
                        {inputSizes.map((size, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isRunning && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Running tests...</span>
                          <span className="text-sm">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}

                    <Button 
                      onClick={runPerformanceTest}
                      disabled={isRunning}
                      className="w-full"
                    >
                      {isRunning ? 'Running...' : 'Start Performance Test'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Algorithm Complexity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {algorithmComplexities[selectedAlgorithm] && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Time Complexity</h4>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <p className="text-gray-600">Best</p>
                              <p className={getComplexityColor(algorithmComplexities[selectedAlgorithm].timeComplexity.best)}>
                                {algorithmComplexities[selectedAlgorithm].timeComplexity.best}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Average</p>
                              <p className={getComplexityColor(algorithmComplexities[selectedAlgorithm].timeComplexity.average)}>
                                {algorithmComplexities[selectedAlgorithm].timeComplexity.average}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Worst</p>
                              <p className={getComplexityColor(algorithmComplexities[selectedAlgorithm].timeComplexity.worst)}>
                                {algorithmComplexities[selectedAlgorithm].timeComplexity.worst}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Space Complexity</h4>
                          <p className={getComplexityColor(algorithmComplexities[selectedAlgorithm].spaceComplexity)}>
                            {algorithmComplexities[selectedAlgorithm].spaceComplexity}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {algorithmComplexities[selectedAlgorithm].stability ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                            <span>Stable: {algorithmComplexities[selectedAlgorithm].stability ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {algorithmComplexities[selectedAlgorithm].adaptive ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                            <span>Adaptive: {algorithmComplexities[selectedAlgorithm].adaptive ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {performanceData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Execution Time vs Input Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {performanceData.map((data, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium">Size: {data.inputSize}</span>
                            <span className="text-blue-600">{data.executionTime}ms</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {performanceData.map((data, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="font-medium">Size: {data.inputSize}</span>
                            <span className="text-green-600">{data.memoryUsage} bytes</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyzer" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Code Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder="Paste your algorithm code here for complexity analysis..."
                      className="min-h-[200px] font-mono"
                    />
                    <Button onClick={analyzeUserCode} className="mt-4 w-full">
                      Analyze Code Complexity
                    </Button>
                  </CardContent>
                </Card>

                {analysisResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Time Complexity</h4>
                        <div className="space-y-1 text-sm">
                          <p>Best: <span className={getComplexityColor(analysisResult.timeComplexity.best)}>{analysisResult.timeComplexity.best}</span></p>
                          <p>Average: <span className={getComplexityColor(analysisResult.timeComplexity.average)}>{analysisResult.timeComplexity.average}</span></p>
                          <p>Worst: <span className={getComplexityColor(analysisResult.timeComplexity.worst)}>{analysisResult.timeComplexity.worst}</span></p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Space Complexity</h4>
                        <p className={getComplexityColor(analysisResult.spaceComplexity)}>
                          {analysisResult.spaceComplexity}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {analysisResult.stability ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          <span>Stable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {analysisResult.adaptive ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          <span>Adaptive</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Algorithm</th>
                          <th className="text-left p-3">Time (Best)</th>
                          <th className="text-left p-3">Time (Avg)</th>
                          <th className="text-left p-3">Time (Worst)</th>
                          <th className="text-left p-3">Space</th>
                          <th className="text-left p-3">Stable</th>
                          <th className="text-left p-3">Adaptive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(algorithmComplexities).map(([alg, complexity]) => (
                          <tr key={alg} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{alg.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                            <td className={`p-3 ${getComplexityColor(complexity.timeComplexity.best)}`}>
                              {complexity.timeComplexity.best}
                            </td>
                            <td className={`p-3 ${getComplexityColor(complexity.timeComplexity.average)}`}>
                              {complexity.timeComplexity.average}
                            </td>
                            <td className={`p-3 ${getComplexityColor(complexity.timeComplexity.worst)}`}>
                              {complexity.timeComplexity.worst}
                            </td>
                            <td className={`p-3 ${getComplexityColor(complexity.spaceComplexity)}`}>
                              {complexity.spaceComplexity}
                            </td>
                            <td className="p-3">
                              {complexity.stability ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </td>
                            <td className="p-3">
                              {complexity.adaptive ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceProfiler;
