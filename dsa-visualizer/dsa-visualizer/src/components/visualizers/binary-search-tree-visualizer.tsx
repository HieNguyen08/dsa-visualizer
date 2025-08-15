"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  Plus, 
  Search, 
  GitBranch,
  Play,
  Pause,
  Activity,
  Clock,
  BarChart3,
  Palette,
  TreePine,
  Eye,
  TrendingUp
} from "lucide-react";

// --- Data Structure ---
class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  isHighlighted?: boolean;
  color?: string;

  constructor(value: number) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.isHighlighted = false;
    this.color = 'default';
  }
}

interface BSTOperation {
  operation: 'insert' | 'delete' | 'search' | 'clear';
  value?: number;
  timestamp: number;
  treeState: TreeNode | null;
  description: string;
}

interface BSTStatistics {
  totalInsertions: number;
  totalDeletions: number;
  totalSearches: number;
  maxDepth: number;
  nodeCount: number;
  operationCount: number;
}

type TraversalMode = 'inorder' | 'preorder' | 'postorder' | 'levelorder';
type Theme = 'default' | 'neon' | 'minimal';

const NODE_HEIGHT = 100;

export const BinarySearchTreeVisualizer = () => {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [foundNode, setFoundNode] = useState<number | null>(null);
  const [operations, setOperations] = useState<BSTOperation[]>([]);
  const [statistics, setStatistics] = useState<BSTStatistics>({
    totalInsertions: 0,
    totalDeletions: 0,
    totalSearches: 0,
    maxDepth: 0,
    nodeCount: 0,
    operationCount: 0,
  });

  // Settings
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [theme, setTheme] = useState<Theme>('default');
  const [autoDemo, setAutoDemo] = useState(false);
  const [showNodeValues, setShowNodeValues] = useState(true);
  const [showDepth, setShowDepth] = useState(false);
  const [traversalMode, setTraversalMode] = useState<TraversalMode>('inorder');
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalResult, setTraversalResult] = useState<number[]>([]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  // Calculate tree statistics
  const calculateDepth = useCallback((node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(calculateDepth(node.left), calculateDepth(node.right));
  }, []);

  const countNodes = useCallback((node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }, []);

  // Update statistics
  useEffect(() => {
    const totalOps = operations.length;
    const insertions = operations.filter(op => op.operation === 'insert').length;
    const deletions = operations.filter(op => op.operation === 'delete').length;
    const searches = operations.filter(op => op.operation === 'search').length;
    const maxDepth = calculateDepth(root);
    const nodeCount = countNodes(root);

    setStatistics({
      totalInsertions: insertions,
      totalDeletions: deletions,
      totalSearches: searches,
      maxDepth,
      nodeCount,
      operationCount: totalOps,
    });
  }, [operations, root, calculateDepth, countNodes]);

  const addOperation = useCallback((operation: BSTOperation['operation'], value?: number, description?: string) => {
    const newOperation: BSTOperation = {
      operation,
      value,
      timestamp: Date.now(),
      treeState: root ? JSON.parse(JSON.stringify(root)) : null,
      description: description || `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation`
    };
    setOperations(prev => [...prev, newOperation]);
  }, [root]);

  const getThemeClasses = useCallback(() => {
    switch (theme) {
      case 'neon':
        return {
          default: '#00ffff',
          highlighted: '#ffff00',
          visited: '#ff00ff',
          border: '#00ffff',
          background: '#000033'
        };
      case 'minimal':
        return {
          default: '#6b7280',
          highlighted: '#f59e0b',
          visited: '#10b981',
          border: '#374151',
          background: '#ffffff'
        };
      default:
        return {
          default: '#1e3a8a',
          highlighted: '#22c55e',
          visited: '#8b5cf6',
          border: '#3b82f6',
          background: '#f1f5f9'
        };
    }
  }, [theme]);

  const generateFlowData = useCallback((node: TreeNode | null, x = 0, y = 0, horizontalGap = 400, depth = 0): { nodes: Node[], edges: Edge[] } => {
    if (!node) return { nodes: [], edges: [] };

    const themeColors = getThemeClasses();
    const currentId = node.value.toString();
    
    let nodeColor = themeColors.default;
    if (foundNode === node.value) nodeColor = themeColors.highlighted;
    if (node.isHighlighted) nodeColor = themeColors.visited;

    const newNodes: Node[] = [{
      id: currentId,
      data: { 
        label: (
          <div className="flex flex-col items-center">
            {showNodeValues && <span className="font-bold">{node.value}</span>}
            {showDepth && <span className="text-xs">{`d:${depth}`}</span>}
          </div>
        )
      },
      position: { x, y },
      style: { 
        background: nodeColor,
        color: theme === 'neon' ? 'black' : 'white',
        border: `2px solid ${themeColors.border}`,
        borderRadius: '50%',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    }];
    const newEdges: Edge[] = [];

    const gap = horizontalGap / 2;

    if (node.left) {
      const leftId = node.left.value.toString();
      const leftData = generateFlowData(node.left, x - gap, y + NODE_HEIGHT, gap, depth + 1);
      newNodes.push(...leftData.nodes);
      newEdges.push(...leftData.edges);
      newEdges.push({ 
        id: `${currentId}-${leftId}`, 
        source: currentId, 
        target: leftId, 
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: themeColors.border, strokeWidth: 2 }
      });
    }

    if (node.right) {
      const rightId = node.right.value.toString();
      const rightData = generateFlowData(node.right, x + gap, y + NODE_HEIGHT, gap, depth + 1);
      newNodes.push(...rightData.nodes);
      newEdges.push(...rightData.edges);
      newEdges.push({ 
        id: `${currentId}-${rightId}`, 
        source: currentId, 
        target: rightId, 
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: themeColors.border, strokeWidth: 2 }
      });
    }

    return { nodes: newNodes, edges: newEdges };
  }, [foundNode, theme, showNodeValues, showDepth, getThemeClasses]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateFlowData(root);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [root, generateFlowData]);

  const handleInsert = useCallback(() => {
    setError(null);
    setFoundNode(null);
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }

    const insertNode = (node: TreeNode | null, val: number): TreeNode => {
      if (!node) {
        addOperation('insert', val, `Inserted ${val} into the tree`);
        return new TreeNode(val);
      }
      if (val < node.value) {
        node.left = insertNode(node.left, val);
      } else if (val > node.value) {
        node.right = insertNode(node.right, val);
      } else {
        setError(`Node with value ${val} already exists.`);
        return node;
      }
      return node;
    };
    
    setRoot(prevRoot => insertNode(JSON.parse(JSON.stringify(prevRoot || null)), value));
    setInputValue('');
  }, [inputValue, addOperation]);

  const handleSearch = useCallback(() => {
    setError(null);
    const value = parseInt(searchValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number to search.");
      return;
    }

    let found = false;
    const searchTree = (node: TreeNode | null, val: number) => {
        if(!node) return;
        if(node.value === val) {
            found = true;
            setFoundNode(val);
            addOperation('search', val, `Found ${val} in the tree`);
            return;
        }
        if(val < node.value) searchTree(node.left, val);
        else searchTree(node.right, val);
    }
    searchTree(root, value);
    if(!found) {
        setError(`Node with value ${value} not found.`);
        setFoundNode(null);
        addOperation('search', value, `Searched for ${value} - not found`);
    }
    setSearchValue('');
  }, [searchValue, root, addOperation]);

  const handleDelete = useCallback(() => {
    setError(null);
    setFoundNode(null);
    const value = parseInt(deleteValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number to delete.");
      return;
    }

    const findMin = (node: TreeNode): TreeNode => {
        return node.left ? findMin(node.left) : node;
    }

    let deleted = false;
    const deleteNode = (node: TreeNode | null, val: number): TreeNode | null => {
        if(!node) {
            setError(`Node with value ${val} not found.`);
            return null;
        }

        if(val < node.value) {
            node.left = deleteNode(node.left, val);
        } else if (val > node.value) {
            node.right = deleteNode(node.right, val);
        } else {
            deleted = true;
            if(!node.left) return node.right;
            if(!node.right) return node.left;

            const minNode = findMin(node.right);
            node.value = minNode.value;
            node.right = deleteNode(node.right, minNode.value);
        }
        return node;
    }
    
    const newRoot = deleteNode(JSON.parse(JSON.stringify(root || null)), value);
    if (deleted) {
      addOperation('delete', value, `Deleted ${value} from the tree`);
    }
    setRoot(newRoot);
    setDeleteValue('');
  }, [deleteValue, root, addOperation]);

  const handleClear = useCallback(() => {
    setRoot(null);
    setError(null);
    setFoundNode(null);
    setInputValue('');
    setSearchValue('');
    setDeleteValue('');
    setTraversalResult([]);
    addOperation('clear', undefined, 'Cleared the entire tree');
  }, [addOperation]);

  // Tree traversal functions
  const traverseTree = useCallback(async () => {
    if (!root || isTraversing) return;
    
    setIsTraversing(true);
    setTraversalResult([]);
    setError(null);
    
    const result: number[] = [];
    const visitedNodes: number[] = [];

    const clearHighlights = () => {
      const clearNode = (node: TreeNode | null) => {
        if (!node) return;
        node.isHighlighted = false;
        clearNode(node.left);
        clearNode(node.right);
      };
      clearNode(root);
    };

    const highlightNode = (value: number) => {
      const highlightNodeValue = (node: TreeNode | null) => {
        if (!node) return;
        if (node.value === value) node.isHighlighted = true;
        highlightNodeValue(node.left);
        highlightNodeValue(node.right);
      };
      clearHighlights();
      highlightNodeValue(root);
      setRoot({...root}); // Trigger re-render
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const inorder = async (node: TreeNode | null) => {
      if (!node) return;
      await inorder(node.left);
      highlightNode(node.value);
      result.push(node.value);
      visitedNodes.push(node.value);
      setTraversalResult([...result]);
      await sleep(animationSpeed);
      await inorder(node.right);
    };

    const preorder = async (node: TreeNode | null) => {
      if (!node) return;
      highlightNode(node.value);
      result.push(node.value);
      visitedNodes.push(node.value);
      setTraversalResult([...result]);
      await sleep(animationSpeed);
      await preorder(node.left);
      await preorder(node.right);
    };

    const postorder = async (node: TreeNode | null) => {
      if (!node) return;
      await postorder(node.left);
      await postorder(node.right);
      highlightNode(node.value);
      result.push(node.value);
      visitedNodes.push(node.value);
      setTraversalResult([...result]);
      await sleep(animationSpeed);
    };

    const levelorder = async (node: TreeNode | null) => {
      if (!node) return;
      const queue: TreeNode[] = [node];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        highlightNode(current.value);
        result.push(current.value);
        visitedNodes.push(current.value);
        setTraversalResult([...result]);
        await sleep(animationSpeed);
        
        if (current.left) queue.push(current.left);
        if (current.right) queue.push(current.right);
      }
    };

    try {
      switch (traversalMode) {
        case 'inorder':
          await inorder(root);
          break;
        case 'preorder':
          await preorder(root);
          break;
        case 'postorder':
          await postorder(root);
          break;
        case 'levelorder':
          await levelorder(root);
          break;
      }
    } finally {
      clearHighlights();
      setRoot({...root}); // Final update to clear highlights
      setIsTraversing(false);
    }
  }, [root, traversalMode, animationSpeed, isTraversing]);

  // Auto demo effect
  useEffect(() => {
    let autoTimer: NodeJS.Timeout | null = null;
    
    if (autoDemo && !isTraversing) {
      if (countNodes(root) < 10 && Math.random() > 0.3) {
        autoTimer = setTimeout(() => {
          const randomValue = Math.floor(Math.random() * 100) + 1;
          setInputValue(randomValue.toString());
          setTimeout(() => handleInsert(), 100);
        }, animationSpeed * 2);
      } else if (root && Math.random() > 0.7) {
        autoTimer = setTimeout(() => {
          traverseTree();
        }, animationSpeed * 3);
      }
    }

    return () => {
      if (autoTimer) {
        clearTimeout(autoTimer);
      }
    };
  }, [autoDemo, root, animationSpeed, isTraversing, handleInsert, traverseTree, countNodes]);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Binary Search Tree Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visualizer" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="visualizer" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)} 
                  placeholder="Value to insert"
                  disabled={isTraversing}
                />
                <Button onClick={handleInsert} disabled={isTraversing}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={searchValue} 
                  onChange={(e) => setSearchValue(e.target.value)} 
                  placeholder="Value to search"
                  disabled={isTraversing}
                />
                <Button onClick={handleSearch} variant="outline" disabled={isTraversing}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={deleteValue} 
                  onChange={(e) => setDeleteValue(e.target.value)} 
                  placeholder="Value to delete"
                  disabled={isTraversing}
                />
                <Button onClick={handleDelete} variant="outline" disabled={isTraversing}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Button onClick={handleClear} variant="destructive" disabled={isTraversing}>
                Clear Tree
              </Button>
              <Select value={traversalMode} onValueChange={(value: TraversalMode) => setTraversalMode(value)} disabled={isTraversing}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inorder">In-order</SelectItem>
                  <SelectItem value="preorder">Pre-order</SelectItem>
                  <SelectItem value="postorder">Post-order</SelectItem>
                  <SelectItem value="levelorder">Level-order</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={traverseTree} variant="secondary" disabled={isTraversing || !root}>
                {isTraversing ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Traversing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Traverse ({traversalMode})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoDemo(!autoDemo)}
                disabled={isTraversing}
              >
                {autoDemo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoDemo ? 'Pause' : 'Auto Demo'}
              </Button>
            </div>

            {error && (
              <div className={`text-sm text-center p-3 rounded-lg ${
                error.includes('found') && !error.includes('not found') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-500 bg-red-50 border border-red-200'
              }`}>
                {error}
              </div>
            )}

            {traversalResult.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">{traversalMode.charAt(0).toUpperCase() + traversalMode.slice(1)} Traversal Result:</h4>
                <div className="flex flex-wrap gap-2">
                  {traversalResult.map((value, index) => (
                    <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`w-full h-[500px] rounded-lg border relative ${theme === 'neon' ? 'bg-black' : 'bg-muted'}`}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
              >
                <Controls />
                <Background color={theme === 'neon' ? '#00ffff' : undefined} />
              </ReactFlow>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Binary Search Tree Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>BST Property:</strong> Left child &le; parent &lt; right child for all nodes.</div>
                <div><strong>Insert:</strong> O(log n) average, O(n) worst case - follow BST property.</div>
                <div><strong>Search:</strong> O(log n) average, O(n) worst case - compare and go left/right.</div>
                <div><strong>Delete:</strong> O(log n) average - handle 3 cases: leaf, one child, two children.</div>
                <div><strong>Traversals:</strong> In-order gives sorted sequence, pre/post-order for tree reconstruction.</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Operation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {operations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No operations performed yet</p>
                  ) : (
                    operations.slice().reverse().map((op, index) => (
                      <div key={operations.length - index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                            {op.operation.toUpperCase()}
                          </span>
                          <span className="text-sm">{op.description}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(op.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.totalInsertions}</p>
                      <p className="text-sm text-muted-foreground">Total Insertions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.totalDeletions}</p>
                      <p className="text-sm text-muted-foreground">Total Deletions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.totalSearches}</p>
                      <p className="text-sm text-muted-foreground">Total Searches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.maxDepth}</p>
                      <p className="text-sm text-muted-foreground">Tree Depth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.nodeCount}</p>
                      <p className="text-sm text-muted-foreground">Node Count</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.operationCount}</p>
                      <p className="text-sm text-muted-foreground">Total Operations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tree Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Animation Speed: {animationSpeed}ms</Label>
                  <Slider
                    value={[animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                    max={2000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </Label>
                  <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="neon">Neon</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-values">Show Node Values</Label>
                    <Switch
                      id="show-values"
                      checked={showNodeValues}
                      onCheckedChange={setShowNodeValues}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-depth">Show Node Depth</Label>
                    <Switch
                      id="show-depth"
                      checked={showDepth}
                      onCheckedChange={setShowDepth}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-demo">Auto Demo Mode</Label>
                    <Switch
                      id="auto-demo"
                      checked={autoDemo}
                      onCheckedChange={setAutoDemo}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
