"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight, 
  Link2, 
  Unlink,
  Search,
  Play,
  Pause,
  Activity,
  Clock,
  BarChart3,
  Palette,
  Target,
  ChevronRight,
  Eye
} from "lucide-react";

interface Node {
  id: number;
  value: number;
  isHighlighted?: boolean;
}

interface LinkedListOperation {
  operation: 'insert-head' | 'insert-tail' | 'insert-at' | 'delete' | 'search' | 'clear';
  value?: number;
  index?: number;
  timestamp: number;
  listState: Node[];
  description: string;
}

interface LinkedListStatistics {
  totalInsertions: number;
  totalDeletions: number;
  totalSearches: number;
  maxSize: number;
  averageSize: number;
  operationCount: number;
}

type ViewMode = 'horizontal' | 'vertical' | 'memory';
type Theme = 'default' | 'neon' | 'minimal';

const DEFAULT_LIST_LIMIT = 10;

export const LinkedListVisualizer = () => {
  const [list, setList] = useState<Node[]>([]);
  const [insertValue, setInsertValue] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [insertIndex, setInsertIndex] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [operations, setOperations] = useState<LinkedListOperation[]>([]);
  const [statistics, setStatistics] = useState<LinkedListStatistics>({
    totalInsertions: 0,
    totalDeletions: 0,
    totalSearches: 0,
    maxSize: 0,
    averageSize: 0,
    operationCount: 0,
  });

  // Settings
  const [listLimit, setListLimit] = useState(DEFAULT_LIST_LIMIT);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [viewMode, setViewMode] = useState<ViewMode>('horizontal');
  const [theme, setTheme] = useState<Theme>('default');
  const [autoDemo, setAutoDemo] = useState(false);
  const [showIndices, setShowIndices] = useState(true);
  const [showPointers, setShowPointers] = useState(true);
  const [isTraversing, setIsTraversing] = useState(false);

  const nodeId = useRef(0);

  // Update statistics
  useEffect(() => {
    const totalOps = operations.length;
    const insertions = operations.filter(op => op.operation.includes('insert')).length;
    const deletions = operations.filter(op => op.operation === 'delete').length;
    const searches = operations.filter(op => op.operation === 'search').length;
    const maxSize = Math.max(...operations.map(op => op.listState.length), list.length);
    const averageSize = totalOps > 0 
      ? operations.reduce((sum, op) => sum + op.listState.length, 0) / totalOps 
      : 0;

    setStatistics({
      totalInsertions: insertions,
      totalDeletions: deletions,
      totalSearches: searches,
      maxSize,
      averageSize: Math.round(averageSize * 100) / 100,
      operationCount: totalOps,
    });
  }, [operations, list]);

  const createNode = (value: number): Node => ({
    id: Date.now() + nodeId.current++,
    value,
    isHighlighted: false,
  });

  const addOperation = useCallback((operation: LinkedListOperation['operation'], value?: number, index?: number, description?: string) => {
    const newOperation: LinkedListOperation = {
      operation,
      value,
      index,
      timestamp: Date.now(),
      listState: [...list],
      description: description || `${operation.replace('-', ' ')} operation`
    };
    setOperations(prev => [...prev, newOperation]);
  }, [list]);

  const handleInsert = useCallback((position: "head" | "tail" | "at", inputValue?: string) => {
    setError(null);
    const valueStr = inputValue || insertValue;
    
    if (list.length >= listLimit) {
      setError(`List is full. Maximum size is ${listLimit}.`);
      return;
    }
    
    const value = parseInt(valueStr, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number to insert.");
      return;
    }

    const newNode = createNode(value);
    let newList: Node[] = [];
    let description = "";

    if (position === "head") {
      newList = [newNode, ...list];
      description = `Inserted ${value} at head`;
      addOperation('insert-head', value, 0, description);
    } else if (position === "tail") {
      newList = [...list, newNode];
      description = `Inserted ${value} at tail`;
      addOperation('insert-tail', value, list.length, description);
    } else if (position === "at") {
      const index = parseInt(insertIndex, 10);
      if (isNaN(index) || index < 0 || index > list.length) {
        setError(`Please enter a valid index between 0 and ${list.length}.`);
        return;
      }
      newList = [...list.slice(0, index), newNode, ...list.slice(index)];
      description = `Inserted ${value} at index ${index}`;
      addOperation('insert-at', value, index, description);
      setInsertIndex("");
    }

    setList(newList);
    setInsertValue("");
  }, [list, listLimit, insertValue, insertIndex, addOperation]);

  const handleDelete = useCallback((inputValue?: string) => {
    setError(null);
    const valueStr = inputValue || deleteValue;
    const value = parseInt(valueStr, 10);
    
    if (isNaN(value)) {
      setError("Please enter a valid number to delete.");
      return;
    }
    
    const nodeIndex = list.findIndex((node) => node.value === value);
    if (nodeIndex === -1) {
      setError(`Node with value ${value} not found.`);
      return;
    }
    
    const newList = list.filter((_, index) => index !== nodeIndex);
    setList(newList);
    setDeleteValue("");
    addOperation('delete', value, nodeIndex, `Deleted node with value ${value} from index ${nodeIndex}`);
  }, [list, deleteValue, addOperation]);

  const handleSearch = useCallback(() => {
    setError(null);
    const value = parseInt(searchValue, 10);
    
    if (isNaN(value)) {
      setError("Please enter a valid number to search.");
      return;
    }

    setIsTraversing(true);
    
    // Animate traversal
    let currentIndex = 0;
    const traverseNext = () => {
      if (currentIndex >= list.length) {
        setError(`Value ${value} not found in the list.`);
        setIsTraversing(false);
        addOperation('search', value, -1, `Searched for ${value} - not found`);
        return;
      }

      // Highlight current node
      setList(prevList => 
        prevList.map((node, index) => ({
          ...node,
          isHighlighted: index === currentIndex
        }))
      );

      if (list[currentIndex].value === value) {
        setTimeout(() => {
          setError(null);
          setIsTraversing(false);
          addOperation('search', value, currentIndex, `Found ${value} at index ${currentIndex}`);
          // Clear highlights after a delay
          setTimeout(() => {
            setList(prevList => 
              prevList.map(node => ({
                ...node,
                isHighlighted: false
              }))
            );
          }, 1000);
        }, animationSpeed);
        return;
      }

      currentIndex++;
      setTimeout(traverseNext, animationSpeed);
    };

    traverseNext();
    setSearchValue("");
  }, [list, searchValue, animationSpeed, addOperation]);

  const handleClear = useCallback(() => {
    setList([]);
    setError(null);
    setInsertValue("");
    setDeleteValue("");
    setSearchValue("");
    setInsertIndex("");
    addOperation('clear', undefined, undefined, 'Cleared the entire list');
  }, [addOperation]);

  // Auto demo effect
  useEffect(() => {
    let autoTimer: NodeJS.Timeout | null = null;
    
    if (autoDemo && !isTraversing) {
      if (list.length < listLimit && Math.random() > 0.3) {
        autoTimer = setTimeout(() => {
          const randomValue = Math.floor(Math.random() * 100) + 1;
          const position = Math.random() > 0.5 ? 'head' : 'tail';
          handleInsert(position, randomValue.toString());
        }, animationSpeed * 2);
      } else if (list.length > 0) {
        autoTimer = setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * list.length);
          const valueToDelete = list[randomIndex].value;
          handleDelete(valueToDelete.toString());
        }, animationSpeed * 2);
      }
    }

    return () => {
      if (autoTimer) {
        clearTimeout(autoTimer);
      }
    };
  }, [autoDemo, list, listLimit, animationSpeed, isTraversing, handleInsert, handleDelete]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'neon':
        return {
          container: 'bg-black/90 border-cyan-500/50',
          node: 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50',
          highlighted: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-400/50',
          arrow: 'text-cyan-400',
          pointer: 'bg-green-400 text-black',
          null: 'text-red-400'
        };
      case 'minimal':
        return {
          container: 'bg-white border-gray-200',
          node: 'bg-gray-100 text-gray-900 border border-gray-300',
          highlighted: 'bg-yellow-200 text-yellow-900 border-yellow-400',
          arrow: 'text-gray-600',
          pointer: 'bg-blue-100 text-blue-900',
          null: 'text-gray-400'
        };
      default:
        return {
          container: 'bg-muted border',
          node: 'bg-primary text-primary-foreground shadow',
          highlighted: 'bg-yellow-500 text-yellow-900 shadow-lg',
          arrow: 'text-muted-foreground',
          pointer: 'bg-green-500 text-white',
          null: 'text-muted-foreground'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const renderHorizontalList = () => (
    <div className={`relative ${themeClasses.container} rounded-lg min-h-[140px] w-full flex items-center justify-center p-4 overflow-x-auto`}>
      {list.length > 0 && (
        <div className={`absolute top-2 left-2 ${themeClasses.pointer} px-2 py-1 rounded text-xs font-bold`}>
          HEAD
        </div>
      )}
      <div className="flex items-center min-w-max">
        <AnimatePresence>
          {list.map((node, index) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: animationSpeed / 1000 }}
              className="flex items-center"
            >
              <div className={`relative ${node.isHighlighted ? themeClasses.highlighted : themeClasses.node} w-20 h-20 flex flex-col items-center justify-center rounded-md text-lg font-bold z-10`}>
                {showIndices && (
                  <div className="absolute -top-6 bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
                    {index}
                  </div>
                )}
                {node.value}
                {showPointers && (
                  <div className="absolute -bottom-6 text-xs text-muted-foreground">
                    next
                  </div>
                )}
              </div>
              {index < list.length - 1 && (
                <motion.div 
                  initial={{opacity: 0}} 
                  animate={{opacity: 1}} 
                  exit={{opacity: 0}} 
                  className={`flex items-center mx-2 ${themeClasses.arrow}`}
                >
                  <div className="w-8 h-0.5 bg-current"></div>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className={`${themeClasses.null} font-mono text-lg ml-4 px-2 py-1 rounded border border-dashed`}>
          null
        </div>
      </div>
    </div>
  );

  const renderVerticalList = () => (
    <div className={`relative ${themeClasses.container} rounded-lg min-h-[400px] w-full max-w-[300px] mx-auto flex flex-col items-center p-4`}>
      {list.length > 0 && (
        <div className={`${themeClasses.pointer} px-2 py-1 rounded text-xs font-bold mb-2`}>
          HEAD
        </div>
      )}
      <div className="flex flex-col items-center space-y-2">
        <AnimatePresence>
          {list.map((node, index) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: animationSpeed / 1000 }}
              className="flex flex-col items-center"
            >
              <div className={`relative ${node.isHighlighted ? themeClasses.highlighted : themeClasses.node} w-24 h-16 flex items-center justify-center rounded-md text-lg font-bold`}>
                {showIndices && (
                  <div className="absolute -left-8 bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
                    {index}
                  </div>
                )}
                {node.value}
              </div>
              {index < list.length - 1 && (
                <motion.div 
                  initial={{opacity: 0}} 
                  animate={{opacity: 1}} 
                  exit={{opacity: 0}} 
                  className={`flex flex-col items-center my-1 ${themeClasses.arrow}`}
                >
                  <div className="w-0.5 h-4 bg-current"></div>
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className={`${themeClasses.null} font-mono text-lg mt-2 px-2 py-1 rounded border border-dashed`}>
          null
        </div>
      </div>
    </div>
  );

  const renderMemoryView = () => (
    <div className={`relative ${themeClasses.container} rounded-lg min-h-[300px] w-full p-4`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {list.map((node, index) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: animationSpeed / 1000 }}
              className={`${node.isHighlighted ? themeClasses.highlighted : themeClasses.node} p-4 rounded-lg`}
            >
              <div className="text-xs font-mono mb-2">Address: 0x{node.id.toString(16).toUpperCase()}</div>
              <div className="text-lg font-bold mb-2">Value: {node.value}</div>
              <div className="text-xs">
                Next: {index < list.length - 1 ? `0x${list[index + 1].id.toString(16).toUpperCase()}` : 'null'}
              </div>
              {showIndices && (
                <div className="text-xs mt-1 opacity-75">Index: {index}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderList = () => {
    switch (viewMode) {
      case 'vertical':
        return renderVerticalList();
      case 'memory':
        return renderMemoryView();
      default:
        return renderHorizontalList();
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Linked List Data Structure Visualizer
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Insert Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={insertValue}
                      onChange={(e) => setInsertValue(e.target.value)}
                      placeholder="Value to insert"
                      className="flex-grow"
                      disabled={isTraversing}
                    />
                    <Button onClick={() => handleInsert("head")} disabled={isTraversing}>
                      <Plus className="h-4 w-4 mr-1" /> Head
                    </Button>
                    <Button onClick={() => handleInsert("tail")} disabled={isTraversing}>
                      <Plus className="h-4 w-4 mr-1" /> Tail
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={insertIndex}
                      onChange={(e) => setInsertIndex(e.target.value)}
                      placeholder="Index"
                      className="w-20"
                      disabled={isTraversing}
                    />
                    <Input
                      type="number"
                      value={insertValue}
                      onChange={(e) => setInsertValue(e.target.value)}
                      placeholder="Value"
                      className="flex-grow"
                      disabled={isTraversing}
                    />
                    <Button onClick={() => handleInsert("at")} disabled={isTraversing}>
                      <Target className="h-4 w-4 mr-1" /> At Index
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={deleteValue}
                      onChange={(e) => setDeleteValue(e.target.value)}
                      placeholder="Value to delete"
                      className="flex-grow"
                      disabled={isTraversing}
                    />
                    <Button onClick={() => handleDelete()} variant="outline" disabled={isTraversing}>
                      <Unlink className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Value to search"
                      className="flex-grow"
                      disabled={isTraversing}
                    />
                    <Button onClick={handleSearch} variant="secondary" disabled={isTraversing}>
                      <Search className="h-4 w-4 mr-1" /> Search
                    </Button>
                  </div>
                  <Button onClick={handleClear} variant="destructive" className="w-full" disabled={isTraversing}>
                    <Trash2 className="h-4 w-4 mr-2" /> Clear List
                  </Button>
                </CardContent>
              </Card>
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

            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Size: {list.length}/{listLimit}</span>
                  <span className="text-sm text-muted-foreground">View: {viewMode}</span>
                  {isTraversing && (
                    <span className="text-sm text-blue-600 flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Traversing...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
              </div>
              {renderList()}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Linked List Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Dynamic Structure:</strong> Nodes can be stored anywhere in memory, connected via pointers.</div>
                <div><strong>Insert Head:</strong> O(1) - Add new node at the beginning.</div>
                <div><strong>Insert Tail:</strong> O(1) with tail pointer, O(n) without.</div>
                <div><strong>Delete:</strong> O(n) - Must traverse to find the node.</div>
                <div><strong>Search:</strong> O(n) - Linear search through all nodes.</div>
                <div><strong>Memory:</strong> Non-contiguous allocation, extra memory for pointers.</div>
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
                            {op.operation.toUpperCase().replace('-', ' ')}
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
                    <Unlink className="h-4 w-4 text-red-500" />
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
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.maxSize}</p>
                      <p className="text-sm text-muted-foreground">Max Size Reached</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.averageSize}</p>
                      <p className="text-sm text-muted-foreground">Average Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-500" />
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
                <CardTitle>Linked List Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>List Capacity: {listLimit}</Label>
                  <Slider
                    value={[listLimit]}
                    onValueChange={(value) => setListLimit(value[0])}
                    max={20}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

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
                  <Label className="text-base font-medium">View Mode</Label>
                  <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                      <SelectItem value="memory">Memory Layout</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="show-indices">Show Node Indices</Label>
                    <Switch
                      id="show-indices"
                      checked={showIndices}
                      onCheckedChange={setShowIndices}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-pointers">Show Pointer Labels</Label>
                    <Switch
                      id="show-pointers"
                      checked={showPointers}
                      onCheckedChange={setShowPointers}
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
