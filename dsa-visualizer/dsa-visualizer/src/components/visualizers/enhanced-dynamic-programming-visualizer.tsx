"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, RotateCcw, Grid, BookOpen, Info } from 'lucide-react';

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

interface KnapsackItem {
  weight: number;
  value: number;
  name: string;
}

// --- Constants ---
const ALGORITHMS = {
  fibonacci: { name: "Fibonacci Sequence", description: "Compute nth Fibonacci number using DP", complexity: "O(n)" },
  lcs: { name: "Longest Common Subsequence", description: "Find LCS of two sequences", complexity: "O(mn)" },
  editdist: { name: "Edit Distance", description: "Minimum operations to transform strings", complexity: "O(mn)" },
  knapsack: { name: "0/1 Knapsack", description: "Maximum value with weight constraint", complexity: "O(nW)" },
  coinchange: { name: "Coin Change", description: "Minimum coins for target amount", complexity: "O(amount×coins)" },
  matrixchain: { name: "Matrix Chain Multiplication", description: "Optimal matrix multiplication order", complexity: "O(n³)" },
  lis: { name: "Longest Increasing Subsequence", description: "Find longest increasing subsequence", complexity: "O(n log n)" }
};

// --- Algorithm Information ---
const ALGORITHM_INFO = {
  fibonacci: {
    title: "Fibonacci Sequence with Dynamic Programming",
    principle: "Calculate nth Fibonacci number by storing subproblem results:",
    steps: [
      "1. Initialize: F(0) = 0, F(1) = 1",
      "2. For each i from 2 to n:",
      "   - F(i) = F(i-1) + F(i-2)",
      "3. Result: F(n)"
    ],
    complexity: "Time: O(n), Space: O(n) or O(1) optimized",
    applications: "Mathematics, optimization, algorithm analysis"
  },
  lcs: {
    title: "Longest Common Subsequence (LCS)",
    principle: "Find the longest common subsequence of two strings:",
    steps: [
      "1. Create DP table[i][j] for substring lengths",
      "2. If s1[i-1] == s2[j-1]: DP[i][j] = DP[i-1][j-1] + 1",
      "3. Else: DP[i][j] = max(DP[i-1][j], DP[i][j-1])",
      "4. Backtrack to find actual LCS"
    ],
    complexity: "Time: O(mn), Space: O(mn)",
    applications: "Diff tools, DNA sequencing, version control"
  },
  editdist: {
    title: "Edit Distance (Levenshtein Distance)",
    principle: "Find minimum operations to transform string A to string B:",
    steps: [
      "1. Create DP table[i][j] for substring lengths i and j",
      "2. If chars match: DP[i][j] = DP[i-1][j-1]",
      "3. Else: DP[i][j] = 1 + min(insert, delete, replace)",
      "4. Result at DP[m][n]"
    ],
    complexity: "Time: O(mn), Space: O(mn)",
    applications: "Spell checker, DNA analysis, plagiarism detection"
  },
  knapsack: {
    title: "0/1 Knapsack Problem",
    principle: "Find maximum value achievable with weight constraint:",
    steps: [
      "1. DP[i][w] = max value with first i items and capacity w",
      "2. If weight[i] > w: DP[i][w] = DP[i-1][w]",
      "3. Else: DP[i][w] = max(DP[i-1][w], DP[i-1][w-weight[i]] + value[i])",
      "4. Backtrack to find selected items"
    ],
    complexity: "Time: O(nW), Space: O(nW)",
    applications: "Resource allocation, portfolio optimization"
  },
  coinchange: {
    title: "Coin Change Problem",
    principle: "Find minimum coins needed to make target amount:",
    steps: [
      "1. DP[i] = minimum coins to make amount i",
      "2. DP[0] = 0, DP[i] = ∞ initially",
      "3. For each coin: DP[i] = min(DP[i], DP[i-coin] + 1)",
      "4. Result at DP[target]"
    ],
    complexity: "Time: O(amount × coins), Space: O(amount)",
    applications: "Making change, optimization problems"
  },
  matrixchain: {
    title: "Matrix Chain Multiplication",
    principle: "Find optimal order to multiply chain of matrices:",
    steps: [
      "1. DP[i][j] = min cost to multiply matrices i to j",
      "2. DP[i][i] = 0 (single matrix)",
      "3. DP[i][j] = min(DP[i][k] + DP[k+1][j] + cost(i,k,j))",
      "4. Result at DP[1][n]"
    ],
    complexity: "Time: O(n³), Space: O(n²)",
    applications: "Computer graphics, scientific computing"
  },
  lis: {
    title: "Longest Increasing Subsequence",
    principle: "Find longest subsequence where elements are in increasing order:",
    steps: [
      "1. DP[i] = length of LIS ending at position i",
      "2. DP[i] = 1 + max(DP[j]) where arr[j] < arr[i]",
      "3. Result = max(DP[i]) for all i",
      "4. Backtrack to reconstruct sequence"
    ],
    complexity: "Time: O(n²) or O(n log n), Space: O(n)",
    applications: "Patience sorting, scheduling, optimization"
  }
};

const EnhancedDynamicProgrammingVisualizer = () => {
  const [algorithm, setAlgorithm] = useState('fibonacci');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DPStep[]>([]);
  const [speed, setSpeed] = useState(500);
  const [table, setTable] = useState<number[][]>([]);
  const [result, setResult] = useState<DPStep | null>(null);
  
  // Algorithm specific inputs
  const [fibN, setFibN] = useState(10);
  const [string1, setString1] = useState("ABCDGH");
  const [string2, setString2] = useState("AEDFHR");
  const [knapsackItems, setKnapsackItems] = useState<KnapsackItem[]>([
    { name: "Item 1", weight: 2, value: 3 },
    { name: "Item 2", weight: 3, value: 4 },
    { name: "Item 3", weight: 4, value: 5 },
    { name: "Item 4", weight: 5, value: 6 }
  ]);
  const [capacity, setCapacity] = useState(8);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [coins, setCoins] = useState([1, 3, 4]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [targetAmount, setTargetAmount] = useState(6);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [matrixDimensions, setMatrixDimensions] = useState([40, 20, 30, 10, 30]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lisArray, setLisArray] = useState([10, 9, 2, 5, 3, 7, 101, 18]);

  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Fibonacci DP Algorithm
  const generateFibonacciSteps = (n: number): DPStep[] => {
    const steps: DPStep[] = [];
    const dp = new Array(n + 1).fill(0);
    const table = new Array(1).fill(new Array(n + 1).fill(0));
    
    dp[0] = 0;
    dp[1] = 1;
    table[0][0] = 0;
    table[0][1] = 1;

    steps.push({
      step: 0,
      row: 0,
      col: 0,
      value: 0,
      action: 'compute',
      description: 'Initialize F(0) = 0',
      table: [dp.slice()]
    });

    if (n > 0) {
      steps.push({
        step: 1,
        row: 0,
        col: 1,
        value: 1,
        action: 'compute',
        description: 'Initialize F(1) = 1',
        table: [dp.slice()]
      });
    }

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      steps.push({
        step: i,
        row: 0,
        col: i,
        value: dp[i],
        action: 'compute',
        description: `F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`,
        table: [dp.slice()]
      });
    }

    steps.push({
      step: n + 1,
      row: 0,
      col: n,
      value: dp[n],
      action: 'solution',
      description: `Final result: F(${n}) = ${dp[n]}`,
      table: [dp.slice()]
    });

    return steps;
  };

  // LCS DP Algorithm
  const generateLCSSteps = (s1: string, s2: string): DPStep[] => {
    const steps: DPStep[] = [];
    const m = s1.length;
    const n = s2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      steps.push({
        step: steps.length,
        row: i,
        col: 0,
        value: 0,
        action: 'compute',
        description: `Initialize DP[${i}][0] = 0`,
        table: dp.map(row => [...row])
      });
    }

    for (let j = 1; j <= n; j++) {
      steps.push({
        step: steps.length,
        row: 0,
        col: j,
        value: 0,
        action: 'compute',
        description: `Initialize DP[0][${j}] = 0`,
        table: dp.map(row => [...row])
      });
    }

    // Fill the table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            step: steps.length,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `${s1[i-1]} == ${s2[j-1]}: DP[${i}][${j}] = DP[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
            table: dp.map(row => [...row])
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            step: steps.length,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `${s1[i-1]} != ${s2[j-1]}: DP[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
            table: dp.map(row => [...row])
          });
        }
      }
    }

    // Backtrack to find LCS
    let lcs = "";
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (s1[i - 1] === s2[j - 1]) {
        lcs = s1[i - 1] + lcs;
        steps.push({
          step: steps.length,
          row: i,
          col: j,
          value: dp[i][j],
          action: 'backtrack',
          description: `Backtrack: Include '${s1[i-1]}' in LCS`,
          table: dp.map(row => [...row])
        });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    steps.push({
      step: steps.length,
      row: m,
      col: n,
      value: dp[m][n],
      action: 'solution',
      description: `LCS found: "${lcs}" (length: ${dp[m][n]})`,
      table: dp.map(row => [...row])
    });

    return steps;
  };

  // Edit Distance DP Algorithm
  const generateEditDistanceSteps = (s1: string, s2: string): DPStep[] => {
    const steps: DPStep[] = [];
    const m = s1.length;
    const n = s2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      steps.push({
        step: steps.length,
        row: i,
        col: 0,
        value: i,
        action: 'compute',
        description: `Initialize DP[${i}][0] = ${i} (delete ${i} chars)`,
        table: dp.map(row => [...row])
      });
    }

    for (let j = 1; j <= n; j++) {
      dp[0][j] = j;
      steps.push({
        step: steps.length,
        row: 0,
        col: j,
        value: j,
        action: 'compute',
        description: `Initialize DP[0][${j}] = ${j} (insert ${j} chars)`,
        table: dp.map(row => [...row])
      });
    }

    // Fill the table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          steps.push({
            step: steps.length,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `${s1[i-1]} == ${s2[j-1]}: No operation needed, DP[${i}][${j}] = ${dp[i][j]}`,
            table: dp.map(row => [...row])
          });
        } else {
          const insert = dp[i][j - 1] + 1;
          const deleteOp = dp[i - 1][j] + 1;
          const replace = dp[i - 1][j - 1] + 1;
          dp[i][j] = Math.min(insert, deleteOp, replace);
          
          steps.push({
            step: steps.length,
            row: i,
            col: j,
            value: dp[i][j],
            action: 'compute',
            description: `${s1[i-1]} != ${s2[j-1]}: min(insert:${insert}, delete:${deleteOp}, replace:${replace}) = ${dp[i][j]}`,
            table: dp.map(row => [...row])
          });
        }
      }
    }

    steps.push({
      step: steps.length,
      row: m,
      col: n,
      value: dp[m][n],
      action: 'solution',
      description: `Edit distance: ${dp[m][n]} operations needed`,
      table: dp.map(row => [...row])
    });

    return steps;
  };

  // Knapsack DP Algorithm
  const generateKnapsackSteps = (items: KnapsackItem[], W: number): DPStep[] => {
    const steps: DPStep[] = [];
    const n = items.length;
    const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));

    // Initialize first row
    for (let w = 0; w <= W; w++) {
      steps.push({
        step: steps.length,
        row: 0,
        col: w,
        value: 0,
        action: 'compute',
        description: `Initialize DP[0][${w}] = 0 (no items)`,
        table: dp.map(row => [...row])
      });
    }

    // Fill the table
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= W; w++) {
        const item = items[i - 1];
        if (item.weight <= w) {
          const include = dp[i - 1][w - item.weight] + item.value;
          const exclude = dp[i - 1][w];
          dp[i][w] = Math.max(include, exclude);
          
          steps.push({
            step: steps.length,
            row: i,
            col: w,
            value: dp[i][w],
            action: 'compute',
            description: `Item ${item.name}: max(include:${include}, exclude:${exclude}) = ${dp[i][w]}`,
            table: dp.map(row => [...row])
          });
        } else {
          dp[i][w] = dp[i - 1][w];
          steps.push({
            step: steps.length,
            row: i,
            col: w,
            value: dp[i][w],
            action: 'compute',
            description: `Item ${item.name} too heavy (${item.weight} > ${w}): DP[${i}][${w}] = ${dp[i][w]}`,
            table: dp.map(row => [...row])
          });
        }
      }
    }

    steps.push({
      step: steps.length,
      row: n,
      col: W,
      value: dp[n][W],
      action: 'solution',
      description: `Maximum value: ${dp[n][W]}`,
      table: dp.map(row => [...row])
    });

    return steps;
  };

  // Generate steps based on selected algorithm
  const generateSteps = () => {
    let newSteps: DPStep[] = [];
    
    switch (algorithm) {
      case 'fibonacci':
        newSteps = generateFibonacciSteps(fibN);
        break;
      case 'lcs':
        newSteps = generateLCSSteps(string1, string2);
        break;
      case 'editdist':
        newSteps = generateEditDistanceSteps(string1, string2);
        break;
      case 'knapsack':
        newSteps = generateKnapsackSteps(knapsackItems, capacity);
        break;
      // Add other algorithms here
      default:
        newSteps = generateFibonacciSteps(fibN);
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    setTable(newSteps.length > 0 ? newSteps[0].table : []);
    setResult(null);
  };

  // Animation functions
  const startAnimation = () => {
    if (steps.length === 0) generateSteps();
    setIsAnimating(true);
    animateSteps();
  };

  const animateSteps = () => {
    if (animationRef.current) clearInterval(animationRef.current);
    
    animationRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsAnimating(false);
          if (animationRef.current) clearInterval(animationRef.current);
          return prev;
        }
        
        setTable(steps[next].table);
        if (steps[next].action === 'solution') {
          setResult(steps[next]);
        }
        
        return next;
      });
    }, speed);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  const reset = () => {
    stopAnimation();
    setCurrentStep(0);
    setSteps([]);
    setTable([]);
    setResult(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Regenerate steps when algorithm or inputs change
  useEffect(() => {
    generateSteps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, fibN, string1, string2, knapsackItems, capacity, coins, targetAmount, matrixDimensions, lisArray]);

  const getCellColor = (row: number, col: number, step: DPStep) => {
    if (step.row === row && step.col === col) {
      switch (step.action) {
        case 'compute': return 'bg-blue-200 border-blue-500';
        case 'backtrack': return 'bg-green-200 border-green-500';
        case 'solution': return 'bg-purple-200 border-purple-500';
        default: return 'bg-gray-100';
      }
    }
    return 'bg-gray-50';
  };

  const renderTable = () => {
    if (table.length === 0) return null;
    
    const currentStepData = steps[currentStep];
    
    return (
      <div className="overflow-auto max-h-96 border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-3">DP Table</h3>
        <div className="grid gap-1" style={{
          gridTemplateColumns: `repeat(${table[0]?.length || 1}, minmax(40px, 1fr))`
        }}>
          {table.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`
                  w-10 h-10 flex items-center justify-center text-sm font-medium
                  border border-gray-300 rounded
                  ${currentStepData ? getCellColor(i, j, currentStepData) : 'bg-gray-50'}
                  transition-colors duration-300
                `}
              >
                {cell}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderInputControls = () => {
    switch (algorithm) {
      case 'fibonacci':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fibonacci-n">n value (0-20)</Label>
              <Input
                id="fibonacci-n"
                type="number"
                value={fibN}
                onChange={(e) => setFibN(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                min={0}
                max={20}
              />
            </div>
          </div>
        );
      case 'lcs':
      case 'editdist':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="string1">String 1</Label>
              <Input
                id="string1"
                value={string1}
                onChange={(e) => setString1(e.target.value.toUpperCase())}
                placeholder="Enter first string"
              />
            </div>
            <div>
              <Label htmlFor="string2">String 2</Label>
              <Input
                id="string2"
                value={string2}
                onChange={(e) => setString2(e.target.value.toUpperCase())}
                placeholder="Enter second string"
              />
            </div>
          </div>
        );
      case 'knapsack':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="capacity">Knapsack Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
              />
            </div>
            <div>
              <Label>Items (Weight, Value, Name)</Label>
              <div className="space-y-2">
                {knapsackItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="number"
                      value={item.weight}
                      onChange={(e) => {
                        const newItems = [...knapsackItems];
                        newItems[index].weight = Math.max(1, parseInt(e.target.value) || 1);
                        setKnapsackItems(newItems);
                      }}
                      placeholder="Weight"
                    />
                    <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => {
                        const newItems = [...knapsackItems];
                        newItems[index].value = Math.max(1, parseInt(e.target.value) || 1);
                        setKnapsackItems(newItems);
                      }}
                      placeholder="Value"
                    />
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...knapsackItems];
                        newItems[index].name = e.target.value;
                        setKnapsackItems(newItems);
                      }}
                      placeholder="Name"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Dynamic Programming Visualizer</h1>
        <p className="text-muted-foreground">
          Explore classic DP algorithms with step-by-step visualization and detailed explanations
        </p>
      </div>

      {/* Algorithm Selection and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5" />
              Algorithm & Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="algorithm">Select Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, alg]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{alg.name}</div>
                        <div className="text-sm text-muted-foreground">{alg.complexity}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={startAnimation} 
                disabled={isAnimating}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isAnimating ? 'Running...' : 'Start Animation'}
              </Button>
              <Button 
                onClick={stopAnimation} 
                disabled={!isAnimating}
                variant="outline"
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label>Animation Speed: {speed}ms</Label>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={100}
                max={2000}
                step={100}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            {renderInputControls()}
          </CardContent>
        </Card>
      </div>

      {/* Progress and Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>Progress: Step {currentStep} of {steps.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          {steps[currentStep] && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Current Step:</h4>
              <p className="text-blue-800">{steps[currentStep].description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>DP Table Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Algorithm Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO] && (
              <div className="space-y-3">
                <h4 className="font-semibold">{ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].title}</h4>
                <p className="text-sm text-muted-foreground">
                  {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].principle}
                </p>
                <div>
                  <h5 className="font-medium mb-2">Steps:</h5>
                  <ul className="text-sm space-y-1">
                    {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].steps.map((step, index) => (
                      <li key={index} className="text-muted-foreground">{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Complexity:</span> {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].complexity}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Applications:</span> {ALGORITHM_INFO[algorithm as keyof typeof ALGORITHM_INFO].applications}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Info className="w-5 h-5" />
              Final Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">{result.description}</p>
              <div className="mt-2 text-sm text-green-700">
                Algorithm completed successfully with optimal solution.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDynamicProgrammingVisualizer;
