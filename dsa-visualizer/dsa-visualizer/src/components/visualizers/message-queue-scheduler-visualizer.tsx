"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  priority: number;
  arrivalTime: number;
  processingTime: number;
  waitTime?: number;
  responseTime?: number;
  turnaroundTime?: number;
  status: 'waiting' | 'processing' | 'completed';
}

interface QueueStats {
  totalMessages: number;
  averageWaitTime: number;
  averageResponseTime: number;
  averageTurnaroundTime: number;
  throughput: number;
}

type SchedulingAlgorithm = 'FIFO' | 'Priority' | 'SJF' | 'RoundRobin';

export default function MessageQueueSchedulerVisualizer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<Message[]>([]);
  const [processingMessage, setProcessingMessage] = useState<Message | null>(null);
  const [completedMessages, setCompletedMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('FIFO');
  const [timeQuantum, setTimeQuantum] = useState(3);
  const [stats, setStats] = useState<QueueStats>({
    totalMessages: 0,
    averageWaitTime: 0,
    averageResponseTime: 0,
    averageTurnaroundTime: 0,
    throughput: 0
  });

  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [newProcessingTime, setNewProcessingTime] = useState(2);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const remainingQuantum = useRef(0);

  // Add new message to queue
  const addMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      content: newMessage,
      priority: newPriority,
      arrivalTime: currentTime,
      processingTime: newProcessingTime,
      status: 'waiting'
    };

    setMessages(prev => [...prev, message]);
    scheduleMessage(message);
    setNewMessage('');
  };

  // Schedule message based on algorithm
  const scheduleMessage = (message: Message) => {
    setWaitingQueue(prev => {
      const newQueue = [...prev, message];
      return sortQueue(newQueue, algorithm);
    });
  };

  // Sort queue based on scheduling algorithm
  const sortQueue = (queue: Message[], alg: SchedulingAlgorithm): Message[] => {
    switch (alg) {
      case 'FIFO':
        return queue.sort((a, b) => a.arrivalTime - b.arrivalTime);
      case 'Priority':
        return queue.sort((a, b) => b.priority - a.priority || a.arrivalTime - b.arrivalTime);
      case 'SJF':
        return queue.sort((a, b) => a.processingTime - b.processingTime || a.arrivalTime - b.arrivalTime);
      case 'RoundRobin':
        return queue; // FIFO order for Round Robin
      default:
        return queue;
    }
  };

  const updateStats = React.useCallback((completed: Message[]) => {
    if (completed.length === 0) return;

    const totalWaitTime = completed.reduce((sum, msg) => sum + (msg.waitTime || 0), 0);
    const totalResponseTime = completed.reduce((sum, msg) => sum + (msg.responseTime || 0), 0);
    const totalTurnaroundTime = completed.reduce((sum, msg) => sum + (msg.turnaroundTime || 0), 0);

    setStats({
      totalMessages: completed.length,
      averageWaitTime: totalWaitTime / completed.length,
      averageResponseTime: totalResponseTime / completed.length,
      averageTurnaroundTime: totalTurnaroundTime / completed.length,
      throughput: completed.length / (currentTime || 1)
    });
  }, [currentTime]);

  const completeMessage = React.useCallback((message: Message) => {
    const completedMessage = {
      ...message,
      status: 'completed' as const,
      processingTime: 0,
      waitTime: (message.responseTime || 0),
      turnaroundTime: currentTime - message.arrivalTime
    };

    setCompletedMessages(prev => {
      const newCompleted = [...prev, completedMessage];
      updateStats(newCompleted);
      return newCompleted;
    });
  }, [currentTime, updateStats]);

  // Process messages
  const processNextMessage = React.useCallback(() => {
    setProcessingMessage(current => {
      if (current) {
        // Continue processing current message
        const updatedMessage = { ...current, processingTime: current.processingTime - 1 };

        if (algorithm === 'RoundRobin') {
          remainingQuantum.current -= 1;
          
          if (updatedMessage.processingTime <= 0) {
            // Message completed
            completeMessage(updatedMessage);
            remainingQuantum.current = 0;
            return null;
          } else if (remainingQuantum.current <= 0) {
            // Time quantum expired, preempt
            setWaitingQueue(prev => [...prev, updatedMessage]);
            remainingQuantum.current = 0;
            return null;
          } else {
            return updatedMessage;
          }
        } else {
          if (updatedMessage.processingTime <= 0) {
            // Message completed
            completeMessage(updatedMessage);
            return null;
          }
          return updatedMessage;
        }
      } else {
        // Start processing next message
        setWaitingQueue(prev => {
          if (prev.length === 0) return prev;

          const sortedQueue = sortQueue([...prev], algorithm);
          const nextMessage = sortedQueue[0];
          const remainingQueue = sortedQueue.slice(1);

          if (nextMessage) {
            const startedMessage = {
              ...nextMessage,
              status: 'processing' as const,
              responseTime: currentTime - nextMessage.arrivalTime
            };

            if (algorithm === 'RoundRobin') {
              remainingQuantum.current = timeQuantum;
            }

            setTimeout(() => setProcessingMessage(startedMessage), 0);
          }

          return remainingQueue;
        });
        return null;
      }
    });
  }, [algorithm, timeQuantum, currentTime, completeMessage]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        processNextMessage();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, processNextMessage]);

  const reset = () => {
    setIsRunning(false);
    setMessages([]);
    setWaitingQueue([]);
    setProcessingMessage(null);
    setCompletedMessages([]);
    setCurrentTime(0);
    remainingQuantum.current = 0;
    setStats({
      totalMessages: 0,
      averageWaitTime: 0,
      averageResponseTime: 0,
      averageTurnaroundTime: 0,
      throughput: 0
    });
  };

  const getMessageColor = (message: Message) => {
    switch (message.status) {
      case 'waiting': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'processing': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-red-500';
    if (priority >= 3) return 'bg-orange-500';
    if (priority >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Message Queue Scheduler Visualizer</h1>
        <p className="text-muted-foreground">
          Visualize different message scheduling algorithms: FIFO, Priority, SJF, and Round Robin
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduler Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Scheduling Algorithm</Label>
              <Select value={algorithm} onValueChange={(value: SchedulingAlgorithm) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFO">First In First Out</SelectItem>
                  <SelectItem value="Priority">Priority Scheduling</SelectItem>
                  <SelectItem value="SJF">Shortest Job First</SelectItem>
                  <SelectItem value="RoundRobin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {algorithm === 'RoundRobin' && (
              <div className="space-y-2">
                <Label>Time Quantum</Label>
                <Input
                  type="number"
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={10}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Current Time</Label>
              <div className="px-3 py-2 bg-muted rounded-md font-mono text-lg">
                {currentTime}s
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsRunning(!isRunning)} variant={isRunning ? "destructive" : "default"}>
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Add Message Form */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Add New Message</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Message Content</Label>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Enter message content"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority (1-5)</Label>
                <Input
                  type="number"
                  value={newPriority}
                  onChange={(e) => setNewPriority(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Processing Time (s)</Label>
                <Input
                  type="number"
                  value={newProcessingTime}
                  onChange={(e) => setNewProcessingTime(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={20}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addMessage} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Waiting Queue
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                {waitingQueue.length}
              </span>
            </CardTitle>
            <CardDescription>
              Messages waiting to be processed ({algorithm} order)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {waitingQueue.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-md border-2 ${getMessageColor(message)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium truncate">{message.content}</div>
                      <div className="text-sm opacity-75">
                        Arrival: {message.arrivalTime}s | Processing: {message.processingTime}s
                      </div>
                    </div>
                    <div className="ml-2 flex flex-col items-end gap-1">
                      <span className="text-xs bg-black/10 px-2 py-1 rounded">#{index + 1}</span>
                      <div 
                        className={`w-4 h-4 rounded-full ${getPriorityColor(message.priority)}`}
                        title={`Priority: ${message.priority}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {waitingQueue.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No messages in queue
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Processing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Currently Processing
              {algorithm === 'RoundRobin' && processingMessage && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  Quantum: {remainingQuantum.current}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Message being processed by the server
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processingMessage ? (
              <div className={`p-4 rounded-md border-2 ${getMessageColor(processingMessage)}`}>
                <div className="font-medium mb-2">{processingMessage.content}</div>
                <div className="space-y-1 text-sm">
                  <div>Arrival Time: {processingMessage.arrivalTime}s</div>
                  <div>Remaining Time: {processingMessage.processingTime}s</div>
                  <div>Response Time: {processingMessage.responseTime}s</div>
                  <div className="flex items-center gap-2">
                    Priority: 
                    <div 
                      className={`w-3 h-3 rounded-full ${getPriorityColor(processingMessage.priority)}`}
                    />
                    {processingMessage.priority}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((processingMessage.arrivalTime + (processingMessage.responseTime || 0) + (messages.find(m => m.id === processingMessage.id)?.processingTime || 0) - processingMessage.processingTime) / (messages.find(m => m.id === processingMessage.id)?.processingTime || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No message being processed
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Completed Messages
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                {completedMessages.length}
              </span>
            </CardTitle>
            <CardDescription>
              Successfully processed messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {completedMessages.slice(-10).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-md border-2 ${getMessageColor(message)}`}
                >
                  <div className="font-medium truncate">{message.content}</div>
                  <div className="text-sm opacity-75">
                    <div>Wait: {message.waitTime}s | Response: {message.responseTime}s</div>
                    <div>Turnaround: {message.turnaroundTime}s</div>
                  </div>
                </div>
              ))}
              {completedMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No completed messages
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Statistics</CardTitle>
          <CardDescription>
            Real-time metrics for the {algorithm} scheduling algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.averageWaitTime.toFixed(2)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg Wait Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageResponseTime.toFixed(2)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.averageTurnaroundTime.toFixed(2)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg Turnaround Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.throughput.toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground">Throughput (msg/s)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Information */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Information: {algorithm}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {algorithm === 'FIFO' && (
              <div>
                <p><strong>First In First Out (FIFO):</strong> Messages are processed in the order they arrive. Simple but may not be optimal for varying processing times or priorities.</p>
                <p><strong>Advantages:</strong> Simple, fair, no starvation</p>
                <p><strong>Disadvantages:</strong> May have high average waiting time for short jobs</p>
              </div>
            )}
            {algorithm === 'Priority' && (
              <div>
                <p><strong>Priority Scheduling:</strong> Messages with higher priority are processed first. Equal priority messages are handled in FIFO order.</p>
                <p><strong>Advantages:</strong> Important messages get processed quickly</p>
                <p><strong>Disadvantages:</strong> Low priority messages may starve</p>
              </div>
            )}
            {algorithm === 'SJF' && (
              <div>
                <p><strong>Shortest Job First (SJF):</strong> Messages with shorter processing times are prioritized to minimize average waiting time.</p>
                <p><strong>Advantages:</strong> Minimizes average waiting time</p>
                <p><strong>Disadvantages:</strong> Long jobs may starve, requires knowledge of processing time</p>
              </div>
            )}
            {algorithm === 'RoundRobin' && (
              <div>
                <p><strong>Round Robin:</strong> Each message gets a fixed time quantum. If not completed, it goes back to the end of the queue.</p>
                <p><strong>Advantages:</strong> Fair, responsive, no starvation</p>
                <p><strong>Disadvantages:</strong> Higher overhead due to context switching</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
