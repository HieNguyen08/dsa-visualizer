"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, RotateCcw, Grid, BookOpen, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// --- Types ---
interface DPStep {
  step: number;
  row: number;
  col: number;
  value: number;
  action: 'compute' | 'backtrack' | 'solution';
  description: string;
  table: number[][];
}

// --- Constants ---
const ALGORITHMS = {
  fibonacci: { name: "Fibonacci Sequence", description: "Compute nth Fibonacci number using DP" },
  lcs: { name: "Longest Common Subsequence", description: "Find LCS of two sequences" },
  editdist: { name: "Edit Distance", description: "Minimum operations to transform one string to another" },
  knapsack: { name: "0/1 Knapsack", description: "Maximum value with weight constraint" },
  coinchange: { name: "Coin Change", description: "Minimum coins needed for target amount" }
};

// --- Algorithm Information ---
const ALGORITHM_INFO = {
  fibonacci: {
    title: "Dãy Fibonacci với Dynamic Programming",
    principle: "Tính số Fibonacci thứ n bằng cách lưu trữ kết quả các bài toán con:",
    steps: [
      "1. Khởi tạo: F(0) = 0, F(1) = 1",
      "2. Với mỗi i từ 2 đến n:",
      "   - F(i) = F(i-1) + F(i-2)",
      "3. Kết quả: F(n)"
    ],
    complexity: "Độ phức tạp: O(n) thời gian, O(n) không gian",
    applications: "Ứng dụng: Toán học, tối ưu hóa, phân tích thuật toán"
  },
  lcs: {
    title: "Longest Common Subsequence (LCS)",
    principle: "Tìm dãy con chung dài nhất của hai chuỗi:",
    steps: [
      "1. Tạo bảng DP[i][j] với i, j là độ dài các chuỗi con",
      "2. Nếu s1[i-1] == s2[j-1]: DP[i][j] = DP[i-1][j-1] + 1",
      "3. Ngược lại: DP[i][j] = max(DP[i-1][j], DP[i][j-1])",
      "4. Backtrack để tìm LCS thực tế"
    ],
    complexity: "Độ phức tạp: O(mn) thời gian và không gian",
    applications: "Ứng dụng: Diff tools, DNA sequencing, version control"
  },
  editdist: {
    title: "Edit Distance (Levenshtein Distance)",
    principle: "Tìm số phép biến đổi tối thiểu để chuyển chuỗi A thành chuỗi B:",
    steps: [
      "1. Tạo bảng DP[i][j] cho chuỗi con độ dài i và j",
      "2. Nếu ký tự giống nhau: DP[i][j] = DP[i-1][j-1]",
      "3. Ngược lại: DP[i][j] = 1 + min(insert, delete, replace)",
      "4. Kết quả tại DP[m][n]"
    ],
    complexity: "Độ phức tạp: O(mn) thời gian và không gian",
    applications: "Ứng dụng: Spell checker, DNA analysis, plagiarism detection"
  },
  knapsack: {
    title: "0/1 Knapsack Problem",
    principle: "Tìm giá trị tối đa có thể đạt được với trọng lượng giới hạn:",
    steps: [
      "1. DP[i][w] = giá trị tối đa với i items đầu và capacity w",
      "2. Nếu weight[i] > w: DP[i][w] = DP[i-1][w]",
      "3. Ngược lại: DP[i][w] = max(DP[i-1][w], DP[i-1][w-weight[i]] + value[i])",
      "4. Backtrack để tìm items được chọn"
    ],
    complexity: "Độ phức tạp: O(nW) với n items, W capacity",
    applications: "Ứng dụng: Resource allocation, portfolio optimization"
  },
  coinchange: {
    title: "Coin Change Problem",
    principle: "Tìm số đồng xu tối thiểu để tạo ra số tiền mục tiêu:",
    steps: [
      "1. DP[i] = số đồng xu tối thiểu để tạo ra amount i",
      "2. DP[0] = 0, DP[i] = ∞ ban đầu",
      "3. Với mỗi coin: DP[i] = min(DP[i], DP[i-coin] + 1)",
      "4. Kết quả tại DP[target]"
    ],
    complexity: "Độ phức tạp: O(amount × coins)",
    applications: "Ứng dụng: Making change, optimization problems"
  }
};

const DynamicProgrammingVisualizer = () => {
  const [algorithm, setAlgorithm] = useState('fibonacci');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [dpSteps, setDpSteps] = useState<DPStep[]>([]);
  const [speed, setSpeed] = useState(5);
  const [dpTable, setDpTable] = useState<number[][]>([]);
  
  // Algorithm-specific inputs
  const [fibN, setFibN] = useState(10);
  const [string1, setString1] = useState("ABCDGH");
  const [string2, setString2] = useState("AEDFHR");

  const speedRef = useRef(speed);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Fibonacci DP
  const fibonacciDP = (n: number): DPStep[] => {
    const steps: DPStep[] = [];
    const dp = Array(n + 1).fill(0);
    dp[0] = 0;
    if (n > 0) dp[1] = 1;
    
    let stepCount = 0;

    for (let i = 2; i <= n; i++) {
      stepCount++;
      dp[i] = dp[i - 1] + dp[i - 2];
      
      steps.push({
        step: stepCount,
        row: 0,
        col: i,
        value: dp[i],
        action: 'compute',
        description: `F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`,
        table: [dp.slice()]
      });
    }

    steps.push({
      step: stepCount + 1,
      row: 0,
      col: n,
      value: dp[n],
      action: 'solution',
      description: `Kết quả: F(${n}) = ${dp[n]}`,
      table: [dp.slice()]
    });

    return steps;
  };

  // LCS DP
  const lcsDP = (s1: string, s2: string): DPStep[] => {
    const steps: DPStep[] = [];
    const m = s1.length, n = s2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    let stepCount = 0;

    // Fill the DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        stepCount++;
        
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            step: stepCount,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `'${s1[i-1]}' == '${s2[j-1]}', DP[${i}][${j}] = DP[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
            table: dp.map(row => row.slice())
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            step: stepCount,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `'${s1[i-1]}' != '${s2[j-1]}', DP[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
            table: dp.map(row => row.slice())
          });
        }
      }
    }

    steps.push({
      step: stepCount + 1,
      row: m,
      col: n,
      value: dp[m][n],
      action: 'solution',
      description: `Độ dài LCS: ${dp[m][n]}`,
      table: dp.map(row => row.slice())
    });

    return steps;
  };

  // Edit Distance DP
  const editDistanceDP = (s1: string, s2: string): DPStep[] => {
    const steps: DPStep[] = [];
    const m = s1.length, n = s2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    let stepCount = 0;

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        stepCount++;
        
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          steps.push({
            step: stepCount,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `'${s1[i-1]}' == '${s2[j-1]}', không cần thay đổi, DP[${i}][${j}] = ${dp[i][j]}`,
            table: dp.map(row => row.slice())
          });
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
          steps.push({
            step: stepCount,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `'${s1[i-1]}' != '${s2[j-1]}', DP[${i}][${j}] = 1 + min(${dp[i-1][j]}, ${dp[i][j-1]}, ${dp[i-1][j-1]}) = ${dp[i][j]}`,
            table: dp.map(row => row.slice())
          });
        }
      }
    }

    steps.push({
      step: stepCount + 1,
      row: m,
      col: n,
      value: dp[m][n],
      action: 'solution',
      description: `Edit Distance: ${dp[m][n]} phép biến đổi`,
      table: dp.map(row => row.slice())
    });

    return steps;
  };

  const startDP = () => {
    if (isAnimating) {
      stopDP();
      return;
    }

    let steps: DPStep[];
    switch (algorithm) {
      case 'fibonacci':
        steps = fibonacciDP(fibN);
        break;
      case 'lcs':
        steps = lcsDP(string1, string2);
        break;
      case 'editdist':
        steps = editDistanceDP(string1, string2);
        break;
      default:
        steps = fibonacciDP(fibN);
    }

    setDpSteps(steps);
    setCurrentStep(-1);
    setDpTable([]);
    setIsAnimating(true);
    
    animateDP(steps);
  };

  const stopDP = () => {
    setIsAnimating(false);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const animateDP = (steps: DPStep[]) => {
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex >= steps.length) {
        setIsAnimating(false);
        return;
      }

      const step = steps[stepIndex];
      setCurrentStep(stepIndex);
      setDpTable(step.table);

      stepIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 200);
    };

    animate();
  };

  const resetDP = () => {
    stopDP();
    setCurrentStep(-1);
    setDpTable([]);
    setDpSteps([]);
  };

  const getCellColor = (row: number, col: number) => {
    if (currentStep < 0 || !dpSteps[currentStep]) return '';

    const step = dpSteps[currentStep];
    
    if (row === step.row && col === step.col) {
      if (step.action === 'solution') return 'bg-purple-200 text-purple-800 font-bold';
      return 'bg-yellow-200 text-yellow-800';
    }
    
    return '';
  };

  const AlgorithmInfo = ({ algorithmKey }: { algorithmKey: string }) => {
    const info = ALGORITHM_INFO[algorithmKey as keyof typeof ALGORITHM_INFO];
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Nguyên lý
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {info.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Nguyên lý hoạt động:</h4>
              <p className="text-sm text-gray-700 mb-2">{info.principle}</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {info.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Phân tích:</h4>
              <p className="text-sm text-gray-700">{info.complexity}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ứng dụng thực tế:</h4>
              <p className="text-sm text-gray-700">{info.applications}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderInputs = () => {
    switch (algorithm) {
      case 'fibonacci':
        return (
          <div>
            <Label htmlFor="fib-n">N (số Fibonacci thứ n)</Label>
            <Input
              id="fib-n"
              type="number"
              value={fibN}
              onChange={(e) => setFibN(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
              disabled={isAnimating}
              className="w-24"
            />
          </div>
        );
      case 'lcs':
      case 'editdist':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="string1">String 1</Label>
              <Input
                id="string1"
                value={string1}
                onChange={(e) => setString1(e.target.value.toUpperCase())}
                disabled={isAnimating}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="string2">String 2</Label>
              <Input
                id="string2"
                value={string2}
                onChange={(e) => setString2(e.target.value.toUpperCase())}
                disabled={isAnimating}
                className="font-mono"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-6 h-6" />
            Dynamic Programming Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Algorithm Selection */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isAnimating}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, alg]) => (
                    <SelectItem key={key} value={key}>
                      {alg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Speed: {speed}</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-32"
              />
            </div>

            <div className="flex gap-2 items-end">
              <AlgorithmInfo algorithmKey={algorithm} />

              <Button
                onClick={startDP}
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
                    Start DP
                  </>
                )}
              </Button>

              <Button onClick={resetDP} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Input Controls */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {renderInputs()}
          </div>

          {/* Visualization */}
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">DP Table</TabsTrigger>
              <TabsTrigger value="steps">Step-by-Step</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                {dpTable.length > 0 && (
                  <div className="overflow-auto">
                    <table className="mx-auto border-collapse">
                      <tbody>
                        {dpTable.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className={`border border-gray-300 w-12 h-12 text-center font-mono ${getCellColor(i, j)}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {currentStep >= 0 && dpSteps[currentStep] && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Current Step:</h4>
                    <p className="text-sm">{dpSteps[currentStep].description}</p>
                    <div className="mt-2 text-sm">
                      Step: {currentStep + 1}/{dpSteps.length}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="steps" className="mt-6">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Algorithm Steps</h3>
                  <p className="text-sm text-gray-600">
                    {ALGORITHMS[algorithm as keyof typeof ALGORITHMS].description}
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {dpSteps.slice(0, currentStep + 1).map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 border-b ${
                        index === currentStep ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">Step {step.step}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          step.action === 'solution' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {step.action === 'solution' ? 'Kết quả' : 'Tính toán'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  ))}
                  
                  {dpSteps.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click &quot;Start DP&quot; to see algorithm steps</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicProgrammingVisualizer;
