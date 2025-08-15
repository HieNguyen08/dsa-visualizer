"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { TreePine, Plus, Search, RotateCcw } from 'lucide-react';

interface RBTreeNode {
  value: number;
  color: 'RED' | 'BLACK';
  left: RBTreeNode | null;
  right: RBTreeNode | null;
  parent: RBTreeNode | null;
  isHighlighted: boolean;
  isNewlyAdded: boolean;
  x?: number;
  y?: number;
}

interface RBTreeStep {
  description: string;
  operation: 'insert' | 'delete' | 'search' | 'rotate' | 'recolor';
  root: RBTreeNode | null;
  targetValue?: number;
  found?: boolean;
  violations: string[];
}

export default function RedBlackTreePage() {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [steps, setSteps] = useState<RBTreeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);

  // Red-Black Tree implementation
  class RedBlackTree {
    private root: RBTreeNode | null = null;
    private steps: RBTreeStep[] = [];

    constructor() {
      this.addStep('Red-Black Tree initialized', 'insert');
    }

    private addStep(description: string, operation: 'insert' | 'delete' | 'search' | 'rotate' | 'recolor', targetValue?: number, found?: boolean) {
      const violations = this.checkViolations();
      
      this.steps.push({
        description,
        operation,
        root: this.cloneTree(this.root),
        targetValue,
        found,
        violations
      });
    }

    private cloneTree(node: RBTreeNode | null): RBTreeNode | null {
      if (!node) return null;
      
      const cloned: RBTreeNode = {
        value: node.value,
        color: node.color,
        left: null,
        right: null,
        parent: null,
        isHighlighted: node.isHighlighted,
        isNewlyAdded: node.isNewlyAdded,
        x: node.x,
        y: node.y
      };
      
      cloned.left = this.cloneTree(node.left);
      cloned.right = this.cloneTree(node.right);
      
      if (cloned.left) cloned.left.parent = cloned;
      if (cloned.right) cloned.right.parent = cloned;
      
      return cloned;
    }

    private checkViolations(): string[] {
      const violations: string[] = [];
      
      if (!this.root) return violations;
      
      // Check root is black
      if (this.root.color !== 'BLACK') {
        violations.push('Root must be black');
      }
      
      // Check no two consecutive red nodes
      this.checkRedViolation(this.root, violations);
      
      // Check black height consistency
      const blackHeight = this.getBlackHeight(this.root);
      if (!this.checkBlackHeight(this.root, blackHeight)) {
        violations.push('Black height inconsistent');
      }
      
      return violations;
    }

    private checkRedViolation(node: RBTreeNode | null, violations: string[]) {
      if (!node) return;
      
      if (node.color === 'RED') {
        if (node.left && node.left.color === 'RED') {
          violations.push(`Red node ${node.value} has red left child ${node.left.value}`);
        }
        if (node.right && node.right.color === 'RED') {
          violations.push(`Red node ${node.value} has red right child ${node.right.value}`);
        }
      }
      
      this.checkRedViolation(node.left, violations);
      this.checkRedViolation(node.right, violations);
    }

    private getBlackHeight(node: RBTreeNode | null): number {
      if (!node) return 1;
      
      const leftHeight = this.getBlackHeight(node.left);
      const rightHeight = this.getBlackHeight(node.right);
      
      const blackBonus = node.color === 'BLACK' ? 1 : 0;
      return Math.max(leftHeight, rightHeight) + blackBonus;
    }

    private checkBlackHeight(node: RBTreeNode | null, expectedHeight: number): boolean {
      if (!node) return expectedHeight === 1;
      
      const leftValid = this.checkBlackHeight(node.left, expectedHeight - (node.color === 'BLACK' ? 1 : 0));
      const rightValid = this.checkBlackHeight(node.right, expectedHeight - (node.color === 'BLACK' ? 1 : 0));
      
      return leftValid && rightValid;
    }

    private rotateLeft(node: RBTreeNode): RBTreeNode {
      const rightChild = node.right!;
      node.right = rightChild.left;
      
      if (rightChild.left) {
        rightChild.left.parent = node;
      }
      
      rightChild.parent = node.parent;
      
      if (!node.parent) {
        this.root = rightChild;
      } else if (node === node.parent.left) {
        node.parent.left = rightChild;
      } else {
        node.parent.right = rightChild;
      }
      
      rightChild.left = node;
      node.parent = rightChild;
      
      this.addStep(`Left rotation around node ${node.value}`, 'rotate');
      
      return rightChild;
    }

    private rotateRight(node: RBTreeNode): RBTreeNode {
      const leftChild = node.left!;
      node.left = leftChild.right;
      
      if (leftChild.right) {
        leftChild.right.parent = node;
      }
      
      leftChild.parent = node.parent;
      
      if (!node.parent) {
        this.root = leftChild;
      } else if (node === node.parent.right) {
        node.parent.right = leftChild;
      } else {
        node.parent.left = leftChild;
      }
      
      leftChild.right = node;
      node.parent = leftChild;
      
      this.addStep(`Right rotation around node ${node.value}`, 'rotate');
      
      return leftChild;
    }

    insert(value: number) {
      this.resetHighlights();
      
      const newNode: RBTreeNode = {
        value,
        color: 'RED',
        left: null,
        right: null,
        parent: null,
        isHighlighted: true,
        isNewlyAdded: true
      };

      if (!this.root) {
        this.root = newNode;
        this.root.color = 'BLACK';
        this.addStep(`Inserted ${value} as root (colored BLACK)`, 'insert', value);
        return;
      }

      // Standard BST insertion
      let current: RBTreeNode | null = this.root;
      let parent: RBTreeNode | null = null;

      while (current) {
        parent = current;
        if (value < current.value) {
          current = current.left;
        } else if (value > current.value) {
          current = current.right;
        } else {
          this.addStep(`Value ${value} already exists`, 'insert', value);
          return;
        }
      }

      newNode.parent = parent!;
      if (value < parent!.value) {
        parent!.left = newNode;
      } else {
        parent!.right = newNode;
      }

      this.addStep(`Inserted ${value} as RED node`, 'insert', value);
      this.insertFixup(newNode);
    }

    private insertFixup(node: RBTreeNode) {
      while (node.parent && node.parent.color === 'RED') {
        if (node.parent === node.parent.parent!.left) {
          const uncle = node.parent.parent!.right;
          
          if (uncle && uncle.color === 'RED') {
            // Case 1: Uncle is red
            node.parent.color = 'BLACK';
            uncle.color = 'BLACK';
            node.parent.parent!.color = 'RED';
            this.addStep(`Recolored parent and uncle BLACK, grandparent RED`, 'recolor');
            node = node.parent.parent!;
          } else {
            // Case 2 & 3: Uncle is black
            if (node === node.parent.right) {
              node = node.parent;
              this.rotateLeft(node);
            }
            
            node.parent!.color = 'BLACK';
            node.parent!.parent!.color = 'RED';
            this.addStep(`Recolored parent BLACK, grandparent RED`, 'recolor');
            this.rotateRight(node.parent!.parent!);
          }
        } else {
          // Symmetric cases
          const uncle = node.parent.parent!.left;
          
          if (uncle && uncle.color === 'RED') {
            node.parent.color = 'BLACK';
            uncle.color = 'BLACK';
            node.parent.parent!.color = 'RED';
            this.addStep(`Recolored parent and uncle BLACK, grandparent RED`, 'recolor');
            node = node.parent.parent!;
          } else {
            if (node === node.parent.left) {
              node = node.parent;
              this.rotateRight(node);
            }
            
            node.parent!.color = 'BLACK';
            node.parent!.parent!.color = 'RED';
            this.addStep(`Recolored parent BLACK, grandparent RED`, 'recolor');
            this.rotateLeft(node.parent!.parent!);
          }
        }
      }
      
      this.root!.color = 'BLACK';
      this.addStep(`Ensured root is BLACK`, 'recolor');
    }

    search(value: number): boolean {
      this.resetHighlights();
      let current = this.root;
      
      while (current) {
        current.isHighlighted = true;
        
        if (value === current.value) {
          this.addStep(`Found ${value} in the tree`, 'search', value, true);
          return true;
        } else if (value < current.value) {
          this.addStep(`Searching left subtree from ${current.value}`, 'search', value);
          current = current.left;
        } else {
          this.addStep(`Searching right subtree from ${current.value}`, 'search', value);
          current = current.right;
        }
      }
      
      this.addStep(`Value ${value} not found in tree`, 'search', value, false);
      return false;
    }

    private resetHighlights() {
      this.traverseAndReset(this.root);
    }

    private traverseAndReset(node: RBTreeNode | null) {
      if (!node) return;
      
      node.isHighlighted = false;
      node.isNewlyAdded = false;
      
      this.traverseAndReset(node.left);
      this.traverseAndReset(node.right);
    }

    getSteps(): RBTreeStep[] {
      return this.steps;
    }
  }

  // Perform operations
  const performInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    
    const currentTree = reconstructTree();
    currentTree.insert(value);
    
    const newSteps = currentTree.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-getInsertStepCount())]);
    
    setInputValue('');
  };

  const performSearch = () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) return;
    
    const currentTree = reconstructTree();
    currentTree.search(value);
    
    const newSteps = currentTree.getSteps();
    setSteps(prev => [...prev, ...newSteps.slice(-getSearchStepCount())]);
    
    setSearchValue('');
  };

  const getInsertStepCount = () => 5; // Approximate step count for insert
  const getSearchStepCount = () => Math.ceil(Math.log2(steps.length + 1)) + 2;

  // Reconstruct tree from steps
  const reconstructTree = (): RedBlackTree => {
    const tree = new RedBlackTree();
    
    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i];
      if (step.operation === 'insert' && step.targetValue !== undefined) {
        tree.insert(step.targetValue);
      }
    }
    
    return tree;
  };

  // Demo operations
  const runDemo = () => {
    const tree = new RedBlackTree();
    
    // Demo sequence
    const values = [10, 20, 30, 15, 25, 5, 1];
    values.forEach(value => tree.insert(value));
    
    tree.search(15);
    tree.search(100);
    
    setSteps(tree.getSteps());
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

  // Calculate tree layout
  const calculateLayout = (node: RBTreeNode | null, x = 400, y = 50, level = 0): void => {
    if (!node) return;
    
    node.x = x;
    node.y = y;
    
    const horizontalSpacing = 80 / (level + 1);
    const verticalSpacing = 80;
    
    if (node.left) {
      calculateLayout(node.left, x - horizontalSpacing, y + verticalSpacing, level + 1);
    }
    
    if (node.right) {
      calculateLayout(node.right, x + horizontalSpacing, y + verticalSpacing, level + 1);
    }
  };

  const currentStepData = steps[currentStep];

  // Render tree visualization
  const renderTree = () => {
    if (!currentStepData || !currentStepData.root) return null;

    calculateLayout(currentStepData.root);
    
    const renderNode = (node: RBTreeNode | null): React.ReactElement[] => {
      if (!node || !node.x || !node.y) return [];
      
      const elements: React.ReactElement[] = [];
      
      // Draw edges first
      if (node.left && node.left.x && node.left.y) {
        elements.push(
          <line
            key={`edge-${node.value}-left`}
            x1={node.x}
            y1={node.y + 25}
            x2={node.left.x}
            y2={node.left.y - 25}
            stroke="#64748b"
            strokeWidth="2"
          />
        );
        elements.push(...renderNode(node.left));
      }
      
      if (node.right && node.right.x && node.right.y) {
        elements.push(
          <line
            key={`edge-${node.value}-right`}
            x1={node.x}
            y1={node.y + 25}
            x2={node.right.x}
            y2={node.right.y - 25}
            stroke="#64748b"
            strokeWidth="2"
          />
        );
        elements.push(...renderNode(node.right));
      }
      
      // Draw node
      elements.push(
        <g key={`node-${node.value}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r="25"
            fill={node.color === 'RED' ? '#ef4444' : '#374151'}
            stroke={node.isHighlighted ? '#fbbf24' : '#64748b'}
            strokeWidth={node.isHighlighted ? "4" : "2"}
          />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            className="text-sm font-bold fill-white"
          >
            {node.value}
          </text>
        </g>
      );
      
      return elements;
    };

    return (
      <div className="relative w-full h-96 overflow-auto bg-gray-50 rounded-lg p-4">
        <svg width="800" height="400" className="mx-auto">
          {renderNode(currentStepData.root)}
        </svg>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TreePine className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Red-Black Tree Implementation</h1>
        </div>
        <p className="text-gray-600">
          Visualize Red-Black Tree operations - a self-balancing binary search tree with guaranteed O(log n) operations.
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
                <label className="text-sm font-medium mb-2 block">Insert Value</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter number"
                  />
                  <Button onClick={performInsert} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Insert
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Value</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Enter number"
                  />
                  <Button onClick={performSearch} size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Speed: {speed[0]}ms</label>
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
                <Button onClick={play} disabled={isPlaying || steps.length === 0} size="sm">
                  Play
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
                  <span>Operation:</span>
                  <span className="font-mono capitalize">{currentStepData?.operation || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Value:</span>
                  <span className="font-mono">{currentStepData?.targetValue || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Violations:</span>
                  <span className="font-mono">{currentStepData?.violations.length || 0}</span>
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
              <CardTitle>Red-Black Tree Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Insert values to build the red-black tree'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tree Structure */}
                {renderTree()}

                {/* Violations */}
                {currentStepData && currentStepData.violations.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="font-medium text-red-800 mb-2">Red-Black Tree Violations:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {currentStepData.violations.map((violation, index) => (
                        <li key={index}>• {violation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Red Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
                    <span>Black Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-yellow-500"></div>
                    <span>Highlighted</span>
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
            <CardTitle>Red-Black Tree Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Red-Black Tree is a self-balancing binary search tree where each node has a color (red or black) and follows specific rules to maintain balance.</p>
              
              <h3>Red-Black Tree Properties</h3>
              <ol>
                <li>Every node is either red or black</li>
                <li>The root is always black</li>
                <li>All leaves (NIL nodes) are black</li>
                <li>Red nodes cannot have red children (no two consecutive red nodes)</li>
                <li>All paths from root to leaves contain the same number of black nodes</li>
              </ol>

              <h3>Operations</h3>
              <ul>
                <li><strong>Insert:</strong> Add node as red, then fix violations with rotations and recoloring</li>
                <li><strong>Delete:</strong> Remove node and fix violations to maintain properties</li>
                <li><strong>Search:</strong> Standard BST search, not affected by colors</li>
                <li><strong>Rotate:</strong> Left and right rotations to maintain balance</li>
                <li><strong>Recolor:</strong> Change node colors to fix violations</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Search:</strong> O(log n) - guaranteed by balanced height</li>
                <li><strong>Insert:</strong> O(log n) - at most 2 rotations needed</li>
                <li><strong>Delete:</strong> O(log n) - at most 3 rotations needed</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(n) - one bit per node for color storage</p>

              <h3>Advantages</h3>
              <ul>
                <li>Guaranteed O(log n) operations</li>
                <li>Good worst-case performance</li>
                <li>Used in many standard libraries</li>
                <li>Relatively simple balancing rules</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Standard library implementations (map, set in C++)</li>
                <li>Database indexing</li>
                <li>File systems</li>
                <li>Priority queues</li>
                <li>Computational geometry algorithms</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
