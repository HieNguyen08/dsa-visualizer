"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, RotateCcw, ArrowLeft, ArrowRight, Square, MessageSquare, Send, Trash2 } from 'lucide-react';

// --- Constants ---
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_SPEED = 5;

// --- Types ---
interface Message {
  id: number;
  content: string;
  priority: number;
  timestamp: number;
  sender: string;
  status: 'waiting' | 'processing' | 'processed' | 'failed';
}

interface QueueOperation {
  step: number;
  type: 'enqueue' | 'dequeue' | 'process';
  message?: Message;
  description: string;
  reasoning: string;
  queueState: Message[];
  processingMessage?: Message;
}

interface Animation {
  type: 'enqueue' | 'dequeue' | 'process' | 'complete';
  step: number;
  message?: Message;
  description: string;
  queueState: Message[];
  processingMessage?: Message;
}

// --- Helper Functions ---
const createMessage = (content: string, priority: number, sender: string): Message => {
  return {
    id: Date.now() + Math.random(),
    content,
    priority,
    timestamp: Date.now(),
    sender,
    status: 'waiting'
  };
};

const processMessageQueue = (messages: Message[]): QueueOperation[] => {
  const operations: QueueOperation[] = [];
  const queue: Message[] = [];
  let stepCounter = 1;
  let processingMessage: Message | undefined;
  
  // Add all messages to queue (enqueue operations)
  for (const message of messages) {
    queue.push({ ...message, status: 'waiting' });
    operations.push({
      step: stepCounter++,
      type: 'enqueue',
      message: { ...message, status: 'waiting' },
      description: `Message "${message.content}" added to queue`,
      reasoning: `Producer sends message with priority ${message.priority} from ${message.sender}`,
      queueState: [...queue],
      processingMessage
    });
  }
  
  // Process messages (dequeue and process operations)
  while (queue.length > 0) {
    // Find highest priority message (lower number = higher priority)
    const highestPriorityIndex = queue.reduce((maxIndex, message, index) => {
      return queue[index].priority < queue[maxIndex].priority ? index : maxIndex;
    }, 0);
    
    const messageToProcess = queue[highestPriorityIndex];
    queue.splice(highestPriorityIndex, 1);
    
    // Dequeue operation
    operations.push({
      step: stepCounter++,
      type: 'dequeue',
      message: { ...messageToProcess, status: 'processing' },
      description: `Dequeue message "${messageToProcess.content}" for processing`,
      reasoning: `Selected highest priority message (priority ${messageToProcess.priority}) from queue`,
      queueState: [...queue],
      processingMessage: { ...messageToProcess, status: 'processing' }
    });
    
    processingMessage = { ...messageToProcess, status: 'processing' };
    
    // Process operation
    operations.push({
      step: stepCounter++,
      type: 'process',
      message: { ...messageToProcess, status: 'processed' },
      description: `Processing message "${messageToProcess.content}"`,
      reasoning: `Consumer processes the message and marks it as completed`,
      queueState: [...queue],
      processingMessage: { ...messageToProcess, status: 'processed' }
    });
    
    processingMessage = undefined;
  }
  
  return operations;
};

const getAnimations = (operations: QueueOperation[]): Animation[] => {
  const animations: Animation[] = [];
  
  operations.forEach((operation, index) => {
    animations.push({
      type: operation.type === 'enqueue' ? 'enqueue' : 
            operation.type === 'dequeue' ? 'dequeue' : 'process',
      step: index,
      message: operation.message,
      description: operation.description,
      queueState: operation.queueState,
      processingMessage: operation.processingMessage
    });
  });
  
  animations.push({
    type: 'complete',
    step: operations.length,
    description: 'All messages processed!',
    queueState: [],
    processingMessage: undefined
  });
  
  return animations;
};

// --- Main Component ---
const MessageQueueVisualizer = () => {
  // --- State Management ---
  const [messageInput, setMessageInput] = useState<string>('');
  const [priorityInput, setPriorityInput] = useState<string>('1');
  const [senderInput, setSenderInput] = useState<string>('User');
  const [messages, setMessages] = useState<Message[]>([]);
  const [operations, setOperations] = useState<QueueOperation[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  
  // Animation refs
  const speedRef = useRef<number>(speed);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update speed ref when speed changes
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  // --- Handlers ---
  const addMessage = () => {
    if (!messageInput.trim()) return;
    
    const priority = parseInt(priorityInput) || 1;
    const message = createMessage(messageInput.trim(), priority, senderInput.trim() || 'User');
    
    setMessages(prev => [...prev, message]);
    setMessageInput('');
    setPriorityInput('1');
  };
  
  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };
  
  const clearMessages = () => {
    setMessages([]);
    setOperations([]);
    setAnimations([]);
    setCurrentStep(-1);
    setStepIndex(-1);
  };
  
  const processMessages = useCallback(() => {
    if (messages.length === 0) return;
    
    const queueOperations = processMessageQueue(messages);
    const animationSteps = getAnimations(queueOperations);
    
    setOperations(queueOperations);
    setAnimations(animationSteps);
    setCurrentStep(-1);
    setStepIndex(-1);
  }, [messages]);
  
  useEffect(() => {
    processMessages();
  }, [processMessages]);
  
  const startAnimation = () => {
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    if (animations.length === 0) {
      processMessages();
      return;
    }
    
    setIsAnimating(true);
    setCurrentStep(-1);
    animateQueue();
  };
  
  const animateQueue = () => {
    let animationIndex = 0;
    
    const animate = () => {
      if (animationIndex >= animations.length) {
        setIsAnimating(false);
        setCurrentStep(animations.length - 1);
        return;
      }
      
      setCurrentStep(animationIndex);
      animationIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 150);
    };
    
    animate();
  };
  
  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setCurrentStep(-1);
  };
  
  const resetAnimation = () => {
    stopAnimation();
    setCurrentStep(-1);
    setStepIndex(-1);
  };
  
  const toggleStepByStep = () => {
    setIsStepByStep(!isStepByStep);
    if (!isStepByStep && operations.length > 0) {
      setStepIndex(0);
    } else {
      setStepIndex(-1);
    }
  };
  
  const nextStep = () => {
    if (stepIndex < operations.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };
  
  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };
  
  const addPredefinedMessages = () => {
    const predefined = [
      { content: 'System Alert', priority: 1, sender: 'System' },
      { content: 'User Login', priority: 3, sender: 'Auth' },
      { content: 'Data Backup', priority: 5, sender: 'Scheduler' },
      { content: 'Error Report', priority: 2, sender: 'Logger' },
      { content: 'Status Update', priority: 4, sender: 'Monitor' }
    ];
    
    const newMessages = predefined.map(msg => createMessage(msg.content, msg.priority, msg.sender));
    setMessages(prev => [...prev, ...newMessages]);
  };
  
  // --- Render Functions ---
  const renderMessage = (message: Message, index: number, isHighlighted: boolean = false) => {
    const priorityColor = message.priority <= 2 ? 'bg-red-100 border-red-300' :
                         message.priority <= 4 ? 'bg-yellow-100 border-yellow-300' :
                         'bg-green-100 border-green-300';
                         
    const statusColor = message.status === 'waiting' ? 'bg-blue-50' :
                       message.status === 'processing' ? 'bg-yellow-50' :
                       message.status === 'processed' ? 'bg-green-50' :
                       'bg-red-50';
  
    return (
      <div
        key={message.id}
        className={`
          p-3 rounded-lg border-2 transition-all duration-300
          ${isHighlighted ? 'bg-yellow-200 border-yellow-400 scale-105' : `${priorityColor} ${statusColor}`}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-semibold text-sm">{message.content}</div>
            <div className="text-xs text-gray-600">From: {message.sender}</div>
            <div className="text-xs text-gray-500">Priority: {message.priority}</div>
          </div>
          <div className="ml-2">
            <div className={`
              px-2 py-1 rounded text-xs font-medium
              ${message.status === 'waiting' ? 'bg-blue-200 text-blue-800' :
                message.status === 'processing' ? 'bg-yellow-200 text-yellow-800' :
                message.status === 'processed' ? 'bg-green-200 text-green-800' :
                'bg-red-200 text-red-800'}
            `}>
              {message.status}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderQueue = (queueMessages: Message[], highlightedMessage?: Message) => {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-center">Message Queue (Priority Queue)</h4>
        <div className="space-y-2 min-h-[200px]">
          {queueMessages.length === 0 ? (
            <div className="text-center text-gray-400 italic py-8">Queue is empty</div>
          ) : (
            queueMessages
              .sort((a, b) => a.priority - b.priority) // Sort by priority for display
              .map((message, index) => renderMessage(
                message, 
                index, 
                highlightedMessage?.id === message.id
              ))
          )}
        </div>
        <div className="text-xs text-center mt-2 text-gray-600">
          Messages sorted by priority (1 = highest priority)
        </div>
      </div>
    );
  };
  
  const renderProcessor = (processingMessage?: Message) => {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-center">Message Processor (Consumer)</h4>
        <div className="min-h-[100px] flex items-center justify-center">
          {processingMessage ? (
            <div className="w-full">
              {renderMessage(processingMessage, 0, true)}
              <div className="text-center mt-2">
                <div className="inline-block animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-sm text-green-700">Processing...</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 italic">No message being processed</div>
          )}
        </div>
      </div>
    );
  };
  
  // --- Component Render ---
  return (
    <div className="w-full mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Message Queue Visualizer (Producer-Consumer)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Message Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Message Content:</label>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Enter message content"
                disabled={isAnimating}
                onKeyPress={(e) => e.key === 'Enter' && addMessage()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority (1-10):</label>
              <Input
                type="number"
                value={priorityInput}
                onChange={(e) => setPriorityInput(e.target.value)}
                min="1"
                max="10"
                disabled={isAnimating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sender:</label>
              <Input
                value={senderInput}
                onChange={(e) => setSenderInput(e.target.value)}
                placeholder="Sender name"
                disabled={isAnimating}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mb-6">
            <Button onClick={addMessage} disabled={isAnimating || !messageInput.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Add Message
            </Button>
            
            <Button onClick={addPredefinedMessages} disabled={isAnimating} variant="outline">
              Add Sample Messages
            </Button>
            
            <Button onClick={clearMessages} disabled={isAnimating} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          {/* Messages List */}
          {messages.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Messages to Process ({messages.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={message.id} className="relative">
                    {renderMessage(message, index)}
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                      onClick={() => removeMessage(message.id)}
                      disabled={isAnimating}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Speed: {speed}</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={1}
                className="w-32"
              />
            </div>
            
            <div className="flex gap-2 items-end">
              <Button 
                onClick={startAnimation} 
                disabled={isStepByStep || messages.length === 0} 
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
                    Start Processing
                  </>
                )}
              </Button>
              
              <Button onClick={resetAnimation} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <Button 
                onClick={toggleStepByStep} 
                disabled={isAnimating || operations.length === 0}
                variant={isStepByStep ? "default" : "outline"}
              >
                Step Mode
              </Button>
            </div>
          </div>

          {/* Step-by-step controls */}
          {isStepByStep && operations.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              <Button onClick={prevStep} disabled={stepIndex <= 0} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-4 text-sm font-medium">
                Step {Math.max(0, stepIndex) + 1} of {operations.length}
              </span>
              <Button onClick={nextStep} disabled={stepIndex >= operations.length - 1} variant="outline" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Queue Visualization */}
          {operations.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {renderQueue(
                isStepByStep && stepIndex >= 0 ? operations[stepIndex].queueState :
                isAnimating && currentStep >= 0 && animations[currentStep] ? animations[currentStep].queueState :
                [],
                isStepByStep && stepIndex >= 0 ? operations[stepIndex].message :
                isAnimating && currentStep >= 0 && animations[currentStep] ? animations[currentStep].message :
                undefined
              )}
              
              {renderProcessor(
                isStepByStep && stepIndex >= 0 ? operations[stepIndex].processingMessage :
                isAnimating && currentStep >= 0 && animations[currentStep] ? animations[currentStep].processingMessage :
                undefined
              )}
            </div>
          )}

          {/* Current Step Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {/* Step Description */}
            <div className="space-y-4">
              {isAnimating && animations.length > 0 && currentStep >= 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Animation Progress</h4>
                  <p>
                    Step {currentStep + 1} of {animations.length}
                    <span className="block mt-1 font-medium text-blue-700">
                      {animations[currentStep]?.description}
                    </span>
                  </p>
                </div>
              )}
              
              {isStepByStep && operations.length > 0 && stepIndex >= 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Step-by-Step Mode</h4>
                  <p className="font-medium">
                    Step {stepIndex + 1}: {operations[stepIndex].description}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{operations[stepIndex].reasoning}</p>
                  
                  <div className="mt-2 text-sm">
                    <div><strong>Operation:</strong> {operations[stepIndex].type}</div>
                    <div><strong>Queue Size:</strong> {operations[stepIndex].queueState.length}</div>
                    {operations[stepIndex].message && (
                      <div><strong>Message:</strong> &quot;{operations[stepIndex].message!.content}&quot;</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step Recording Table */}
            {operations.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <h4 className="font-semibold mb-2">Step Recording</h4>
                <div className="text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-1">Step</th>
                        <th className="p-1">Operation</th>
                        <th className="p-1">Message</th>
                        <th className="p-1">Queue Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operations.slice(0, isStepByStep ? stepIndex + 1 : isAnimating ? currentStep + 1 : operations.length).map((operation, index) => (
                        <tr key={index} className={`border-b ${
                          (isStepByStep && index === stepIndex) || (isAnimating && index === currentStep) 
                            ? 'bg-blue-100 font-semibold' : ''
                        }`}>
                          <td className="p-1">{operation.step}</td>
                          <td className="p-1 capitalize">{operation.type}</td>
                          <td className="p-1">{operation.message?.content.substring(0, 15) || '-'}...</td>
                          <td className="p-1">{operation.queueState.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Algorithm Information */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2">About Message Queue (Producer-Consumer Pattern)</h3>
            <p className="text-sm text-gray-600 mb-2">
              A message queue implements the producer-consumer pattern where producers send messages to a queue 
              and consumers process them. This visualizer uses a priority queue to handle messages based on priority.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Producer (Enqueue):</span>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Create message with content and priority</li>
                  <li>Add message to queue</li>
                  <li>Queue maintains priority order</li>
                </ol>
              </div>
              <div>
                <span className="font-medium">Consumer (Dequeue):</span>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Select highest priority message</li>
                  <li>Remove from queue</li>
                  <li>Process message</li>
                  <li>Mark as completed</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <div><span className="font-medium">Benefits:</span> Decoupling, Load balancing, Reliability, Scalability</div>
              <div><span className="font-medium">Use Cases:</span> Task scheduling, Event processing, Communication systems</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageQueueVisualizer;
