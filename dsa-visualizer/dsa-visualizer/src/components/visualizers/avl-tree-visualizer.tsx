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
import { Trash2, Plus, Zap } from "lucide-react";

// --- Data Structure ---
class AVLNode {
  value: number;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;

  constructor(value: number) {
    this.value = value;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

// --- Visualizer Component ---
const NODE_HEIGHT = 100;

export const AVLTreeVisualizer = () => {
  const [root, setRoot] = useState<AVLNode | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  // --- AVL Tree Logic ---
  const getHeight = useCallback((node: AVLNode | null): number => node ? node.height : 0, []);
  const getBalanceFactor = useCallback((node: AVLNode | null): number => node ? getHeight(node.left) - getHeight(node.right) : 0, [getHeight]);
  const updateHeight = (node: AVLNode) => {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  };

  const rightRotate = (y: AVLNode): AVLNode => {
    const x = y.left!;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    updateHeight(y);
    updateHeight(x);
    return x;
  };

  const leftRotate = (x: AVLNode): AVLNode => {
    const y = x.right!;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    updateHeight(x);
    updateHeight(y);
    return y;
  };

  const insertNode = (node: AVLNode | null, value: number): AVLNode => {
    if (!node) return new AVLNode(value);

    if (value < node.value) {
      node.left = insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = insertNode(node.right, value);
    } else {
      setError(`Value ${value} already exists.`);
      return node; // No duplicates allowed
    }

    updateHeight(node);
    const balance = getBalanceFactor(node);

    // Left Left Case
    if (balance > 1 && value < node.left!.value) {
      return rightRotate(node);
    }
    // Right Right Case
    if (balance < -1 && value > node.right!.value) {
      return leftRotate(node);
    }
    // Left Right Case
    if (balance > 1 && value > node.left!.value) {
      node.left = leftRotate(node.left!);
      return rightRotate(node);
    }
    // Right Left Case
    if (balance < -1 && value < node.right!.value) {
      node.right = rightRotate(node.right!);
      return leftRotate(node);
    }

    return node;
  };
  
  const findMin = (node: AVLNode): AVLNode => node.left ? findMin(node.left) : node;

  const deleteNode = (node: AVLNode | null, value: number): AVLNode | null => {
    if (!node) {
        setError(`Value ${value} not found.`);
        return node;
    }

    if (value < node.value) {
        node.left = deleteNode(node.left, value);
    } else if (value > node.value) {
        node.right = deleteNode(node.right, value);
    } else {
        if (!node.left || !node.right) {
            node = node.left || node.right;
        } else {
            const temp = findMin(node.right);
            node.value = temp.value;
            node.right = deleteNode(node.right, temp.value);
        }
    }

    if (!node) return node;

    updateHeight(node);
    const balance = getBalanceFactor(node);

    // Left Left Case
    if (balance > 1 && getBalanceFactor(node.left) >= 0) return rightRotate(node);
    // Left Right Case
    if (balance > 1 && getBalanceFactor(node.left) < 0) {
        node.left = leftRotate(node.left!);
        return rightRotate(node);
    }
    // Right Right Case
    if (balance < -1 && getBalanceFactor(node.right) <= 0) return leftRotate(node);
    // Right Left Case
    if (balance < -1 && getBalanceFactor(node.right) > 0) {
        node.right = rightRotate(node.right!);
        return leftRotate(node);
    }

    return node;
  };


  // --- React Flow Data Generation ---
  const generateFlowData = useCallback((node: AVLNode | null, x = 0, y = 0, horizontalGap = 400): { nodes: Node[], edges: Edge[] } => {
    if (!node) return { nodes: [], edges: [] };

    const currentId = node.value.toString();
    const balanceFactor = getBalanceFactor(node);
    const newNodes: Node[] = [{
      id: currentId,
      data: { label: `${node.value} (BF: ${balanceFactor})` },
      position: { x, y },
      style: {
        background: '#1e3a8a',
        color: 'white',
        border: Math.abs(balanceFactor) > 1 ? '2px solid #ef4444' : '2px solid #3b82f6',
        borderRadius: '8px',
        width: 100,
        textAlign: 'center'
      }
    }];
    const newEdges: Edge[] = [];

    const gap = horizontalGap / 2;

    if (node.left) {
      const leftId = node.left.value.toString();
      const leftData = generateFlowData(node.left, x - gap, y + NODE_HEIGHT, gap);
      newNodes.push(...leftData.nodes);
      newEdges.push(...leftData.edges);
      newEdges.push({ id: `${currentId}-l-${leftId}`, source: currentId, target: leftId, markerEnd: { type: MarkerType.ArrowClosed }, label: 'L' });
    }

    if (node.right) {
      const rightId = node.right.value.toString();
      const rightData = generateFlowData(node.right, x + gap, y + NODE_HEIGHT, gap);
      newNodes.push(...rightData.nodes);
      newEdges.push(...rightData.edges);
      newEdges.push({ id: `${currentId}-r-${rightId}`, source: currentId, target: rightId, markerEnd: { type: MarkerType.ArrowClosed }, label: 'R' });
    }

    return { nodes: newNodes, edges: newEdges };
  }, [getBalanceFactor]);
  
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateFlowData(root);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [root, generateFlowData]);

  const handleInsert = () => {
    setError(null);
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }
    setRoot(prevRoot => insertNode(JSON.parse(JSON.stringify(prevRoot || null)), value));
    setInputValue('');
  };

  const handleDelete = () => {
    setError(null);
    const value = parseInt(deleteValue, 10);
    if (isNaN(value)) {
      setError("Please enter a valid number to delete.");
      return;
    }
    setRoot(prevRoot => deleteNode(JSON.parse(JSON.stringify(prevRoot || null)), value));
    setDeleteValue('');
  };

  const handleReset = () => {
    setRoot(null);
    setError(null);
    setInputValue('');
    setDeleteValue('');
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center"><Zap className="mr-2 text-yellow-400"/> AVL Tree (Self-Balancing)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex gap-2">
            <Input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Value to insert" />
            <Button onClick={handleInsert}><Plus className="h-4 w-4 mr-1" /> Insert</Button>
          </div>
          <div className="flex gap-2">
            <Input type="number" value={deleteValue} onChange={(e) => setDeleteValue(e.target.value)} placeholder="Value to delete" />
            <Button onClick={handleDelete} variant="outline"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
          </div>
        </div>
        <div className="flex justify-center mb-6">
            <Button onClick={handleReset} variant="destructive" className="w-full md:w-auto">
                Reset Tree
            </Button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <div className="w-full h-[500px] bg-muted rounded-lg border relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};
