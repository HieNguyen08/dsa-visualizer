"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, RotateCcw, Crown } from 'lucide-react';

interface BoardState {
  board: number[][];
  queens: { row: number; col: number }[];
  currentRow: number;
  currentCol: number;
  isBacktracking: boolean;
  conflicts: { row: number; col: number }[];
}

interface BacktrackStep {
  boardState: BoardState;
  description: string;
  operation: 'place' | 'backtrack' | 'check' | 'solution' | 'init';
  solutionCount: number;
}

type BacktrackProblem = 'n-queens' | 'sudoku' | 'maze' | 'subset-sum';

export default function BacktrackingPage() {
  const [boardSize, setBoardSize] = useState([4]);
  const [problem, setProblem] = useState<BacktrackProblem>('n-queens');
  const [steps, setSteps] = useState<BacktrackStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([800]);
  const [stats, setStats] = useState({ solutions: 0, backtracks: 0, totalSteps: 0 });

  // Check if placing a queen at (row, col) is safe
  const isSafe = (board: number[][], row: number, col: number, size: number): { safe: boolean; conflicts: { row: number; col: number }[] } => {
    const conflicts: { row: number; col: number }[] = [];

    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) {
        conflicts.push({ row: i, col });
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) {
        conflicts.push({ row: i, col: j });
      }
    }

    // Check diagonal (top-right to bottom-left)  
    for (let i = row - 1, j = col + 1; i >= 0 && j < size; i--, j++) {
      if (board[i][j] === 1) {
        conflicts.push({ row: i, col: j });
      }
    }

    return { safe: conflicts.length === 0, conflicts };
  };

  // Get current queens positions
  const getQueens = (board: number[][], size: number): { row: number; col: number }[] => {
    const queens: { row: number; col: number }[] = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 1) {
          queens.push({ row: i, col: j });
        }
      }
    }
    return queens;
  };

  // N-Queens backtracking algorithm
  const solveNQueens = (size: number): BacktrackStep[] => {
    const steps: BacktrackStep[] = [];
    const board: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
    let solutionCount = 0;
    let backtrackCount = 0;
    let stepCount = 0;

    // Initial state
    steps.push({
      boardState: {
        board: board.map(row => [...row]),
        queens: [],
        currentRow: 0,
        currentCol: 0,
        isBacktracking: false,
        conflicts: []
      },
      description: `Starting N-Queens problem with ${size}x${size} board`,
      operation: 'init',
      solutionCount: 0
    });

    const backtrack = (row: number): boolean => {
      stepCount++;
      
      // Base case: all queens placed
      if (row === size) {
        solutionCount++;
        steps.push({
          boardState: {
            board: board.map(row => [...row]),
            queens: getQueens(board, size),
            currentRow: row,
            currentCol: 0,
            isBacktracking: false,
            conflicts: []
          },
          description: `Solution ${solutionCount} found! All ${size} queens placed safely.`,
          operation: 'solution',
          solutionCount
        });
        return true;
      }

      // Try placing queen in each column of current row
      for (let col = 0; col < size; col++) {
        const safetyCheck = isSafe(board, row, col, size);
        
        // Show checking position
        steps.push({
          boardState: {
            board: board.map(row => [...row]),
            queens: getQueens(board, size),
            currentRow: row,
            currentCol: col,
            isBacktracking: false,
            conflicts: safetyCheck.conflicts
          },
          description: `Checking position (${row}, ${col}) - ${safetyCheck.safe ? 'Safe' : 'Conflicts detected'}`,
          operation: 'check',
          solutionCount
        });

        if (safetyCheck.safe) {
          // Place queen
          board[row][col] = 1;
          
          steps.push({
            boardState: {
              board: board.map(row => [...row]),
              queens: getQueens(board, size),
              currentRow: row,
              currentCol: col,
              isBacktracking: false,
              conflicts: []
            },
            description: `Placed queen at (${row}, ${col}). Moving to next row.`,
            operation: 'place',
            solutionCount
          });

          // Recursive call
          if (backtrack(row + 1)) {
            return true; // Return first solution found
          }

          // Backtrack: remove queen
          board[row][col] = 0;
          backtrackCount++;
          
          steps.push({
            boardState: {
              board: board.map(row => [...row]),
              queens: getQueens(board, size),
              currentRow: row,
              currentCol: col,
              isBacktracking: true,
              conflicts: []
            },
            description: `Backtracking: Removed queen from (${row}, ${col}). Trying next position.`,
            operation: 'backtrack',
            solutionCount
          });
        }
      }

      return false;
    };

    // Start solving
    backtrack(0);

    // Final step if no solution found
    if (solutionCount === 0) {
      steps.push({
        boardState: {
          board: board.map(row => [...row]),
          queens: [],
          currentRow: 0,
          currentCol: 0,
          isBacktracking: false,
          conflicts: []
        },
        description: `No solution exists for ${size}x${size} N-Queens problem.`,
        operation: 'init',
        solutionCount: 0
      });
    }

    return steps;
  };

  // Start solving the selected problem
  const startSolving = () => {
    const size = boardSize[0];
    let problemSteps: BacktrackStep[] = [];

    switch (problem) {
      case 'n-queens':
        problemSteps = solveNQueens(size);
        break;
      default:
        problemSteps = solveNQueens(size);
    }

    setSteps(problemSteps);
    setCurrentStep(0);
    
    const solutions = problemSteps.filter(step => step.operation === 'solution').length;
    const backtracks = problemSteps.filter(step => step.operation === 'backtrack').length;
    
    setStats({
      solutions,
      backtracks,
      totalSteps: problemSteps.length
    });
  };

  const play = () => {
    if (steps.length === 0) {
      startSolving();
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setStats({ solutions: 0, backtracks: 0, totalSteps: 0 });
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

  const currentStepData = steps[currentStep];

  // Render chessboard cell
  const renderCell = (row: number, col: number) => {
    const size = boardSize[0];
    const cellSize = Math.min(400 / size, 50);
    const isLight = (row + col) % 2 === 0;
    const hasQueen = currentStepData?.boardState.board[row][col] === 1;
    const isCurrent = currentStepData?.boardState.currentRow === row && currentStepData?.boardState.currentCol === col;
    const isConflict = currentStepData?.boardState.conflicts.some(c => c.row === row && c.col === col);
    const isBacktracking = currentStepData?.boardState.isBacktracking && isCurrent;

    let cellClass = `flex items-center justify-center font-bold text-lg transition-all duration-300 border border-gray-400 `;
    let bgColor = isLight ? 'bg-amber-100' : 'bg-amber-800';
    
    if (isCurrent) {
      bgColor = isBacktracking ? 'bg-red-300' : 'bg-blue-300';
    } else if (isConflict) {
      bgColor = 'bg-red-200';
    } else if (hasQueen) {
      bgColor = isLight ? 'bg-green-200' : 'bg-green-400';
    }

    cellClass += bgColor;

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        style={{
          width: cellSize,
          height: cellSize,
          left: col * cellSize,
          top: row * cellSize,
          position: 'absolute'
        }}
      >
        {hasQueen && <Crown className="w-6 h-6 text-purple-800" />}
        {isCurrent && !hasQueen && (
          <div className={`w-3 h-3 rounded-full ${isBacktracking ? 'bg-red-600' : 'bg-blue-600'}`}></div>
        )}
      </div>
    );
  };

  // Render the entire board
  const renderBoard = () => {
    if (!currentStepData) return null;

    const size = boardSize[0];
    const cellSize = Math.min(400 / size, 50);
    const totalBoardSize = size * cellSize;

    return (
      <div 
        className="relative border-2 border-gray-600 mx-auto"
        style={{ width: totalBoardSize, height: totalBoardSize }}
      >
        {Array.from({ length: size }, (_, row) =>
          Array.from({ length: size }, (_, col) => renderCell(row, col))
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <RotateCcw className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Backtracking Algorithms</h1>
        </div>
        <p className="text-gray-600">
          Explore backtracking with classic problems like N-Queens, Sudoku solving, and more.
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
                <label className="text-sm font-medium mb-2 block">Problem Type</label>
                <Select value={problem} onValueChange={(value: BacktrackProblem) => setProblem(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="n-queens">N-Queens</SelectItem>
                    <SelectItem value="sudoku" disabled>Sudoku (Coming Soon)</SelectItem>
                    <SelectItem value="maze" disabled>Maze Generation (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Board Size: {boardSize[0]}x{boardSize[0]}</label>
                <Slider
                  value={boardSize}
                  onValueChange={setBoardSize}
                  min={4}
                  max={8}
                  step={1}
                  className="w-full"
                />
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
                  <Play className="w-4 h-4" />
                </Button>
                <Button onClick={pause} disabled={!isPlaying} size="sm" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
                <Button onClick={reset} size="sm" variant="outline">
                  <Square className="w-4 h-4" />
                </Button>
                <Button onClick={startSolving} size="sm" variant="outline">
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
                  <span>Solutions:</span>
                  <span className="font-mono">{stats.solutions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Backtracks:</span>
                  <span className="font-mono">{stats.backtracks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Steps:</span>
                  <span className="font-mono">{stats.totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current State Info */}
          {currentStepData && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Current State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Queens Placed:</span>
                    <span className="font-mono">{currentStepData.boardState.queens.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Row:</span>
                    <span className="font-mono">{currentStepData.boardState.currentRow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Col:</span>
                    <span className="font-mono">{currentStepData.boardState.currentCol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conflicts:</span>
                    <span className="font-mono">{currentStepData.boardState.conflicts.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Backtracking Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Configure the problem and click Start to begin solving'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                {renderBoard()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 text-sm justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 border border-gray-400"></div>
                  <span>Light Square</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-800 border border-gray-400"></div>
                  <span>Dark Square</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 border border-gray-400 flex items-center justify-center">
                    <Crown className="w-3 h-3 text-purple-800" />
                  </div>
                  <span>Queen Placed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300 border border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span>Current Position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-300 border border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  </div>
                  <span>Backtracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border border-gray-400"></div>
                  <span>Conflict</span>
                </div>
              </div>

              {/* Operation indicator */}
              {currentStepData && (
                <div className="mt-4 text-center">
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    currentStepData.operation === 'solution' ? 'bg-green-100 text-green-800' :
                    currentStepData.operation === 'backtrack' ? 'bg-red-100 text-red-800' :
                    currentStepData.operation === 'place' ? 'bg-blue-100 text-blue-800' :
                    currentStepData.operation === 'check' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentStepData.operation.toUpperCase()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Algorithm Information */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Backtracking Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Backtracking is a general algorithmic approach for finding all (or some) solutions to computational problems by incrementally building candidates and abandoning candidates (&quot;backtracking&quot;) when they cannot lead to a valid solution.</p>
              
              <h3>N-Queens Problem</h3>
              <p>The N-Queens problem asks: How can N chess queens be placed on an N×N chessboard so that no two queens attack each other?</p>
              
              <h3>Algorithm Steps</h3>
              <ol>
                <li><strong>Choose:</strong> Select a position to place the next queen</li>
                <li><strong>Constraint Check:</strong> Verify the position doesn&apos;t conflict with existing queens</li>
                <li><strong>Explore:</strong> If safe, place queen and recursively solve for next row</li>
                <li><strong>Backtrack:</strong> If no safe position exists, remove the previous queen and try next position</li>
              </ol>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Worst Case:</strong> O(N!) - tries all possible arrangements</li>
                <li><strong>With Pruning:</strong> Much better in practice due to early constraint checking</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(N) - for the recursion stack and board representation</p>

              <h3>Applications</h3>
              <ul>
                <li>Sudoku solving</li>
                <li>Maze generation and solving</li>
                <li>Graph coloring</li>
                <li>Subset sum problems</li>
                <li>Constraint satisfaction problems</li>
                <li>Permutation and combination generation</li>
              </ul>

              <h3>Key Concepts</h3>
              <ul>
                <li><strong>State Space Tree:</strong> Represents all possible partial solutions</li>
                <li><strong>Pruning:</strong> Eliminating branches that cannot lead to valid solutions</li>
                <li><strong>Constraint Propagation:</strong> Early detection of constraint violations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
