"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Brain, Lightbulb, Code2, ChevronRight, CheckCircle2 } from 'lucide-react';

// Simple Badge component
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  code?: string;
  visualization?: string;
  completed: boolean;
}

interface AlgorithmTutorial {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  useCase: string;
  steps: TutorialStep[];
}

const algorithms: AlgorithmTutorial[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Beginner',
    description: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    useCase: 'Educational purposes, small datasets',
    steps: [
      {
        id: '1',
        title: 'Hiểu nguyên lý cơ bản',
        content: 'Bubble Sort hoạt động bằng cách so sánh từng cặp phần tử kề nhau trong mảng và hoán đổi chúng nếu chúng không đúng thứ tự. Quá trình này được lặp lại cho đến khi không còn hoán đổi nào xảy ra.',
        completed: false
      },
      {
        id: '2', 
        title: 'Các bước thực hiện',
        content: '1. Bắt đầu từ phần tử đầu tiên\n2. So sánh với phần tử kế tiếp\n3. Hoán đổi nếu thứ tự sai\n4. Tiếp tục cho đến cuối mảng\n5. Lặp lại quá trình',
        completed: false
      },
      {
        id: '3',
        title: 'Cài đặt thuật toán',
        content: 'Dưới đây là cách cài đặt Bubble Sort trong JavaScript:',
        code: `function bubbleSort(arr) {
    let n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Hoán đổi
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        
        // Nếu không có hoán đổi nào, mảng đã sắp xếp
        if (!swapped) break;
    }
    
    return arr;
}`,
        completed: false
      },
      {
        id: '4',
        title: 'Phân tích độ phức tạp',
        content: 'Time Complexity: O(n²) trong trường hợp xấu nhất, O(n) trong trường hợp tốt nhất khi mảng đã sắp xếp.\nSpace Complexity: O(1) vì chỉ sử dụng một lượng bộ nhớ cố định.',
        completed: false
      }
    ]
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'Intermediate',
    description: 'Binary Search is an efficient algorithm for finding an item from a sorted list of items by repeatedly dividing the search interval in half.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    useCase: 'Searching in sorted arrays, databases',
    steps: [
      {
        id: '1',
        title: 'Nguyên lý hoạt động',
        content: 'Binary Search hoạt động trên nguyên tắc "chia để trị". Thuật toán liên tục chia đôi không gian tìm kiếm bằng cách so sánh phần tử cần tìm với phần tử ở giữa.',
        completed: false
      },
      {
        id: '2',
        title: 'Điều kiện tiên quyết',
        content: 'Mảng phải được sắp xếp trước khi sử dụng Binary Search. Đây là điều kiện bắt buộc để thuật toán hoạt động đúng.',
        completed: false
      },
      {
        id: '3',
        title: 'Các bước thực hiện',
        content: '1. Xác định điểm giữa của mảng\n2. So sánh phần tử cần tìm với phần tử giữa\n3. Nếu bằng nhau: tìm thấy\n4. Nếu nhỏ hơn: tìm ở nửa trái\n5. Nếu lớn hơn: tìm ở nửa phải\n6. Lặp lại cho đến khi tìm thấy hoặc hết không gian',
        completed: false
      },
      {
        id: '4',
        title: 'Cài đặt thuật toán',
        content: 'Cài đặt Binary Search bằng JavaScript:',
        code: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid; // Tìm thấy
        }
        
        if (arr[mid] < target) {
            left = mid + 1; // Tìm ở nửa phải
        } else {
            right = mid - 1; // Tìm ở nửa trái
        }
    }
    
    return -1; // Không tìm thấy
}`,
        completed: false
      }
    ]
  }
];

const AlgorithmTutorial = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmTutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
  };

  const nextStep = () => {
    if (selectedAlgorithm && currentStep < selectedAlgorithm.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <BookOpen className="w-6 h-6" />
            Algorithm Learning Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Algorithm List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Algorithms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {algorithms.map((algorithm) => {
                    const completedCount = algorithm.steps.filter(step => 
                      completedSteps.has(step.id)
                    ).length;
                    const progress = (completedCount / algorithm.steps.length) * 100;

                    return (
                      <div
                        key={algorithm.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAlgorithm?.id === algorithm.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedAlgorithm(algorithm);
                          setCurrentStep(0);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{algorithm.name}</h4>
                            <p className="text-sm text-gray-600">{algorithm.category}</p>
                          </div>
                          <Badge className={getDifficultyColor(algorithm.difficulty)}>
                            {algorithm.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>{completedCount}/{algorithm.steps.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Tutorial Content */}
            <div className="lg:col-span-2">
              {selectedAlgorithm ? (
                <Tabs defaultValue="tutorial" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tutorial" className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Tutorial
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Overview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {selectedAlgorithm.name}
                          <Badge className={getDifficultyColor(selectedAlgorithm.difficulty)}>
                            {selectedAlgorithm.difficulty}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Mô tả</h4>
                          <p className="text-gray-700">{selectedAlgorithm.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Độ phức tạp thời gian</h4>
                            <p className={`font-mono ${getComplexityColor(selectedAlgorithm.timeComplexity)}`}>
                              {selectedAlgorithm.timeComplexity}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Độ phức tạp không gian</h4>
                            <p className={`font-mono ${getComplexityColor(selectedAlgorithm.spaceComplexity)}`}>
                              {selectedAlgorithm.spaceComplexity}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Ứng dụng</h4>
                          <p className="text-gray-700">{selectedAlgorithm.useCase}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Các bước học</h4>
                          <div className="space-y-2">
                            {selectedAlgorithm.steps.map((step, index) => (
                              <div key={step.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                                <div className="flex items-center gap-2">
                                  {completedSteps.has(step.id) ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                  )}
                                  <span className="text-sm font-medium">{index + 1}.</span>
                                </div>
                                <span className="text-sm">{step.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tutorial" className="mt-6">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>
                            Bước {currentStep + 1}: {selectedAlgorithm.steps[currentStep]?.title}
                          </CardTitle>
                          <div className="text-sm text-gray-600">
                            {currentStep + 1} / {selectedAlgorithm.steps.length}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${((currentStep + 1) / selectedAlgorithm.steps.length) * 100}%` }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        {selectedAlgorithm.steps[currentStep] && (
                          <div className="space-y-4">
                            <div>
                              <p className="text-gray-700 whitespace-pre-line">
                                {selectedAlgorithm.steps[currentStep].content}
                              </p>
                            </div>

                            {selectedAlgorithm.steps[currentStep].code && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Code2 className="w-4 h-4" />
                                  Code Implementation
                                </h4>
                                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                  <pre className="text-sm">
                                    {selectedAlgorithm.steps[currentStep].code}
                                  </pre>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4">
                              <div className="flex gap-2">
                                <Button 
                                  onClick={previousStep}
                                  disabled={currentStep === 0}
                                  variant="outline"
                                >
                                  Previous
                                </Button>
                                <Button 
                                  onClick={nextStep}
                                  disabled={currentStep === selectedAlgorithm.steps.length - 1}
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                              
                              <Button
                                onClick={() => markStepComplete(selectedAlgorithm.steps[currentStep].id)}
                                variant={completedSteps.has(selectedAlgorithm.steps[currentStep].id) ? "secondary" : "default"}
                                className="flex items-center gap-2"
                              >
                                {completedSteps.has(selectedAlgorithm.steps[currentStep].id) ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mark Complete
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Chọn một thuật toán để bắt đầu học!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlgorithmTutorial;
