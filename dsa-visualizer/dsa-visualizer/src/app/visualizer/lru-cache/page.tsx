"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Database, Plus, Search, RotateCcw, ArrowRight } from 'lucide-react';

interface CacheNode {
  key: string;
  value: string;
  prev: CacheNode | null;
  next: CacheNode | null;
  isHighlighted: boolean;
  isNewlyAdded: boolean;
  isAccessed: boolean;
}

interface CacheStep {
  description: string;
  operation: 'get' | 'put' | 'init' | 'evict';
  key?: string;
  value?: string;
  head: CacheNode | null;
  tail: CacheNode | null;
  hashMap: { [key: string]: CacheNode };
  cacheSize: number;
  capacity: number;
  hitRate: number;
  totalOperations: number;
  hits: number;
}

export default function LRUCachePage() {
  const [capacity, setCapacity] = useState([4]);
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [getKey, setGetKey] = useState('');
  const [steps, setSteps] = useState<CacheStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([800]);

  // LRU Cache implementation
  class LRUCache {
    private capacity: number;
    private head: CacheNode | null = null;
    private tail: CacheNode | null = null;
    private hashMap: { [key: string]: CacheNode } = {};
    private steps: CacheStep[] = [];
    private totalOps = 0;
    private hits = 0;

    constructor(capacity: number) {
      this.capacity = capacity;
      
      // Initialize dummy head and tail nodes
      this.head = {
        key: 'HEAD',
        value: '',
        prev: null,
        next: null,
        isHighlighted: false,
        isNewlyAdded: false,
        isAccessed: false
      };
      
      this.tail = {
        key: 'TAIL',
        value: '',
        prev: null,
        next: null,
        isHighlighted: false,
        isNewlyAdded: false,
        isAccessed: false
      };
      
      this.head.next = this.tail;
      this.tail.prev = this.head;

      this.addStep('Cache initialized with capacity ' + capacity, 'init');
    }

    private addStep(description: string, operation: 'get' | 'put' | 'init' | 'evict', key?: string, value?: string) {
      // Reset highlights from previous step
      this.resetHighlights();

      const cacheSize = Object.keys(this.hashMap).length;
      const hitRate = this.totalOps > 0 ? (this.hits / this.totalOps) * 100 : 0;

      this.steps.push({
        description,
        operation,
        key,
        value,
        head: this.cloneNode(this.head),
        tail: this.cloneNode(this.tail),
        hashMap: this.cloneHashMap(),
        cacheSize,
        capacity: this.capacity,
        hitRate,
        totalOperations: this.totalOps,
        hits: this.hits
      });
    }

    private resetHighlights() {
      Object.values(this.hashMap).forEach(node => {
        node.isHighlighted = false;
        node.isNewlyAdded = false;
        node.isAccessed = false;
      });
    }

    private cloneNode(node: CacheNode | null): CacheNode | null {
      if (!node) return null;
      
      return {
        key: node.key,
        value: node.value,
        prev: null, // Will be set during cloning
        next: null, // Will be set during cloning
        isHighlighted: node.isHighlighted,
        isNewlyAdded: node.isNewlyAdded,
        isAccessed: node.isAccessed
      };
    }

    private cloneHashMap(): { [key: string]: CacheNode } {
      const clonedMap: { [key: string]: CacheNode } = {};
      
      Object.entries(this.hashMap).forEach(([key, node]) => {
        clonedMap[key] = this.cloneNode(node)!;
      });

      // Reconstruct the linked list connections
      let current = this.head?.next;
      let prevCloned = null;
      const headClone = this.cloneNode(this.head);
      const tailClone = this.cloneNode(this.tail);

      if (headClone && tailClone) {
        headClone.next = tailClone;
        tailClone.prev = headClone;
        prevCloned = headClone;

        while (current && current !== this.tail) {
          const clonedNode = clonedMap[current.key];
          if (clonedNode && prevCloned) {
            prevCloned.next = clonedNode;
            clonedNode.prev = prevCloned;
            prevCloned = clonedNode;
          }
          current = current.next;
        }

        if (prevCloned) {
          prevCloned.next = tailClone;
          tailClone.prev = prevCloned;
        }
      }

      return clonedMap;
    }

    private addToHead(node: CacheNode) {
      if (!this.head) return;
      
      node.prev = this.head;
      node.next = this.head.next;
      
      if (this.head.next) {
        this.head.next.prev = node;
      }
      
      this.head.next = node;
    }

    private removeNode(node: CacheNode) {
      if (node.prev) {
        node.prev.next = node.next;
      }
      
      if (node.next) {
        node.next.prev = node.prev;
      }
    }

    private moveToHead(node: CacheNode) {
      this.removeNode(node);
      this.addToHead(node);
    }

    private removeTail(): CacheNode | null {
      if (!this.tail || !this.tail.prev || this.tail.prev === this.head) {
        return null;
      }
      
      const lastNode = this.tail.prev;
      this.removeNode(lastNode);
      return lastNode;
    }

    get(key: string): string | null {
      this.totalOps++;
      
      if (key in this.hashMap) {
        this.hits++;
        const node = this.hashMap[key];
        node.isAccessed = true;
        node.isHighlighted = true;
        
        // Move to head (most recently used)
        this.moveToHead(node);
        
        this.addStep(`Cache HIT: Found key "${key}" with value "${node.value}". Moved to front.`, 'get', key, node.value);
        return node.value;
      } else {
        this.addStep(`Cache MISS: Key "${key}" not found in cache.`, 'get', key);
        return null;
      }
    }

    put(key: string, value: string) {
      this.totalOps++;
      
      if (key in this.hashMap) {
        // Update existing node
        const node = this.hashMap[key];
        node.value = value;
        node.isAccessed = true;
        node.isHighlighted = true;
        
        this.moveToHead(node);
        this.addStep(`Updated existing key "${key}" with new value "${value}". Moved to front.`, 'put', key, value);
      } else {
        // Add new node
        const newNode: CacheNode = {
          key,
          value,
          prev: null,
          next: null,
          isHighlighted: true,
          isNewlyAdded: true,
          isAccessed: false
        };

        if (Object.keys(this.hashMap).length >= this.capacity) {
          // Remove least recently used (tail)
          const tail = this.removeTail();
          if (tail) {
            delete this.hashMap[tail.key];
            this.addStep(`Cache FULL: Evicted least recently used key "${tail.key}".`, 'evict', tail.key);
          }
        }

        this.hashMap[key] = newNode;
        this.addToHead(newNode);
        
        this.addStep(`Added new key "${key}" with value "${value}" to cache.`, 'put', key, value);
      }
    }

    getSteps(): CacheStep[] {
      return this.steps;
    }
  }


  const performGet = () => {
    if (!getKey.trim()) return;
    
    const currentCache = reconstructCache();
    currentCache.get(getKey.trim());
    
    const newSteps = currentCache.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-2)]); // Add only new steps
    
    setGetKey('');
  };

  // Perform PUT operation
  const performPut = () => {
    if (!inputKey.trim() || !inputValue.trim()) return;
    
    const currentCache = reconstructCache();
    currentCache.put(inputKey.trim(), inputValue.trim());
    
    const newSteps = currentCache.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-3)]); // Add only new steps
    
    setInputKey('');
    setInputValue('');
  };

  // Reconstruct cache from current step
  const reconstructCache = (): LRUCache => {
    const cache = new LRUCache(capacity[0]);
    
    // Replay all operations up to current step
    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (step.operation === 'put' && step.key && step.value) {
        cache.put(step.key, step.value);
      } else if (step.operation === 'get' && step.key) {
        cache.get(step.key);
      }
    }
    
    return cache;
  };

  // Demo operations
  const runDemo = () => {
    const cache = new LRUCache(capacity[0]);
    
    // Demo sequence
    cache.put('A', '1');
    cache.put('B', '2'); 
    cache.put('C', '3');
    cache.get('A');
    cache.put('D', '4');
    cache.get('B');
    cache.put('E', '5');
    cache.get('C');
    cache.get('D');
    
    setSteps(cache.getSteps());
    setCurrentStep(0);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
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

  // Initialize cache on mount or capacity change
  useEffect(() => {
    const initCache = () => {
      class LocalLRUCache {
        private capacity: number;
        private head: CacheNode | null = null;
        private tail: CacheNode | null = null;
        private hashMap: { [key: string]: CacheNode } = {};
        private steps: CacheStep[] = [];

        constructor(capacity: number) {
          this.capacity = capacity;
          
          // Initialize dummy head and tail nodes
          this.head = {
            key: 'HEAD',
            value: '',
            prev: null,
            next: null,
            isHighlighted: false,
            isNewlyAdded: false,
            isAccessed: false
          };
          
          this.tail = {
            key: 'TAIL',
            value: '',
            prev: null,
            next: null,
            isHighlighted: false,
            isNewlyAdded: false,
            isAccessed: false
          };
          
          this.head.next = this.tail;
          this.tail.prev = this.head;

          this.steps.push({
            description: 'Cache initialized with capacity ' + capacity,
            operation: 'init',
            head: this.head,
            tail: this.tail,
            hashMap: this.hashMap,
            cacheSize: 0,
            capacity: this.capacity,
            hitRate: 0,
            totalOperations: 0,
            hits: 0
          });
        }

        getSteps(): CacheStep[] {
          return this.steps;
        }
      }
      
      const cache = new LocalLRUCache(capacity[0]);
      const initialSteps = cache.getSteps();
      setSteps(initialSteps);
      setCurrentStep(0);
    };
    initCache();
  }, [capacity]);

  const currentStepData = steps[currentStep];

  // Render linked list visualization
  const renderLinkedList = () => {
    if (!currentStepData) return null;

    const nodes: CacheNode[] = [];
    let current = currentStepData.head?.next;
    
    while (current && current.key !== 'TAIL') {
      nodes.push(current);
      current = current.next;
    }

    return (
      <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg overflow-x-auto">
        {/* HEAD indicator */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-12 bg-blue-200 border-2 border-blue-400 rounded flex items-center justify-center font-bold text-sm">
            HEAD
          </div>
        </div>
        
        <ArrowRight className="w-4 h-4 text-gray-600" />
        
        {/* Cache nodes */}
        {nodes.map((node, index) => (
          <React.Fragment key={node.key}>
            <div className="flex flex-col items-center">
              <div className={`w-20 h-16 border-2 rounded flex flex-col items-center justify-center font-bold text-sm transition-all duration-300 ${
                node.isHighlighted ? 'bg-yellow-300 border-yellow-600 transform scale-105' :
                node.isNewlyAdded ? 'bg-green-200 border-green-500' :
                node.isAccessed ? 'bg-blue-200 border-blue-500' :
                'bg-white border-gray-400'
              }`}>
                <div className="text-xs text-gray-600">Key: {node.key}</div>
                <div className="text-sm">{node.value}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {index === 0 ? 'Most Recent' : index === nodes.length - 1 ? 'Least Recent' : ''}
              </div>
            </div>
            
            {index < nodes.length - 1 && <ArrowRight className="w-4 h-4 text-gray-600" />}
          </React.Fragment>
        ))}
        
        {nodes.length > 0 && <ArrowRight className="w-4 h-4 text-gray-600" />}
        
        {/* TAIL indicator */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-12 bg-red-200 border-2 border-red-400 rounded flex items-center justify-center font-bold text-sm">
            TAIL
          </div>
        </div>
      </div>
    );
  };

  // Render hash map visualization
  const renderHashMap = () => {
    if (!currentStepData) return null;

    return (
      <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
        <div className="font-bold text-center text-sm bg-blue-100 p-2 rounded">Key</div>
        <div className="font-bold text-center text-sm bg-blue-100 p-2 rounded">Memory Address</div>
        
        {Object.entries(currentStepData.hashMap).map(([key, node]) => (
          <React.Fragment key={key}>
            <div className={`text-center p-2 rounded text-sm ${
              node.isHighlighted ? 'bg-yellow-200' : 'bg-white'
            }`}>
              {key}
            </div>
            <div className={`text-center p-2 rounded text-sm font-mono ${
              node.isHighlighted ? 'bg-yellow-200' : 'bg-white'
            }`}>
              →{node.value}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">LRU Cache Implementation</h1>
        </div>
        <p className="text-gray-600">
          Visualize LRU (Least Recently Used) cache operations with O(1) time complexity using HashMap and Doubly Linked List.
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
                <label className="text-sm font-medium mb-2 block">Cache Capacity: {capacity[0]}</label>
                <Slider
                  value={capacity}
                  onValueChange={setCapacity}
                  min={2}
                  max={6}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">PUT Operation</label>
                <div className="space-y-2">
                  <Input
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Key"
                  />
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Value"
                  />
                  <Button onClick={performPut} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    PUT
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">GET Operation</label>
                <div className="space-y-2">
                  <Input
                    value={getKey}
                    onChange={(e) => setGetKey(e.target.value)}
                    placeholder="Key to get"
                  />
                  <Button onClick={performGet} size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    GET
                  </Button>
                </div>
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
                  <Button className="w-4 h-4" />
                </Button>
                <Button onClick={pause} disabled={!isPlaying} size="sm" variant="outline">
                  Pause
                </Button>
                <Button onClick={reset} size="sm" variant="outline">
                  Reset
                </Button>
                <Button onClick={runDemo} size="sm" variant="outline">
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
                  <span>Cache Size:</span>
                  <span className="font-mono">{currentStepData?.cacheSize || 0}/{currentStepData?.capacity || capacity[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Operations:</span>
                  <span className="font-mono">{currentStepData?.totalOperations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hits:</span>
                  <span className="font-mono">{currentStepData?.hits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hit Rate:</span>
                  <span className="font-mono">{currentStepData?.hitRate?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>LRU Cache Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Initialize cache and perform operations'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Doubly Linked List */}
                <div>
                  <h4 className="font-medium mb-3">Doubly Linked List (Insertion Order)</h4>
                  {renderLinkedList()}
                </div>

                {/* Hash Map */}
                <div>
                  <h4 className="font-medium mb-3">Hash Map (O(1) Access)</h4>
                  {renderHashMap()}
                </div>

                {/* Operation Indicator */}
                {currentStepData && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.operation === 'get' ? 'bg-blue-100 text-blue-800' :
                      currentStepData.operation === 'put' ? 'bg-green-100 text-green-800' :
                      currentStepData.operation === 'evict' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentStepData.operation.toUpperCase()}
                      {currentStepData.key && ` - Key: ${currentStepData.key}`}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
                    <span>Current Operation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-500"></div>
                    <span>Newly Added</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 border border-blue-500"></div>
                    <span>Recently Accessed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-400"></div>
                    <span>Cached Item</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Algorithm Information */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>LRU Cache Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>LRU (Least Recently Used) Cache is a data structure that maintains a fixed-size cache and evicts the least recently used item when the cache is full and a new item needs to be added.</p>
              
              <h3>Implementation Strategy</h3>
              <p>Uses a combination of HashMap and Doubly Linked List:</p>
              <ul>
                <li><strong>HashMap:</strong> Provides O(1) access to cache nodes by key</li>
                <li><strong>Doubly Linked List:</strong> Maintains insertion order and allows O(1) insertion/deletion</li>
              </ul>

              <h3>Operations</h3>
              <ul>
                <li><strong>GET(key):</strong> Returns value if key exists, moves item to front (most recent)</li>
                <li><strong>PUT(key, value):</strong> Adds new item or updates existing item, moves to front</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>GET:</strong> O(1) - HashMap lookup + LinkedList operation</li>
                <li><strong>PUT:</strong> O(1) - HashMap insertion + LinkedList operation</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(capacity) - for the HashMap and LinkedList storage</p>

              <h3>Key Design Decisions</h3>
              <ul>
                <li><strong>Dummy Head/Tail:</strong> Simplifies edge cases in LinkedList operations</li>
                <li><strong>Move to Head:</strong> Recently accessed items are moved to front</li>
                <li><strong>Remove from Tail:</strong> LRU item is always at the tail for eviction</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>CPU cache management</li>
                <li>Web browser cache</li>
                <li>Database buffer pools</li>
                <li>Operating system page replacement</li>
                <li>CDN cache management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
