"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CornerDownLeft, Plus, Play, Eye, BarChart3 } from "lucide-react";

const DEFAULT_STACK_LIMIT = 8;
const MAX_STACK_LIMIT = 15;
const MIN_STACK_LIMIT = 3;

interface StackOperation {
  operation: 'push' | 'pop' | 'peek' | 'clear';
  value?: number;
  timestamp: number;
  stackState: number[];
  description: string;
}

interface StackStats {
  totalOperations: number;
  pushCount: number;
  popCount: number;
  maxSize: number;
  currentSize: number;
}

export const StackVisualizer = () => {
  const [stack, setStack] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stackLimit, setStackLimit] = useState<number>(DEFAULT_STACK_LIMIT);
  const [animationSpeed, setAnimationSpeed] = useState<number>(500);
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal' | 'array'>('vertical');
  const [theme, setTheme] = useState<'default' | 'neon' | 'minimal'>('default');
  const [showIndices, setShowIndices] = useState<boolean>(true);
  const [autoDemo, setAutoDemo] = useState<boolean>(false);
  const [operations, setOperations] = useState<StackOperation[]>([]);
  
  const stats: StackStats = {
    totalOperations: operations.length,
    pushCount: operations.filter(op => op.operation === 'push').length,
    popCount: operations.filter(op => op.operation === 'pop').length,
    maxSize: Math.max(0, ...operations.map(op => op.stackState.length)),
    currentSize: stack.length
  };

  const addOperation = useCallback((operation: StackOperation['operation'], value?: number, description?: string) => {
    const newOperation: StackOperation = {
      operation,
      value,
      timestamp: Date.now(),
      stackState: [...stack],
      description: description || `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation`
    };
    setOperations(prev => [...prev, newOperation]);
  }, [stack]);

  const handlePush = useCallback(() => {
    setError(null);
    if (stack.length >= stackLimit) {
      setError(`Stack is full. Maximum size is ${stackLimit}.`);
      return;
    }
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }
    
    const newStack = [...stack, value];
    setStack(newStack);
    setInputValue("");
    addOperation('push', value, `Pushed ${value} onto the stack`);
  }, [stack, stackLimit, inputValue, addOperation]);

  const handlePop = useCallback(() => {
    setError(null);
    if (stack.length === 0) {
      setError("Stack is empty. Cannot pop.");
      return;
    }
    
    const poppedValue = stack[stack.length - 1];
    const newStack = stack.slice(0, -1);
    setStack(newStack);
    addOperation('pop', poppedValue, `Popped ${poppedValue} from the stack`);
  }, [stack, addOperation]);

  const handlePeek = () => {
    setError(null);
    if (stack.length === 0) {
      setError("Stack is empty. Cannot peek.");
      return;
    }
    const topValue = stack[stack.length - 1];
    addOperation('peek', topValue, `Peeked at top element: ${topValue}`);
  };

  const handleReset = () => {
    setError(null);
    setStack([]);
    setInputValue("");
    setOperations([]);
    addOperation('clear', undefined, 'Cleared the stack');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePush();
    }
  };

  // Auto demo functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoDemo) {
      interval = setInterval(() => {
        const randomAction = Math.random();
        const randomValue = Math.floor(Math.random() * 100) + 1;
        
        if (randomAction < 0.7 && stack.length < stackLimit) {
          // Push operation (70% chance if stack not full)
          const newStack = [...stack, randomValue];
          setStack(newStack);
          addOperation('push', randomValue, `Auto-pushed ${randomValue}`);
        } else if (stack.length > 0) {
          // Pop operation if stack has elements
          const poppedValue = stack[stack.length - 1];
          const newStack = stack.slice(0, -1);
          setStack(newStack);
          addOperation('pop', poppedValue, `Auto-popped ${poppedValue}`);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoDemo, stack, stackLimit, addOperation]);

  const getThemeStyles = () => {
    switch (theme) {
      case 'neon':
        return {
          container: 'bg-gray-900 border-2 border-cyan-400',
          element: 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-lg shadow-cyan-500/50',
          background: 'bg-gray-900'
        };
      case 'minimal':
        return {
          container: 'bg-gray-50 border border-gray-200',
          element: 'bg-white text-gray-800 border border-gray-300 shadow-sm',
          background: 'bg-gray-50'
        };
      default:
        return {
          container: 'bg-muted border',
          element: 'bg-primary text-primary-foreground shadow',
          background: 'bg-muted'
        };
    }
  };

  const themeStyles = getThemeStyles();

  const renderVerticalStack = () => (
    <div className={`relative ${themeStyles.background} rounded-lg h-96 w-full flex flex-col-reverse items-center p-4 ${themeStyles.container}`}>
      <AnimatePresence>
        {stack.map((value, index) => (
          <motion.div
            key={`${index}-${value}`}
            layout
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: animationSpeed / 1000 } }}
            transition={{ duration: animationSpeed / 1000 }}
            className={`${themeStyles.element} w-3/4 h-12 flex items-center justify-center rounded-md mb-2 text-lg font-bold relative`}
          >
            {value}
            {showIndices && (
              <span className="absolute -right-8 text-xs text-gray-500">
                [{index}]
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {stack.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-bold"
        >
          TOP ({stack[stack.length - 1]})
        </motion.div>
      )}
      
      <div className="absolute bottom-2 left-2 text-xs text-gray-600">
        Size: {stack.length}/{stackLimit}
      </div>
    </div>
  );

  const renderHorizontalStack = () => (
    <div className={`relative ${themeStyles.background} rounded-lg h-24 w-full flex items-center p-4 overflow-x-auto ${themeStyles.container}`}>
      <div className="flex gap-2 min-w-full items-center">
        <AnimatePresence>
          {stack.map((value, index) => (
            <motion.div
              key={`${index}-${value}`}
              layout
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8, transition: { duration: animationSpeed / 1000 } }}
              transition={{ duration: animationSpeed / 1000 }}
              className={`${themeStyles.element} min-w-[60px] h-16 flex flex-col items-center justify-center rounded-md text-sm font-bold relative`}
            >
              {value}
              {showIndices && (
                <span className="absolute -bottom-6 text-xs text-gray-500">
                  [{index}]
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {stack.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm font-bold"
          >
            ← TOP
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderArrayView = () => (
    <div className={`${themeStyles.background} rounded-lg p-4 ${themeStyles.container}`}>
      <div className="grid grid-cols-8 gap-2 mb-4">
        {Array.from({ length: stackLimit }, (_, index) => (
          <div
            key={index}
            className={`h-16 border-2 border-dashed rounded-md flex items-center justify-center text-sm font-bold
              ${index < stack.length 
                ? themeStyles.element 
                : 'border-gray-300 bg-gray-100 text-gray-400'
              }`}
          >
            {index < stack.length ? stack[index] : '–'}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-600 text-center">
        Array representation: Index 0 (bottom) → Index {stackLimit - 1} (top)
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Enhanced Stack Visualizer
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
              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a value"
                    aria-label="Value to push"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handlePush} aria-label="Push value">
                    <Plus className="h-4 w-4 mr-2" /> Push
                  </Button>
                  
                  <Button onClick={handlePop} variant="outline" aria-label="Pop value">
                    <CornerDownLeft className="h-4 w-4 mr-2" /> Pop
                  </Button>
                  
                  <Button onClick={handlePeek} variant="outline" aria-label="Peek value">
                    <Eye className="h-4 w-4 mr-2" /> Peek
                  </Button>
                  
                  <Button onClick={handleReset} variant="destructive" aria-label="Reset stack">
                    <Trash2 className="h-4 w-4 mr-2" /> Clear
                  </Button>
                </div>
              </div>

              {/* View Mode Selector */}
              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium">View Mode:</span>
                <Select value={viewMode} onValueChange={(value: 'vertical' | 'horizontal' | 'array') => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                    <SelectItem value="array">Array View</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoDemo(!autoDemo)}
                  className={autoDemo ? "bg-green-100" : ""}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {autoDemo ? 'Stop Demo' : 'Auto Demo'}
                </Button>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</p>}

              {/* Stack Visualization */}
              <div className="mt-6">
                {viewMode === 'vertical' && renderVerticalStack()}
                {viewMode === 'horizontal' && renderHorizontalStack()}
                {viewMode === 'array' && renderArrayView()}
              </div>

              {/* Stack Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stack.length}</div>
                    <div className="text-sm text-gray-600">Current Size</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stackLimit - stack.length}</div>
                    <div className="text-sm text-gray-600">Available Space</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stack.length > 0 ? stack[stack.length - 1] : '–'}
                    </div>
                    <div className="text-sm text-gray-600">Top Element</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="space-y-4">
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <div className="p-4">
                  <h4 className="font-semibold mb-4">Operation History</h4>
                  
                  {operations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No operations yet. Start by pushing some elements!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {operations.slice(-20).reverse().map((op, index) => (
                        <div key={operations.length - index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                              #{operations.length - index}
                            </span>
                            <span className={`text-sm font-medium ${
                              op.operation === 'push' ? 'text-green-600' :
                              op.operation === 'pop' ? 'text-red-600' :
                              op.operation === 'peek' ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {op.operation.toUpperCase()}
                            </span>
                            <span className="text-sm">{op.description}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Size: {op.stackState.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Operation Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Operations:</span>
                        <span className="font-semibold">{stats.totalOperations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Push Operations:</span>
                        <span className="font-semibold text-green-600">{stats.pushCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pop Operations:</span>
                        <span className="font-semibold text-red-600">{stats.popCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Size Reached:</span>
                        <span className="font-semibold text-blue-600">{stats.maxSize}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Stack Properties</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>LIFO Principle:</span>
                        <span className="text-green-600 font-semibold">✓ Enforced</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Capacity:</span>
                        <span className="font-semibold">{stackLimit} elements</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage:</span>
                        <span className="font-semibold">
                          {Math.round((stack.length / stackLimit) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Is Empty:</span>
                        <span className={`font-semibold ${stack.length === 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {stack.length === 0 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Visual Statistics */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Operation Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm">Push ({stats.pushCount}):</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full transition-all duration-500"
                          style={{ 
                            width: stats.totalOperations > 0 ? `${(stats.pushCount / stats.totalOperations) * 100}%` : '0%' 
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {stats.totalOperations > 0 ? Math.round((stats.pushCount / stats.totalOperations) * 100) : 0}%
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-24 text-sm">Pop ({stats.popCount}):</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-red-500 h-4 rounded-full transition-all duration-500"
                          style={{ 
                            width: stats.totalOperations > 0 ? `${(stats.popCount / stats.totalOperations) * 100}%` : '0%' 
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {stats.totalOperations > 0 ? Math.round((stats.popCount / stats.totalOperations) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stack Capacity</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[stackLimit]}
                        onValueChange={(value) => setStackLimit(value[0])}
                        min={MIN_STACK_LIMIT}
                        max={MAX_STACK_LIMIT}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-semibold w-16 text-center">
                        {stackLimit}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Animation Speed</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[animationSpeed]}
                        onValueChange={(value) => setAnimationSpeed(value[0])}
                        min={100}
                        max={1000}
                        step={50}
                        className="flex-1"
                      />
                      <span className="text-sm font-semibold w-16 text-center">
                        {animationSpeed}ms
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Theme</label>
                    <Select value={theme} onValueChange={(value: 'default' | 'neon' | 'minimal') => setTheme(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="neon">Neon</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Indices</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIndices(!showIndices)}
                      className={showIndices ? "bg-blue-100" : ""}
                    >
                      {showIndices ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Stack Concepts</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <strong>LIFO (Last In, First Out):</strong> The last element added to the stack is the first one to be removed.
                    </div>
                    <div>
                      <strong>Push Operation:</strong> Adds an element to the top of the stack.
                    </div>
                    <div>
                      <strong>Pop Operation:</strong> Removes and returns the top element from the stack.
                    </div>
                    <div>
                      <strong>Peek Operation:</strong> Returns the top element without removing it.
                    </div>
                    <div>
                      <strong>Time Complexity:</strong> All operations are O(1) - constant time.
                    </div>
                    <div>
                      <strong>Use Cases:</strong> Function calls, expression evaluation, undo operations, browser history.
                    </div>
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
