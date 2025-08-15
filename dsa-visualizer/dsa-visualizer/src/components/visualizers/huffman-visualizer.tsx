"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactFlow to avoid SSR issues
const ReactFlow = dynamic(() => import('reactflow').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading...</div>
});

const Controls = dynamic(() => import('reactflow').then(mod => mod.Controls), { ssr: false });
const Background = dynamic(() => import('reactflow').then(mod => mod.Background), { ssr: false });

import { 
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Play, RotateCcw, ArrowLeft, ArrowRight, Binary, TreePine, Hash } from 'lucide-react';

// --- Types ---
interface HuffmanNode {
  id: string;
  character: string | null;
  frequency: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  code?: string;
  isActive?: boolean;
  isHighlighted?: boolean;
}

interface FrequencyEntry {
  character: string;
  frequency: number;
  code: string;
}

interface BuildStep {
  step: number;
  description: string;
  nodes: HuffmanNode[];
  currentNodes: HuffmanNode[];
  action: 'merge' | 'select' | 'complete' | 'initial';
  tree?: HuffmanNode | null;
}

// --- Constants ---
const DEFAULT_TEXT = "hello world this is huffman coding";
const NODE_WIDTH = 80;
const NODE_HEIGHT = 80;
const VERTICAL_SPACING = 100;

// --- Huffman Algorithm Implementation ---
class HuffmanCoding {
  private root: HuffmanNode | null = null;
  private codes: Map<string, string> = new Map();
  private buildSteps: BuildStep[] = [];

  buildTree(text: string): { tree: HuffmanNode | null; steps: BuildStep[] } {
    if (!text) return { tree: null, steps: [] };

    // Calculate frequency
    const frequency = new Map<string, number>();
    for (const char of text) {
      frequency.set(char, (frequency.get(char) || 0) + 1);
    }

    // Create initial nodes
    const nodes: HuffmanNode[] = [];
    let nodeId = 0;
    
    for (const [char, freq] of frequency) {
      nodes.push({
        id: `node-${nodeId++}`,
        character: char,
        frequency: freq,
        left: null,
        right: null
      });
    }

    // Sort by frequency
    nodes.sort((a, b) => a.frequency - b.frequency);

    this.buildSteps = [{
      step: 1,
      description: `Created ${nodes.length} leaf nodes from character frequencies`,
      nodes: [...nodes],
      currentNodes: [],
      action: 'initial',
      tree: null
    }];

    let stepCount = 2;
    const workingNodes = [...nodes];

    // Build tree step by step
    while (workingNodes.length > 1) {
      // Take two nodes with lowest frequency
      const left = workingNodes.shift()!;
      const right = workingNodes.shift()!;

      this.buildSteps.push({
        step: stepCount++,
        description: `Selecting nodes '${left.character || 'Internal'}' (${left.frequency}) and '${right.character || 'Internal'}' (${right.frequency})`,
        nodes: [...nodes],
        currentNodes: [left, right],
        action: 'select',
        tree: workingNodes.length === 0 ? null : workingNodes[0]
      });

      // Create new internal node
      const merged: HuffmanNode = {
        id: `node-${nodeId++}`,
        character: null,
        frequency: left.frequency + right.frequency,
        left,
        right
      };

      // Insert back maintaining sorted order
      let inserted = false;
      for (let i = 0; i < workingNodes.length; i++) {
        if (merged.frequency <= workingNodes[i].frequency) {
          workingNodes.splice(i, 0, merged);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        workingNodes.push(merged);
      }

      this.buildSteps.push({
        step: stepCount++,
        description: `Merged into new internal node with frequency ${merged.frequency}`,
        nodes: [...nodes],
        currentNodes: [merged],
        action: 'merge',
        tree: merged
      });
    }

    this.root = workingNodes[0];
    
    this.buildSteps.push({
      step: stepCount,
      description: 'Huffman tree construction complete!',
      nodes: [...nodes],
      currentNodes: [this.root],
      action: 'complete',
      tree: this.root
    });

    // Generate codes
    this.generateCodes(this.root, '');

    return { tree: this.root, steps: this.buildSteps };
  }

  private generateCodes(node: HuffmanNode | null, code: string): void {
    if (!node) return;

    if (node.character !== null) {
      // Leaf node
      this.codes.set(node.character, code || '0');
      node.code = code || '0';
    } else {
      // Internal node
      this.generateCodes(node.left, code + '0');
      this.generateCodes(node.right, code + '1');
    }
  }

  encode(text: string): string {
    if (!this.codes.size || !text) return '';
    
    return text.split('').map(char => this.codes.get(char) || '').join('');
  }

  decode(encoded: string): string {
    if (!this.root || !encoded) return '';

    let result = '';
    let current = this.root;

    for (const bit of encoded) {
      if (bit === '0') {
        current = current.left!;
      } else {
        current = current.right!;
      }

      if (current.character !== null) {
        result += current.character;
        current = this.root;
      }
    }

    return result;
  }

  getCodes(): Map<string, string> {
    return this.codes;
  }
}

// --- Tree Visualization Component ---
const HuffmanTreeVisualizer: React.FC<{
  tree: HuffmanNode | null;
  highlightNodes?: string[];
}> = ({ tree, highlightNodes = [] }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Simple but effective tree layout algorithm
  const generateFlowData = useCallback((node: HuffmanNode | null): { nodes: Node[], edges: Edge[] } => {
    if (!node) return { nodes: [], edges: [] };

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // First pass: calculate the number of leaf nodes in each subtree
    const getLeafCount = (n: HuffmanNode | null): number => {
      if (!n) return 0;
      if (!n.left && !n.right) return 1;
      return getLeafCount(n.left) + getLeafCount(n.right);
    };

    // Second pass: assign positions based on leaf count
    const assignPositions = (n: HuffmanNode, x: number, y: number, width: number) => {
      const isLeaf = n.character !== null;
      const isHighlighted = highlightNodes.includes(n.id);
      
      const nodeStyle = {
        background: isHighlighted ? '#ef4444' : isLeaf ? '#10b981' : '#8b5cf6',
        color: 'white',
        border: '2px solid #374151',
        borderRadius: isLeaf ? '8px' : '50%',
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease-in-out',
        padding: '4px'
      };

      newNodes.push({
        id: n.id,
        data: { 
          label: (
            <div className="text-center">
              <div className="text-sm font-bold">
                {n.character ? `'${n.character === ' ' ? '␣' : n.character}'` : 'INT'}
              </div>
              <div className="text-xs">
                f: {n.frequency}
              </div>
              {n.character && n.code && (
                <div className="text-xs mt-1 px-1 bg-black bg-opacity-20 rounded">
                  {n.code}
                </div>
              )}
            </div>
          )
        },
        position: { x: x - NODE_WIDTH/2, y },
        style: nodeStyle
      });

      if (n.left || n.right) {
        const leftLeaves = getLeafCount(n.left);
        const rightLeaves = getLeafCount(n.right);
        const totalLeaves = leftLeaves + rightLeaves;
        
        if (totalLeaves > 1) {
          const leftWidth = (leftLeaves / totalLeaves) * width;
          const rightWidth = (rightLeaves / totalLeaves) * width;
          
          if (n.left) {
            const leftX = x - width/2 + leftWidth/2;
            newEdges.push({
              id: `${n.id}-${n.left.id}`,
              source: n.id,
              target: n.left.id,
              label: '0',
              labelStyle: { fontSize: '12px', fontWeight: 'bold' },
              labelBgStyle: { fill: '#ffffff', stroke: '#374151' },
              style: { stroke: '#374151', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#374151' }
            });
            assignPositions(n.left, leftX, y + VERTICAL_SPACING, leftWidth);
          }
          
          if (n.right) {
            const rightX = x + width/2 - rightWidth/2;
            newEdges.push({
              id: `${n.id}-${n.right.id}`,
              source: n.id,
              target: n.right.id,
              label: '1',
              labelStyle: { fontSize: '12px', fontWeight: 'bold' },
              labelBgStyle: { fill: '#ffffff', stroke: '#374151' },
              style: { stroke: '#374151', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#374151' }
            });
            assignPositions(n.right, rightX, y + VERTICAL_SPACING, rightWidth);
          }
        } else {
          // Simple case for single child
          if (n.left) {
            newEdges.push({
              id: `${n.id}-${n.left.id}`,
              source: n.id,
              target: n.left.id,
              label: '0',
              labelStyle: { fontSize: '12px', fontWeight: 'bold' },
              labelBgStyle: { fill: '#ffffff', stroke: '#374151' },
              style: { stroke: '#374151', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#374151' }
            });
            assignPositions(n.left, x - 120, y + VERTICAL_SPACING, width);
          }
          
          if (n.right) {
            newEdges.push({
              id: `${n.id}-${n.right.id}`,
              source: n.id,
              target: n.right.id,
              label: '1',
              labelStyle: { fontSize: '12px', fontWeight: 'bold' },
              labelBgStyle: { fill: '#ffffff', stroke: '#374151' },
              style: { stroke: '#374151', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#374151' }
            });
            assignPositions(n.right, x + 120, y + VERTICAL_SPACING, width);
          }
        }
      }
    };

    const totalLeaves = getLeafCount(node);
    const totalWidth = Math.max(600, totalLeaves * 120);
    
    assignPositions(node, totalWidth / 2, 50, totalWidth);

    return { nodes: newNodes, edges: newEdges };
  }, [highlightNodes]);

  useEffect(() => {
    if (!tree) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: newNodes, edges: newEdges } = generateFlowData(tree);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [tree, generateFlowData]);

  if (!tree) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter text to build Huffman Tree</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isMounted) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading tree visualization...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Huffman Tree Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] bg-gray-50 rounded-lg border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="top-right"
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
        <div className="mt-4 text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              Leaf Nodes (Characters)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Internal Nodes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              Highlighted Nodes
            </span>
            <span>Edges: 0 = Left, 1 = Right</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Component ---
export const HuffmanCodingVisualizer = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [huffmanTree, setHuffmanTree] = useState<HuffmanNode | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [encodedText, setEncodedText] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [frequencyTable, setFrequencyTable] = useState<FrequencyEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const huffman = useCallback(() => new HuffmanCoding(), []);

  const buildHuffmanTree = useCallback(() => {
    if (!inputText.trim()) {
      setError("Please enter some text to build the Huffman tree.");
      return;
    }

    setError(null);
    const coding = huffman();
    const { tree, steps } = coding.buildTree(inputText);
    
    setHuffmanTree(tree);
    setBuildSteps(steps);
    setCurrentStepIndex(0);

    if (tree) {
      // Generate frequency table
      const frequency = new Map<string, number>();
      for (const char of inputText) {
        frequency.set(char, (frequency.get(char) || 0) + 1);
      }

      const codes = coding.getCodes();
      const table: FrequencyEntry[] = [];
      for (const [char, freq] of frequency) {
        table.push({
          character: char === ' ' ? '␣' : char,
          frequency: freq,
          code: codes.get(char) || ''
        });
      }
      table.sort((a, b) => b.frequency - a.frequency);
      setFrequencyTable(table);

      // Encode text
      const encoded = coding.encode(inputText);
      setEncodedText(encoded);

      // Decode text (for verification)
      const decoded = coding.decode(encoded);
      setDecodedText(decoded);

      // Calculate compression ratio
      const originalBits = inputText.length * 8;
      const compressedBits = encoded.length;
      const ratio = originalBits > 0 ? ((originalBits - compressedBits) / originalBits * 100) : 0;
      setCompressionRatio(ratio);
    }
  }, [inputText, huffman]);

  const animateBuildProcess = async () => {
    if (!buildSteps.length) return;
    
    setIsAnimating(true);
    setCurrentStepIndex(0);

    for (let i = 0; i < buildSteps.length; i++) {
      setCurrentStepIndex(i);
      const delay = Math.max(500, 3000 - (animationSpeed * 250));
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setIsAnimating(false);
  };

  const navigateSteps = (direction: 'prev' | 'next' | 'first' | 'last') => {
    if (isAnimating) return;

    switch (direction) {
      case 'prev':
        setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
        break;
      case 'next':
        setCurrentStepIndex(Math.min(buildSteps.length - 1, currentStepIndex + 1));
        break;
      case 'first':
        setCurrentStepIndex(0);
        break;
      case 'last':
        setCurrentStepIndex(buildSteps.length - 1);
        break;
    }
  };

  const handleReset = () => {
    setHuffmanTree(null);
    setBuildSteps([]);
    setCurrentStepIndex(0);
    setEncodedText('');
    setDecodedText('');
    setFrequencyTable([]);
    setCompressionRatio(0);
    setError(null);
    setInputText(DEFAULT_TEXT);
  };

  useEffect(() => {
    buildHuffmanTree();
  }, [buildHuffmanTree]);

  const currentStep = buildSteps[currentStepIndex];
  const highlightNodes = currentStep?.currentNodes.map(n => n.id) || [];
  const displayTree = currentStep?.tree || huffmanTree;

  if (!isMounted) {
    return (
      <Card className="w-full mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading Huffman Coding Visualizer...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-6 w-6" />
          Huffman Coding Visualizer
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Interactive visualization of Huffman Coding algorithm for optimal prefix-free encoding
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Input Text</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to encode..."
              className="min-h-[100px]"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <Button onClick={buildHuffmanTree} disabled={!inputText.trim()}>
              <TreePine className="h-4 w-4 mr-2" />
              Build Tree
            </Button>
            <Button 
              onClick={animateBuildProcess} 
              disabled={!buildSteps.length || isAnimating}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              {isAnimating ? 'Animating...' : 'Animate Build'}
            </Button>
            <Button onClick={handleReset} variant="destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            {/* Animation Speed Control */}
            {buildSteps.length > 0 && (
              <div className="flex items-center gap-2 min-w-[200px]">
                <label className="text-sm font-medium">Speed:</label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{animationSpeed}</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step Navigation */}
          {buildSteps.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateSteps('first')}
                disabled={currentStepIndex === 0 || isAnimating}
              >
                First
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateSteps('prev')}
                disabled={currentStepIndex === 0 || isAnimating}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600 mx-2 min-w-[120px] text-center">
                Step {currentStepIndex + 1} of {buildSteps.length}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateSteps('next')}
                disabled={currentStepIndex === buildSteps.length - 1 || isAnimating}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateSteps('last')}
                disabled={currentStepIndex === buildSteps.length - 1 || isAnimating}
              >
                Last
              </Button>
            </div>
          )}

          {/* Current Step Description */}
          {currentStep && (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm font-medium text-blue-900">
                Step {currentStep.step}: {currentStep.description}
              </p>
            </div>
          )}
        </div>

        {/* Main Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree Visualization */}
          <div className="lg:col-span-2">
            <HuffmanTreeVisualizer 
              tree={displayTree}
              highlightNodes={highlightNodes}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Frequency Table */}
            {frequencyTable.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Frequency & Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {frequencyTable.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                            &apos;{entry.character}&apos;
                          </span>
                          <span className="text-gray-600">
                            ×{entry.frequency}
                          </span>
                        </div>
                        <span className="font-mono text-blue-600 font-bold">
                          {entry.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compression Stats */}
            {encodedText && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compression Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-lg text-blue-800">{inputText.length}</div>
                      <div className="text-blue-600">Characters</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-lg text-green-800">{inputText.length * 8}</div>
                      <div className="text-green-600">Original Bits</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-lg text-purple-800">{encodedText.length}</div>
                      <div className="text-purple-600">Encoded Bits</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="font-bold text-lg text-orange-800">
                        {compressionRatio >= 0 ? compressionRatio.toFixed(1) : '0.0'}%
                      </div>
                      <div className="text-orange-600">Compression</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Encoded/Decoded Results */}
        {encodedText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Binary className="h-5 w-5" />
                Encoding Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="encoded" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="encoded">Encoded Binary</TabsTrigger>
                  <TabsTrigger value="decoded">Decoded Text</TabsTrigger>
                </TabsList>
                <TabsContent value="encoded" className="space-y-2">
                  <label className="text-sm font-medium">Binary Output ({encodedText.length} bits):</label>
                  <Textarea
                    value={encodedText}
                    readOnly
                    className="font-mono text-xs"
                    style={{ minHeight: '120px' }}
                  />
                </TabsContent>
                <TabsContent value="decoded" className="space-y-2">
                  <label className="text-sm font-medium">Decoded Text:</label>
                  <Textarea
                    value={decodedText}
                    readOnly
                    className="font-mono"
                    style={{ minHeight: '120px' }}
                  />
                  {decodedText === inputText ? (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm text-green-700 font-medium">
                        Decoding successful! Output matches input perfectly.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-600">✗</span>
                      <span className="text-sm text-red-700 font-medium">
                        Decoding failed! Output does not match input.
                      </span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default HuffmanCodingVisualizer;
