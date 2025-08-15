"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TreePine, Plus, Search, Trash2, RotateCcw } from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface TrieNode {
  id: string;
  char: string;
  children: { [key: string]: TrieNode };
  isEndOfWord: boolean;
  isActive: boolean;
  isHighlighted: boolean;
  x: number;
  y: number;
  level: number;
}

interface TrieStep {
  description: string;
  trie: TrieNode;
  currentPath: string[];
  operation: 'insert' | 'search' | 'delete' | 'display';
  word: string;
  found?: boolean;
}

export default function TriePage() {
  const [words, setWords] = useState<string[]>(['CAT', 'CATS', 'DOG', 'DOGS', 'CAR', 'CARD']);
  const [currentWord, setCurrentWord] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [steps, setSteps] = useState<TrieStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ totalWords: 0, totalNodes: 0, maxDepth: 0 });

  // Create root node
  const createRootNode = (): TrieNode => ({
    id: 'root',
    char: 'ROOT',
    children: {},
    isEndOfWord: false,
    isActive: false,
    isHighlighted: false,
    x: 400,
    y: 50,
    level: 0
  });

  // Generate unique ID for nodes
  const generateId = (char: string, level: number, parentId: string): string => {
    return `${parentId}-${char}-${level}`;
  };

  // Insert word into trie
  const insertWord = (root: TrieNode, word: string): TrieStep[] => {
    const steps: TrieStep[] = [];
    
    let current = root;
    const path: string[] = [];
    
    // Reset all active states
    resetNodeStates(root);
    
    steps.push({
      description: `Inserting word: "${word}"`,
      trie: JSON.parse(JSON.stringify(root)),
      currentPath: [],
      operation: 'insert',
      word
    });

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      path.push(char);
      
      // Highlight current node
      current.isActive = true;
      
      steps.push({
        description: `Looking for character '${char}' at level ${i + 1}`,
        trie: JSON.parse(JSON.stringify(root)),
        currentPath: [...path],
        operation: 'insert',
        word
      });

      if (!current.children[char]) {
        // Create new node
        current.children[char] = {
          id: generateId(char, i + 1, current.id),
          char,
          children: {},
          isEndOfWord: false,
          isActive: false,
          isHighlighted: false,
          x: current.x + (Object.keys(current.children).length * 100) - 200,
          y: current.y + 80,
          level: i + 1
        };

        steps.push({
          description: `Created new node for character '${char}'`,
          trie: JSON.parse(JSON.stringify(root)),
          currentPath: [...path],
          operation: 'insert',
          word
        });
      } else {
        steps.push({
          description: `Found existing node for character '${char}'`,
          trie: JSON.parse(JSON.stringify(root)),
          currentPath: [...path],
          operation: 'insert',
          word
        });
      }

      current.isActive = false;
      current = current.children[char];
      current.isHighlighted = true;
    }

    // Mark end of word
    current.isEndOfWord = true;
    
    steps.push({
      description: `Marked end of word for "${word}"`,
      trie: JSON.parse(JSON.stringify(root)),
      currentPath: path,
      operation: 'insert',
      word
    });

    // Reset highlights
    resetNodeStates(root);
    
    steps.push({
      description: `Successfully inserted "${word}" into trie`,
      trie: JSON.parse(JSON.stringify(root)),
      currentPath: [],
      operation: 'insert',
      word
    });

    return steps;
  };

  // Search for word in trie
  const searchInTrie = (root: TrieNode, word: string): TrieStep[] => {
    const steps: TrieStep[] = [];
    let current = root;
    const path: string[] = [];
    
    resetNodeStates(root);
    
    steps.push({
      description: `Searching for word: "${word}"`,
      trie: JSON.parse(JSON.stringify(root)),
      currentPath: [],
      operation: 'search',
      word,
      found: false
    });

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      path.push(char);
      
      current.isActive = true;
      
      steps.push({
        description: `Looking for character '${char}' at level ${i + 1}`,
        trie: JSON.parse(JSON.stringify(root)),
        currentPath: [...path],
        operation: 'search',
        word,
        found: false
      });

      if (!current.children[char]) {
        steps.push({
          description: `Character '${char}' not found. "${word}" does not exist in trie.`,
          trie: JSON.parse(JSON.stringify(root)),
          currentPath: path,
          operation: 'search',
          word,
          found: false
        });
        
        resetNodeStates(root);
        return steps;
      }

      current.isActive = false;
      current = current.children[char];
      current.isHighlighted = true;
      
      steps.push({
        description: `Found character '${char}', moving to next level`,
        trie: JSON.parse(JSON.stringify(root)),
        currentPath: [...path],
        operation: 'search',
        word,
        found: false
      });
    }

    const found = current.isEndOfWord;
    const message = found 
      ? `"${word}" found in trie!` 
      : `"${word}" is a prefix but not a complete word in trie.`;
    
    steps.push({
      description: message,
      trie: JSON.parse(JSON.stringify(root)),
      currentPath: path,
      operation: 'search',
      word,
      found
    });

    resetNodeStates(root);
    
    return steps;
  };

  // Reset all node states
  const resetNodeStates = (node: TrieNode) => {
    node.isActive = false;
    node.isHighlighted = false;
    Object.values(node.children).forEach(child => resetNodeStates(child));
  };

  // Calculate trie statistics
  const calculateStats = (root: TrieNode): { totalNodes: number; maxDepth: number; wordCount: number } => {
    let totalNodes = 1; // Count root
    let maxDepth = 0;
    let wordCount = 0;

    const dfs = (node: TrieNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      if (node.isEndOfWord) wordCount++;
      
      Object.values(node.children).forEach(child => {
        totalNodes++;
        dfs(child, depth + 1);
      });
    };

    dfs(root, 0);
    return { totalNodes, maxDepth, wordCount };
  };

  // Position nodes in tree layout
  const positionNodes = (root: TrieNode) => {
    const levelWidth: { [key: number]: number } = {};
    
    const calculateLevelWidths = (node: TrieNode, level: number) => {
      if (!levelWidth[level]) levelWidth[level] = 0;
      levelWidth[level]++;
      
      Object.values(node.children).forEach(child => 
        calculateLevelWidths(child, level + 1)
      );
    };

    const positionNodesRecursive = (node: TrieNode, level: number, parentX: number, siblings: TrieNode[], index: number) => {
      const levelNodes = levelWidth[level] || 1;
      const spacing = Math.min(120, 800 / Math.max(levelNodes, 1));
      const startX = 400 - ((siblings.length - 1) * spacing) / 2;
      
      node.x = startX + (index * spacing);
      node.y = 100 + (level * 80);
      node.level = level;

      const childrenArray = Object.values(node.children);
      childrenArray.forEach((child, idx) => 
        positionNodesRecursive(child, level + 1, node.x, childrenArray, idx)
      );
    };

    calculateLevelWidths(root, 0);
    positionNodesRecursive(root, 0, 400, [root], 0);
  };

  // Build trie from words array
  const buildTrie = () => {
    const root = createRootNode();
    const allSteps: TrieStep[] = [];
    
    for (const word of words) {
      const wordSteps = insertWord(root, word.toUpperCase());
      allSteps.push(...wordSteps);
    }
    
    positionNodes(root);
    
    // Final display step
    resetNodeStates(root);
    allSteps.push({
      description: `Trie construction completed with ${words.length} words`,
      trie: JSON.parse(JSON.stringify(root)),
      currentPath: [],
      operation: 'display',
      word: ''
    });

    setSteps(allSteps);
    setCurrentStep(allSteps.length - 1);
    
    const stats = calculateStats(root);
    setStats({
      totalWords: stats.wordCount,
      totalNodes: stats.totalNodes,
      maxDepth: stats.maxDepth
    });
  };

  // Add word to trie
  const addWord = () => {
    if (!currentWord.trim()) return;
    
    const newWords = [...words, currentWord.toUpperCase()];
    setWords(newWords);
    setCurrentWord('');
  };

  // Search for word
  const handleSearch = () => {
    if (!searchWord.trim() || !steps.length) return;
    
    const lastStep = steps[steps.length - 1];
    const searchSteps = searchInTrie(lastStep.trie, searchWord.toUpperCase());
    
    setSteps([...steps, ...searchSteps]);
    setCurrentStep(steps.length);
    setIsPlaying(true);
  };

  // Reset to sample data
  const resetToSample = () => {
    setWords(['CAT', 'CATS', 'DOG', 'DOGS', 'CAR', 'CARD']);
    setCurrentWord('');
    setSearchWord('');
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Auto-play animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      intervalId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isPlaying, currentStep, steps.length]);

  // Initialize trie
  useEffect(() => {
    buildTrie();
  }, [words]);

  const currentStepData = steps[currentStep];

  // Render trie node
  const renderNode = (node: TrieNode) => {
    const nodeStyle = {
      left: node.x - 20,
      top: node.y - 20,
    };

    let nodeClass = "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold absolute transition-all duration-300 ";
    
    if (node.isActive) {
      nodeClass += "bg-red-200 border-red-500 ";
    } else if (node.isHighlighted) {
      nodeClass += "bg-yellow-200 border-yellow-500 ";
    } else if (node.isEndOfWord) {
      nodeClass += "bg-green-200 border-green-500 ";
    } else {
      nodeClass += "bg-blue-100 border-blue-400 ";
    }

    return (
      <div key={node.id} style={nodeStyle} className={nodeClass}>
        {node.char === 'ROOT' ? 'R' : node.char}
      </div>
    );
  };

  // Render trie edges
  const renderEdges = (node: TrieNode) => {
    return Object.values(node.children).map(child => {
      const x1 = node.x;
      const y1 = node.y + 20;
      const x2 = child.x;
      const y2 = child.y - 20;

      return (
        <line
          key={`edge-${node.id}-${child.id}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#6b7280"
          strokeWidth="2"
          className="transition-all duration-300"
        />
      );
    });
  };

  // Render all edges recursively
  const renderAllEdges = (node: TrieNode): React.ReactElement[] => {
    const edges = renderEdges(node);
    const childEdges = Object.values(node.children).flatMap(child => renderAllEdges(child));
    return [...edges, ...childEdges];
  };

  // Render all nodes recursively
  const renderAllNodes = (node: TrieNode): React.ReactElement[] => {
    const nodeElement = renderNode(node);
    const childNodes = Object.values(node.children).flatMap(child => renderAllNodes(child));
    return [nodeElement, ...childNodes];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-4">
            <TreePine className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Cây Trie (Prefix Tree)</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Cây Trie (Prefix Tree)"
              description="Cây Trie là cấu trúc dữ liệu dạng cây được sử dụng để lưu trữ và tìm kiếm chuỗi hiệu quả, đặc biệt hữu ích cho các thao tác tiền tố."
              timeComplexity={{
                best: "O(m)",
                average: "O(m)", 
                worst: "O(m)"
              }}
              spaceComplexity="O(ALPHABET_SIZE × N × M)"
              principles={[
                "Mỗi nút đại diện cho một ký tự",
                "Đường đi từ gốc đến nút tạo thành tiền tố",
                "Nút cuối từ được đánh dấu đặc biệt",
                "Tiết kiệm không gian cho tiền tố chung"
              ]}
              applications={[
                "Autocomplete và gợi ý từ khóa",
                "Kiểm tra chính tả",
                "Tìm kiếm tiền tố trong từ điển",
                "IP routing trong mạng máy tính"
              ]}
              advantages={[
                "Tìm kiếm tiền tố rất nhanh O(m)",
                "Tiết kiệm bộ nhớ cho tiền tố chung",
                "Hỗ trợ thao tác từ điển hiệu quả",
                "Dễ cài đặt và hiểu"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa cấu trúc dữ liệu Trie để lưu trữ chuỗi hiệu quả và các thao tác dựa trên tiền tố.
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
                <label className="text-sm font-medium mb-2 block">Add Word</label>
                <div className="flex gap-2">
                  <Input
                    value={currentWord}
                    onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
                    placeholder="Enter word"
                    onKeyPress={(e) => e.key === 'Enter' && addWord()}
                  />
                  <Button onClick={addWord} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Word</label>
                <div className="flex gap-2">
                  <Input
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value.toUpperCase())}
                    placeholder="Search word"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setIsPlaying(!isPlaying)} size="sm">
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={resetToSample} size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Words in Trie</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {words.map((word, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono">{word}</span>
                      <Button
                        onClick={() => setWords(words.filter((_, i) => i !== index))}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
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
                  <span>Total Words:</span>
                  <span className="font-mono">{stats.totalWords}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Nodes:</span>
                  <span className="font-mono">{stats.totalNodes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Depth:</span>
                  <span className="font-mono">{stats.maxDepth}</span>
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
              <CardTitle>Trie Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Build your trie by adding words'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 overflow-auto border rounded-lg bg-gray-50">
                <svg width="800" height="400" className="absolute">
                  {currentStepData?.trie && renderAllEdges(currentStepData.trie)}
                </svg>
                <div className="absolute w-full h-full">
                  {currentStepData?.trie && renderAllNodes(currentStepData.trie)}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded-full"></div>
                  <span>Regular Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded-full"></div>
                  <span>End of Word</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-500 rounded-full"></div>
                  <span>Current Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border-2 border-red-500 rounded-full"></div>
                  <span>Active Node</span>
                </div>
              </div>

              {/* Current path display */}
              {currentStepData?.currentPath && currentStepData.currentPath.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Current Path: </span>
                  <span className="font-mono text-lg">{currentStepData.currentPath.join(' → ')}</span>
                </div>
              )}

              {/* Search result */}
              {currentStepData?.operation === 'search' && currentStepData.found !== undefined && (
                <div className={`mt-4 p-3 rounded-lg ${
                  currentStepData.found ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <span className="font-medium">
                    {currentStepData.found ? '✓ Word found!' : '✗ Word not found'}
                  </span>
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
            <CardTitle>Trie Data Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>A Trie (prefix tree) is a tree-like data structure used to store and retrieve strings efficiently. Each node represents a character, and paths from root to leaves represent complete words.</p>
              
              <h3>Time Complexities</h3>
              <ul>
                <li><strong>Insert:</strong> O(m) where m is the length of the word</li>
                <li><strong>Search:</strong> O(m) where m is the length of the word</li>
                <li><strong>Delete:</strong> O(m) where m is the length of the word</li>
                <li><strong>Prefix Search:</strong> O(p) where p is the length of the prefix</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(ALPHABET_SIZE × N × M) where N is the number of words and M is the average length of words.</p>

              <h3>Applications</h3>
              <ul>
                <li>Autocomplete and spell checkers</li>
                <li>IP routing (longest prefix matching)</li>
                <li>Dictionary implementations</li>
                <li>Word games and puzzles</li>
                <li>DNA sequence analysis</li>
              </ul>

              <h3>Advantages</h3>
              <ul>
                <li>Fast prefix-based searches</li>
                <li>Memory efficient for large datasets with common prefixes</li>
                <li>Ordered traversal gives lexicographically sorted results</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
