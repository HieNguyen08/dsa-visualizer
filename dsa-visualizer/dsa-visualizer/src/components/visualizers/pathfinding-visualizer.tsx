"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Square, RotateCcw, Zap, Grid3x3 } from "lucide-react";

const ROWS = 25;
const COLS = 50;

const START_NODE_ROW = 12;
const START_NODE_COL = 10;
const FINISH_NODE_ROW = 12;
const FINISH_NODE_COL = 40;

interface Node {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  distance: number;
  isVisited: boolean;
  isWall: boolean;
  previousNode: Node | null;
  // For A*
  gScore: number;
  hScore: number;
  fScore: number;
  // For visualization
  isBeingVisited: boolean;
  isPath: boolean;
}

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [currentStep, setCurrentStep] = useState("");
  const [visitedCount, setVisitedCount] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [animationTimeouts, setAnimationTimeouts] = useState<NodeJS.Timeout[]>([]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const initialGrid = getInitialGrid();
      setGrid(initialGrid);
    }
  }, [isClient]);

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isVisualizing || !mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const clearPath = () => {
    if (isVisualizing) return;
    
    // Clear all timeouts
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    setAnimationTimeouts([]);
    
    const newGrid = grid.slice();
    for (const row of newGrid) {
      for (const node of row) {
        if (!node.isWall) {
            const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
            if (nodeElement) {
                nodeElement.className = `node ${
                    node.isStart ? 'node-start' : node.isFinish ? 'node-finish' : ''
                }`;
            }
        }
        node.isVisited = false;
        node.distance = Infinity;
        node.previousNode = null;
        node.gScore = Infinity;
        node.hScore = Infinity;
        node.fScore = Infinity;
        node.isBeingVisited = false;
        node.isPath = false;
      }
    }
    setGrid(newGrid);
    setCurrentStep("");
    setVisitedCount(0);
    setPathLength(0);
  }

  const stopVisualization = () => {
    // Clear all timeouts
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    setAnimationTimeouts([]);
    setIsVisualizing(false);
    setCurrentStep("Visualization stopped");
  }

  const generateMaze = () => {
    if (isVisualizing) return;
    clearPath();
    
    const newGrid = getInitialGrid();
    
    // Create maze using randomized recursive division
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (Math.random() < 0.3 && !newGrid[row][col].isStart && !newGrid[row][col].isFinish) {
          newGrid[row][col].isWall = true;
        }
      }
    }
    
    setGrid(newGrid);
    setCurrentStep("Maze generated");
  }

  const clearGrid = () => {
    if (isVisualizing) return;
    const newGrid = getInitialGrid();
    for (const row of newGrid) {
        for (const node of row) {
            const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
            if (nodeElement) {
                nodeElement.className = `node ${
                    node.isStart ? 'node-start' : node.isFinish ? 'node-finish' : ''
                }`;
            }
        }
    }
    setGrid(newGrid);
  }

  const visualizeAlgorithm = () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    clearPath(); 
    setCurrentStep(`Initializing ${getAlgorithmName()}...`);
    setVisitedCount(0);
    setPathLength(0);
    
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    
    let visitedNodesInOrder: Node[];
    switch (algorithm) {
        case 'dijkstra':
            setCurrentStep("Running Dijkstra's Algorithm - Finding shortest path...");
            visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
            break;
        case 'aStar':
            setCurrentStep("Running A* Algorithm - Using heuristic to guide search...");
            visitedNodesInOrder = aStar(grid, startNode, finishNode);
            break;
        case 'bfs':
            setCurrentStep("Running BFS - Exploring level by level...");
            visitedNodesInOrder = bfs(grid, startNode, finishNode);
            break;
        case 'dfs':
            setCurrentStep("Running DFS - Going deep first...");
            visitedNodesInOrder = dfs(grid, startNode, finishNode);
            break;
        default:
            visitedNodesInOrder = [];
            break;
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    setPathLength(nodesInShortestPathOrder.length);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const animateAlgorithm = (
    visitedNodesInOrder: Node[],
    nodesInShortestPathOrder: Node[]
  ) => {
    const timeouts: NodeJS.Timeout[] = [];
    const delay = Math.max(10, 110 - speed[0]);
    
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        const timeout = setTimeout(() => {
          if (nodesInShortestPathOrder.length > 1) {
            setCurrentStep("Path found! Highlighting shortest path...");
            animateShortestPath(nodesInShortestPathOrder, timeouts);
          } else {
            setCurrentStep("No path found!");
            setIsVisualizing(false);
          }
        }, delay * i);
        timeouts.push(timeout);
        return;
      }
      
      const timeout = setTimeout(() => {
        const node = visitedNodesInOrder[i];
        setVisitedCount(i + 1);
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement && !node.isStart && !node.isFinish) {
            nodeElement.className = "node node-visited";
        }
      }, delay * i);
      timeouts.push(timeout);
    }
    
    setAnimationTimeouts(timeouts);
  };

  const animateShortestPath = (nodesInShortestPathOrder: Node[], existingTimeouts: NodeJS.Timeout[]) => {
    const pathDelay = 80;
    
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const timeout = setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement && !node.isStart && !node.isFinish) {
            nodeElement.className = "node node-shortest-path";
        }
        
        if (i === nodesInShortestPathOrder.length - 1) {
          setCurrentStep(`Algorithm completed! Visited ${nodesInShortestPathOrder.length} nodes. Path length: ${nodesInShortestPathOrder.length}`);
          setIsVisualizing(false);
        }
      }, pathDelay * i);
      existingTimeouts.push(timeout);
    }
    
    setAnimationTimeouts(existingTimeouts);
  };

  const getAlgorithmName = () => {
    switch (algorithm) {
        case 'dijkstra': return "Dijkstra's Algorithm";
        case 'aStar': return "A* Search";
        case 'bfs': return "Breadth-First Search";
        case 'dfs': return "Depth-First Search";
        default: return "Algorithm";
    }
  }

  const getAlgorithmDescription = () => {
    switch (algorithm) {
        case 'dijkstra': 
            return "Finds the shortest path by exploring nodes in order of their distance from start. Guarantees optimal solution.";
        case 'aStar':
            return "Uses heuristic (Manhattan distance) to guide search toward goal. Faster than Dijkstra while maintaining optimality.";
        case 'bfs':
            return "Explores nodes level by level. Guarantees shortest path in unweighted graphs.";
        case 'dfs':
            return "Explores as far as possible along each branch before backtracking. May not find shortest path.";
        default:
            return "";
    }
  }

  if (!isClient) {
    return <div className="flex items-center justify-center h-64">Loading pathfinding visualizer...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              Algorithm Controls
            </CardTitle>
            <CardDescription>
              Choose your pathfinding algorithm and control the visualization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select onValueChange={setAlgorithm} defaultValue={algorithm} disabled={isVisualizing}>
                <SelectTrigger>
                  <SelectValue placeholder="Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dijkstra">Dijkstra&apos;s Algorithm</SelectItem>
                  <SelectItem value="aStar">A* Search</SelectItem>
                  <SelectItem value="bfs">Breadth-First Search</SelectItem>
                  <SelectItem value="dfs">Depth-First Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Animation Speed: {speed[0]}</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={100}
                min={1}
                step={1}
                className="w-full"
                disabled={false}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={visualizeAlgorithm} 
                disabled={isVisualizing || grid.length === 0}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Visualize {algorithm === 'dijkstra' ? "Dijkstra's" : 
                          algorithm === 'aStar' ? "A*" :
                          algorithm === 'bfs' ? "BFS" : "DFS"}
              </Button>
              
              {isVisualizing && (
                <Button onClick={stopVisualization} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateMaze} disabled={isVisualizing} variant="outline" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Generate Maze
              </Button>
              <Button onClick={clearPath} disabled={isVisualizing} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Path
              </Button>
              <Button onClick={clearGrid} disabled={isVisualizing} variant="outline" className="flex-1">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Information</CardTitle>
            <CardDescription>{getAlgorithmName()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {getAlgorithmDescription()}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{visitedCount}</div>
                <div className="text-xs text-muted-foreground">Nodes Visited</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{pathLength}</div>
                <div className="text-xs text-muted-foreground">Path Length</div>
              </div>
            </div>
            
            {currentStep && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm font-medium text-blue-800">{currentStep}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>End</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-400 rounded"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Shortest Path</span>
            </div>
            <div className="text-muted-foreground">
              Click and drag to draw walls
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="flex justify-center">
        <div className="inline-block border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="flex">
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <div
                      key={nodeIdx}
                      id={`node-${row}-${col}`}
                      className={`node ${
                        isFinish
                          ? "node-finish"
                          : isStart
                          ? "node-start"
                          : isWall
                          ? "node-wall"
                          : ""
                      }`}
                      onMouseDown={() => handleMouseDown(row, col)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onMouseUp={() => handleMouseUp()}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getInitialGrid = () => {
  const grid: Node[][] = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col: number, row: number): Node => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    gScore: Infinity,
    hScore: Infinity,
    fScore: Infinity,
    isBeingVisited: false,
    isPath: false,
  };
};

const getNewGridWithWallToggled = (
  grid: Node[][],
  row: number,
  col: number
) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  // Prevent toggling wall on start/finish nodes
  if (node.isStart || node.isFinish) return newGrid;
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

// Dijkstra's algorithm
function dijkstra(grid: Node[][], startNode: Node, finishNode: Node) {
  const visitedNodesInOrder: Node[] = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (!!unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();
    if (!closestNode) continue;

    if (closestNode.isWall) continue;

    if (closestNode.distance === Infinity) return visitedNodesInOrder;
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === finishNode) return visitedNodesInOrder;
    updateUnvisitedNeighbors(closestNode, grid);
  }
  return visitedNodesInOrder;
}

function sortNodesByDistance(unvisitedNodes: Node[]) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node: Node, grid: Node[][]) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node: Node, grid: Node[][]) {
  const neighbors: Node[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

function getAllNodes(grid: Node[][]) {
  const nodes: Node[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function getNodesInShortestPathOrder(finishNode: Node) {
  const nodesInShortestPathOrder: Node[] = [];
  let currentNode: Node | null = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

// Breadth-First Search
function bfs(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const queue: Node[] = [startNode];
    startNode.isVisited = true;

    while (queue.length > 0) {
        const currentNode = queue.shift();
        if (!currentNode) continue;

        if (currentNode.isWall) continue;
        
        visitedNodesInOrder.push(currentNode);
        if (currentNode === finishNode) return visitedNodesInOrder;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited) {
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }
    }
    return visitedNodesInOrder;
}

// Depth-First Search
function dfs(grid: Node[][], startNode: Node, finishNode: Node) {
    const visitedNodesInOrder: Node[] = [];
    const stack: Node[] = [startNode];

    while (stack.length > 0) {
        const currentNode = stack.pop();
        if (!currentNode || currentNode.isVisited) continue;

        if (currentNode.isWall) continue;

        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);

        if (currentNode === finishNode) return visitedNodesInOrder;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors.reverse()) { // Reverse to explore in a more "DFS-like" visual manner
            neighbor.previousNode = currentNode;
            stack.push(neighbor);
        }
    }
    return visitedNodesInOrder;
}


// A* Search Algorithm
function aStar(grid: Node[][], startNode: Node, finishNode: Node) {
    const openSet: Node[] = [];
    const visitedNodesInOrder: Node[] = [];
    
    startNode.gScore = 0;
    startNode.hScore = heuristic(startNode, finishNode);
    startNode.fScore = startNode.hScore;
    openSet.push(startNode);

    while (openSet.length > 0) {
        sortNodesByFScore(openSet);
        const currentNode = openSet.shift();
        if (!currentNode) continue;

        if (currentNode.isWall) continue;

        visitedNodesInOrder.push(currentNode);
        if (currentNode === finishNode) return visitedNodesInOrder;

        currentNode.isVisited = true;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            const tentativeGScore = currentNode.gScore + 1;
            if (tentativeGScore < neighbor.gScore) {
                neighbor.previousNode = currentNode;
                neighbor.gScore = tentativeGScore;
                neighbor.hScore = heuristic(neighbor, finishNode);
                neighbor.fScore = neighbor.gScore + neighbor.hScore;
                if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    return visitedNodesInOrder; // Return visited nodes if no path is found
}

function heuristic(nodeA: Node, nodeB: Node) {
    // Manhattan distance
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function sortNodesByFScore(nodes: Node[]) {
    nodes.sort((a, b) => a.fScore - b.fScore);
}

export default PathfindingVisualizer;
