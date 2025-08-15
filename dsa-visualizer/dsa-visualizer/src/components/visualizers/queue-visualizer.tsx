"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  CornerDownRight, 
  Plus, 
  Play, 
  Pause, 
  Eye,
  Activity,
  Clock,
  BarChart3,
  Palette
} from "lucide-react";

const DEFAULT_QUEUE_LIMIT = 8;

interface QueueOperation {
  operation: 'enqueue' | 'dequeue' | 'clear' | 'peek';
  value?: number;
  timestamp: number;
  queueState: number[];
  description: string;
}

interface QueueStatistics {
  totalEnqueues: number;
  totalDequeues: number;
  maxSize: number;
  averageSize: number;
  operationCount: number;
}

type ViewMode = 'horizontal' | 'vertical' | 'circular';
type Theme = 'default' | 'neon' | 'minimal';

export const QueueVisualizer = () => {
  const [queue, setQueue] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [operations, setOperations] = useState<QueueOperation[]>([]);
  const [statistics, setStatistics] = useState<QueueStatistics>({
    totalEnqueues: 0,
    totalDequeues: 0,
    maxSize: 0,
    averageSize: 0,
    operationCount: 0,
  });

  // Settings
  const [queueLimit, setQueueLimit] = useState(DEFAULT_QUEUE_LIMIT);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [viewMode, setViewMode] = useState<ViewMode>('horizontal');
  const [theme, setTheme] = useState<Theme>('default');
  const [autoDemo, setAutoDemo] = useState(false);
  const [showIndices, setShowIndices] = useState(true);

  // Update statistics
  useEffect(() => {
    const totalOps = operations.length;
    const enqueues = operations.filter(op => op.operation === 'enqueue').length;
    const dequeues = operations.filter(op => op.operation === 'dequeue').length;
    const maxSize = Math.max(...operations.map(op => op.queueState.length), queue.length);
    const averageSize = totalOps > 0 
      ? operations.reduce((sum, op) => sum + op.queueState.length, 0) / totalOps 
      : 0;

    setStatistics({
      totalEnqueues: enqueues,
      totalDequeues: dequeues,
      maxSize,
      averageSize: Math.round(averageSize * 100) / 100,
      operationCount: totalOps,
    });
  }, [operations, queue]);

  const addOperation = useCallback((operation: QueueOperation['operation'], value?: number, description?: string) => {
    const newOperation: QueueOperation = {
      operation,
      value,
      timestamp: Date.now(),
      queueState: [...queue],
      description: description || `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation`
    };
    setOperations(prev => [...prev, newOperation]);
  }, [queue]);

  const handleEnqueue = useCallback(() => {
    setError(null);
    if (queue.length >= queueLimit) {
      setError(`Queue is full. Maximum size is ${queueLimit}.`);
      return;
    }
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }
    
    const newQueue = [...queue, value];
    setQueue(newQueue);
    setInputValue("");
    addOperation('enqueue', value, `Enqueued ${value} to the rear`);
  }, [queue, queueLimit, inputValue, addOperation]);

  const handleDequeue = useCallback(() => {
    setError(null);
    if (queue.length === 0) {
      setError("Queue is empty. Cannot dequeue.");
      return;
    }
    
    const dequeuedValue = queue[0];
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    addOperation('dequeue', dequeuedValue, `Dequeued ${dequeuedValue} from the front`);
  }, [queue, addOperation]);

  const handleClear = useCallback(() => {
    setQueue([]);
    setError(null);
    addOperation('clear', undefined, 'Cleared the entire queue');
  }, [addOperation]);

  const handlePeek = useCallback(() => {
    setError(null);
    if (queue.length === 0) {
      setError("Queue is empty. Cannot peek.");
      return;
    }
    const frontValue = queue[0];
    setError(null);
    addOperation('peek', frontValue, `Peeked at front value: ${frontValue}`);
  }, [queue, addOperation]);

  // Auto demo effect
  useEffect(() => {
    let autoTimer: NodeJS.Timeout | null = null;
    
    if (autoDemo && queue.length < queueLimit) {
      autoTimer = setTimeout(() => {
        const randomValue = Math.floor(Math.random() * 100) + 1;
        const newQueue = [...queue, randomValue];
        setQueue(newQueue);
        addOperation('enqueue', randomValue, `Auto-enqueued ${randomValue}`);
      }, animationSpeed * 2);
    } else if (autoDemo && queue.length > 0 && Math.random() > 0.7) {
      autoTimer = setTimeout(() => {
        const dequeuedValue = queue[0];
        const newQueue = queue.slice(1);
        setQueue(newQueue);
        addOperation('dequeue', dequeuedValue, `Auto-dequeued ${dequeuedValue}`);
      }, animationSpeed * 2);
    }

    return () => {
      if (autoTimer) {
        clearTimeout(autoTimer);
      }
    };
  }, [autoDemo, queue, queueLimit, animationSpeed, addOperation]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEnqueue();
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'neon':
        return {
          container: 'bg-black/90 border-cyan-500/50',
          element: 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50',
          label: 'bg-yellow-400 text-black',
          front: 'bg-green-400 text-black',
          rear: 'bg-red-400 text-black'
        };
      case 'minimal':
        return {
          container: 'bg-white border-gray-200',
          element: 'bg-gray-100 text-gray-900 border border-gray-300',
          label: 'bg-gray-600 text-white',
          front: 'bg-blue-100 text-blue-900',
          rear: 'bg-orange-100 text-orange-900'
        };
      default:
        return {
          container: 'bg-muted border',
          element: 'bg-primary text-primary-foreground shadow',
          label: 'bg-secondary text-secondary-foreground',
          front: 'bg-green-500 text-white',
          rear: 'bg-red-500 text-white'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const renderHorizontalQueue = () => (
    <div className={`relative ${themeClasses.container} rounded-lg min-h-[120px] w-full flex items-center p-4 overflow-x-auto`}>
      <div className="flex items-center space-x-2 min-w-max">
        <div className="text-sm font-medium text-muted-foreground">Front →</div>
        <AnimatePresence>
          {queue.map((value, index) => (
            <motion.div
              key={`${value}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.5, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -50, transition: { duration: animationSpeed / 1000 } }}
              transition={{ duration: animationSpeed / 1000 }}
              className={`relative ${themeClasses.element} w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-lg text-lg font-bold`}
            >
              {value}
              {showIndices && (
                <div className="absolute -top-6 bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
                  {index}
                </div>
              )}
              {index === 0 && (
                <div className={`absolute -bottom-8 ${themeClasses.front} px-2 py-1 rounded text-xs font-medium`}>
                  Front
                </div>
              )}
              {index === queue.length - 1 && (
                <div className={`absolute -bottom-8 ${themeClasses.rear} px-2 py-1 rounded text-xs font-medium`}>
                  Rear
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="text-sm font-medium text-muted-foreground">← Rear</div>
      </div>
    </div>
  );

  const renderVerticalQueue = () => (
    <div className={`relative ${themeClasses.container} rounded-lg min-h-[400px] w-full max-w-[200px] mx-auto flex flex-col-reverse items-center p-4`}>
      <div className="text-sm font-medium text-muted-foreground mb-2">↑ Front</div>
      <div className="flex flex-col-reverse space-y-reverse space-y-2 items-center">
        <AnimatePresence>
          {queue.map((value, index) => (
            <motion.div
              key={`${value}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50, transition: { duration: animationSpeed / 1000 } }}
              transition={{ duration: animationSpeed / 1000 }}
              className={`relative ${themeClasses.element} w-20 h-16 flex items-center justify-center rounded-lg text-lg font-bold`}
            >
              {value}
              {showIndices && (
                <div className="absolute -left-8 bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
                  {index}
                </div>
              )}
              {index === 0 && (
                <div className={`absolute -right-16 ${themeClasses.front} px-2 py-1 rounded text-xs font-medium`}>
                  Front
                </div>
              )}
              {index === queue.length - 1 && (
                <div className={`absolute -right-16 ${themeClasses.rear} px-2 py-1 rounded text-xs font-medium`}>
                  Rear
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="text-sm font-medium text-muted-foreground mt-2">Rear ↓</div>
    </div>
  );

  const renderCircularQueue = () => {
    const radius = 100;
    const centerX = radius + 40;
    const centerY = radius + 40;
    
    return (
      <div className={`relative ${themeClasses.container} rounded-lg min-h-[300px] w-full flex items-center justify-center p-4`}>
        <svg width={centerX * 2} height={centerY * 2} className="overflow-visible">
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="text-muted-foreground"
          />
          <AnimatePresence>
            {queue.map((value, index) => {
              const angle = (index / Math.max(queueLimit, queue.length)) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              
              return (
                <motion.g
                  key={`${value}-${index}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0, transition: { duration: animationSpeed / 1000 } }}
                  transition={{ duration: animationSpeed / 1000 }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    className={themeClasses.element}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    className="fill-current text-sm font-bold"
                    style={{ color: theme === 'neon' ? 'white' : theme === 'minimal' ? '#1f2937' : 'white' }}
                  >
                    {value}
                  </text>
                  {index === 0 && (
                    <text
                      x={x}
                      y={y - 35}
                      textAnchor="middle"
                      className="fill-green-500 text-xs font-medium"
                    >
                      Front
                    </text>
                  )}
                  {index === queue.length - 1 && (
                    <text
                      x={x}
                      y={y + 45}
                      textAnchor="middle"
                      className="fill-red-500 text-xs font-medium"
                    >
                      Rear
                    </text>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>
    );
  };

  const renderQueue = () => {
    switch (viewMode) {
      case 'vertical':
        return renderVerticalQueue();
      case 'circular':
        return renderCircularQueue();
      default:
        return renderHorizontalQueue();
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Queue Data Structure Visualizer
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
            <div className="flex flex-wrap gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a value"
                className="flex-grow min-w-[150px]"
                aria-label="Value to enqueue"
              />
              <Button onClick={handleEnqueue} aria-label="Enqueue value">
                <Plus className="h-4 w-4 mr-2" /> Enqueue
              </Button>
              <Button onClick={handleDequeue} variant="outline" aria-label="Dequeue value">
                <CornerDownRight className="h-4 w-4 mr-2" /> Dequeue
              </Button>
              <Button onClick={handlePeek} variant="secondary" aria-label="Peek at front value">
                <Eye className="h-4 w-4 mr-2" /> Peek
              </Button>
              <Button onClick={handleClear} variant="destructive" aria-label="Clear queue">
                <Trash2 className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Size: {queue.length}/{queueLimit}</span>
                  <span className="text-sm text-muted-foreground">View: {viewMode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoDemo(!autoDemo)}
                  >
                    {autoDemo ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {autoDemo ? 'Pause' : 'Auto Demo'}
                  </Button>
                </div>
              </div>
              {renderQueue()}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Queue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>FIFO Principle:</strong> First In, First Out - elements are added to the rear and removed from the front.</div>
                <div><strong>Enqueue:</strong> Add element to the rear of the queue.</div>
                <div><strong>Dequeue:</strong> Remove element from the front of the queue.</div>
                <div><strong>Front:</strong> The first element that will be dequeued.</div>
                <div><strong>Rear:</strong> The position where the next element will be enqueued.</div>
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
                      <p className="text-2xl font-bold">{statistics.totalEnqueues}</p>
                      <p className="text-sm text-muted-foreground">Total Enqueues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CornerDownRight className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.totalDequeues}</p>
                      <p className="text-sm text-muted-foreground">Total Dequeues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
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
                    <Activity className="h-4 w-4 text-purple-500" />
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
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{statistics.operationCount}</p>
                      <p className="text-sm text-muted-foreground">Total Operations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-teal-500" />
                    <div>
                      <p className="text-2xl font-bold">{queue.length}</p>
                      <p className="text-sm text-muted-foreground">Current Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Queue Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Queue Capacity: {queueLimit}</Label>
                  <Slider
                    value={[queueLimit]}
                    onValueChange={(value) => setQueueLimit(value[0])}
                    max={20}
                    min={3}
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
                      <SelectItem value="circular">Circular</SelectItem>
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-indices">Show Element Indices</Label>
                  <Switch
                    id="show-indices"
                    checked={showIndices}
                    onCheckedChange={setShowIndices}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
