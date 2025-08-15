"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Hash, Plus, Minus, RotateCcw } from 'lucide-react';

interface Server {
  id: string;
  name: string;
  angle: number;
  color: string;
}

interface VirtualNode {
  serverId: string;
  nodeId: string;
  angle: number;
}

interface Key {
  id: string;
  value: string;
  angle: number;
  assignedServer: string;
}

interface ConsistentHashingStep {
  description: string;
  servers: Server[];
  virtualNodes: VirtualNode[];
  keys: Key[];
  highlightedElements: string[];
  stage: 'setup' | 'add-server' | 'remove-server' | 'add-key' | 'remove-key';
}

export default function ConsistentHashingPage() {
  const [servers, setServers] = useState<Server[]>([
    { id: 'server1', name: 'Server A', angle: 90, color: '#3B82F6' },
    { id: 'server2', name: 'Server B', angle: 210, color: '#EF4444' },
    { id: 'server3', name: 'Server C', angle: 330, color: '#10B981' }
  ]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [newServerName, setNewServerName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [virtualNodesPerServer, setVirtualNodesPerServer] = useState([3]);
  const [steps, setSteps] = useState<ConsistentHashingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);

  // Hash function (simple hash for demonstration)
  const hash = (input: string): number => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 360; // Map to circle degrees
  };

  // Generate virtual nodes for servers
  const generateVirtualNodes = (serverList: Server[]): VirtualNode[] => {
    const virtualNodes: VirtualNode[] = [];
    
    serverList.forEach(server => {
      for (let i = 0; i < virtualNodesPerServer[0]; i++) {
        const nodeId = `${server.id}-vn${i}`;
        const angle = hash(`${server.name}-${i}`);
        virtualNodes.push({
          serverId: server.id,
          nodeId,
          angle
        });
      }
    });

    return virtualNodes.sort((a, b) => a.angle - b.angle);
  };

  // Find the next server in the ring for a given angle
  const findNextServer = (angle: number, virtualNodes: VirtualNode[]): string => {
    if (virtualNodes.length === 0) return '';
    
    // Find the first virtual node with angle >= key angle
    let nextNode = virtualNodes.find(node => node.angle >= angle);
    
    // If no node found, wrap around to the first node
    if (!nextNode) {
      nextNode = virtualNodes[0];
    }
    
    return nextNode.serverId;
  };

  // Assign keys to servers
  const assignKeys = (keyList: Key[], virtualNodes: VirtualNode[]): Key[] => {
    return keyList.map(key => ({
      ...key,
      assignedServer: findNextServer(key.angle, virtualNodes)
    }));
  };

  // Add server
  const addServer = () => {
    if (!newServerName.trim()) return;
    
    const colors = ['#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#84CC16'];
    const newServer: Server = {
      id: `server${Date.now()}`,
      name: newServerName,
      angle: hash(newServerName),
      color: colors[servers.length % colors.length]
    };

    const newServers = [...servers, newServer];
    const virtualNodes = generateVirtualNodes(newServers);
    const updatedKeys = assignKeys(keys, virtualNodes);

    setServers(newServers);
    setKeys(updatedKeys);

    // Add step
    const step: ConsistentHashingStep = {
      description: `Added server "${newServerName}" to the ring`,
      servers: newServers,
      virtualNodes,
      keys: updatedKeys,
      highlightedElements: [newServer.id],
      stage: 'add-server'
    };
    
    setSteps(prev => [...prev, step]);
    setCurrentStep(prev => prev + 1);
    setNewServerName('');
  };

  // Remove server
  const removeServer = (serverId: string) => {
    const newServers = servers.filter(s => s.id !== serverId);
    const virtualNodes = generateVirtualNodes(newServers);
    const updatedKeys = assignKeys(keys, virtualNodes);

    setServers(newServers);
    setKeys(updatedKeys);

    // Add step
    const step: ConsistentHashingStep = {
      description: `Removed server from the ring`,
      servers: newServers,
      virtualNodes,
      keys: updatedKeys,
      highlightedElements: [],
      stage: 'remove-server'
    };
    
    setSteps(prev => [...prev, step]);
    setCurrentStep(prev => prev + 1);
  };

  // Add key
  const addKey = () => {
    if (!newKeyValue.trim()) return;
    
    const newKey: Key = {
      id: `key${Date.now()}`,
      value: newKeyValue,
      angle: hash(newKeyValue),
      assignedServer: ''
    };

    const virtualNodes = generateVirtualNodes(servers);
    const updatedKeys = assignKeys([...keys, newKey], virtualNodes);

    setKeys(updatedKeys);

    // Add step
    const step: ConsistentHashingStep = {
      description: `Added key "${newKeyValue}" to the ring`,
      servers,
      virtualNodes,
      keys: updatedKeys,
      highlightedElements: [newKey.id],
      stage: 'add-key'
    };
    
    setSteps(prev => [...prev, step]);
    setCurrentStep(prev => prev + 1);
    setNewKeyValue('');
  };

  // Remove key
  const removeKey = (keyId: string) => {
    const updatedKeys = keys.filter(k => k.id !== keyId);
    setKeys(updatedKeys);

    const virtualNodes = generateVirtualNodes(servers);
    
    // Add step
    const step: ConsistentHashingStep = {
      description: `Removed key from the ring`,
      servers,
      virtualNodes,
      keys: updatedKeys,
      highlightedElements: [],
      stage: 'remove-key'
    };
    
    setSteps(prev => [...prev, step]);
    setCurrentStep(prev => prev + 1);
  };

  // Initialize demo
  const initializeDemo = () => {
    const demoKeys = [
      { id: 'key1', value: 'user123', angle: hash('user123'), assignedServer: '' },
      { id: 'key2', value: 'data456', angle: hash('data456'), assignedServer: '' },
      { id: 'key3', value: 'file789', angle: hash('file789'), assignedServer: '' },
      { id: 'key4', value: 'cache001', angle: hash('cache001'), assignedServer: '' }
    ];

    const virtualNodes = generateVirtualNodes(servers);
    const assignedKeys = assignKeys(demoKeys, virtualNodes);
    
    setKeys(assignedKeys);
    
    const step: ConsistentHashingStep = {
      description: 'Initialized consistent hashing ring with servers and keys',
      servers,
      virtualNodes,
      keys: assignedKeys,
      highlightedElements: [],
      stage: 'setup'
    };
    
    setSteps([step]);
    setCurrentStep(0);
  };

  // Reset demo
  const resetDemo = () => {
    setKeys([]);
    setSteps([]);
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

  // Initialize on mount
  useEffect(() => {
    const demoKeys = [
      { id: 'key1', value: 'user123', angle: hash('user123'), assignedServer: '' },
      { id: 'key2', value: 'data456', angle: hash('data456'), assignedServer: '' },
      { id: 'key3', value: 'file789', angle: hash('file789'), assignedServer: '' },
      { id: 'key4', value: 'cache001', angle: hash('cache001'), assignedServer: '' }
    ];

    const virtualNodes = generateVirtualNodes(servers);
    const assignedKeys = assignKeys(demoKeys, virtualNodes);
    
    setKeys(assignedKeys);
    
    const step: ConsistentHashingStep = {
      description: 'Initialized consistent hashing ring with servers and keys',
      servers,
      virtualNodes,
      keys: assignedKeys,
      highlightedElements: [],
      stage: 'setup'
    };
    
    setSteps([step]);
    setCurrentStep(0);
  }, []);

  const currentStepData = steps[currentStep] || {
    servers,
    virtualNodes: generateVirtualNodes(servers),
    keys,
    highlightedElements: [],
    stage: 'setup' as const,
    description: 'Consistent hashing ring visualization'
  };

  // Render the hash ring
  const renderHashRing = () => {
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    const { servers: stepServers, virtualNodes, keys: stepKeys, highlightedElements } = currentStepData;

    // Convert angle to coordinates
    const angleToCoords = (angle: number, r: number = radius) => {
      const radian = (angle - 90) * (Math.PI / 180); // Adjust for top being 0 degrees
      return {
        x: centerX + r * Math.cos(radian),
        y: centerY + r * Math.sin(radian)
      };
    };

    return (
      <div className="flex justify-center">
        <svg width="400" height="400" className="border border-gray-200 rounded-lg bg-white">
          {/* Main circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
          />

          {/* Degree markers */}
          {[0, 90, 180, 270].map(angle => {
            const coords = angleToCoords(angle, radius + 20);
            return (
              <text
                key={angle}
                x={coords.x}
                y={coords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm text-gray-400"
              >
                {angle}°
              </text>
            );
          })}

          {/* Virtual nodes */}
          {virtualNodes.map(vNode => {
            const server = stepServers.find(s => s.id === vNode.serverId);
            const coords = angleToCoords(vNode.angle);
            
            return (
              <g key={vNode.nodeId}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="6"
                  fill={server?.color || '#6B7280'}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={coords.x}
                  y={coords.y - 15}
                  textAnchor="middle"
                  className="text-xs text-gray-600"
                >
                  VN
                </text>
              </g>
            );
          })}

          {/* Servers (labels) */}
          {stepServers.map(server => {
            const coords = angleToCoords(server.angle, radius - 30);
            const isHighlighted = highlightedElements.includes(server.id);
            
            return (
              <g key={server.id}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="12"
                  fill={server.color}
                  stroke={isHighlighted ? '#FCD34D' : 'white'}
                  strokeWidth={isHighlighted ? '3' : '2'}
                  className={isHighlighted ? 'animate-pulse' : ''}
                />
                <text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold text-white"
                >
                  {server.name.charAt(server.name.length - 1)}
                </text>
              </g>
            );
          })}

          {/* Keys */}
          {stepKeys.map(key => {
            const coords = angleToCoords(key.angle, radius + 40);
            const assignedServer = stepServers.find(s => s.id === key.assignedServer);
            const isHighlighted = highlightedElements.includes(key.id);
            
            return (
              <g key={key.id}>
                <rect
                  x={coords.x - 8}
                  y={coords.y - 8}
                  width="16"
                  height="16"
                  fill={assignedServer?.color || '#6B7280'}
                  stroke={isHighlighted ? '#FCD34D' : 'white'}
                  strokeWidth={isHighlighted ? '2' : '1'}
                  rx="2"
                  className={isHighlighted ? 'animate-pulse' : ''}
                />
                <text
                  x={coords.x + 15}
                  y={coords.y}
                  dominantBaseline="middle"
                  className="text-xs text-gray-700"
                >
                  {key.value}
                </text>
                
                {/* Line to assigned server */}
                {assignedServer && (
                  <line
                    x1={coords.x}
                    y1={coords.y}
                    x2={angleToCoords(assignedServer.angle, radius - 30).x}
                    y2={angleToCoords(assignedServer.angle, radius - 30).y}
                    stroke={assignedServer.color}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}

          {/* Center label */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold text-gray-600"
          >
            Hash Ring
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Hash className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Consistent Hashing</h1>
        </div>
        <p className="text-gray-600">
          Visualize consistent hashing algorithm for distributed systems and load balancing.
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
                <label className="text-sm font-medium mb-2 block">Virtual Nodes per Server: {virtualNodesPerServer[0]}</label>
                <Slider
                  value={virtualNodesPerServer}
                  onValueChange={setVirtualNodesPerServer}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Server</label>
                <div className="space-y-2">
                  <Input
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    placeholder="Server name..."
                  />
                  <Button onClick={addServer} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Server
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Key</label>
                <div className="space-y-2">
                  <Input
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder="Key value..."
                  />
                  <Button onClick={addKey} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Key
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
              </div>

              <div className="flex gap-2">
                <Button onClick={initializeDemo} size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button onClick={resetDemo} size="sm" variant="outline">
                  Clear
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
                  <span>Servers:</span>
                  <span className="font-mono">{currentStepData.servers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Virtual Nodes:</span>
                  <span className="font-mono">{currentStepData.virtualNodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Keys:</span>
                  <span className="font-mono">{currentStepData.keys.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Stage:</span>
                  <span className="font-mono capitalize">{currentStepData.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Current Servers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentStepData.servers.map(server => (
                  <div key={server.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: server.color }}
                      ></div>
                      <span className="text-sm font-medium">{server.name}</span>
                    </div>
                    <Button
                      onClick={() => removeServer(server.id)}
                      size="sm"
                      variant="outline"
                      disabled={currentStepData.servers.length <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Consistent Hashing Ring</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderHashRing()}

                {/* Key Assignments */}
                {currentStepData.keys.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Key Assignments</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-2 text-sm">Key</th>
                            <th className="border border-gray-300 p-2 text-sm">Hash (Angle)</th>
                            <th className="border border-gray-300 p-2 text-sm">Assigned Server</th>
                            <th className="border border-gray-300 p-2 text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStepData.keys.map(key => {
                            const assignedServer = currentStepData.servers.find(s => s.id === key.assignedServer);
                            
                            return (
                              <tr key={key.id}>
                                <td className="border border-gray-300 p-2 font-mono text-sm">{key.value}</td>
                                <td className="border border-gray-300 p-2 text-center">{key.angle}°</td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <span 
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-white text-sm"
                                    style={{ backgroundColor: assignedServer?.color || '#6B7280' }}
                                  >
                                    {assignedServer?.name || 'Unknown'}
                                  </span>
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <Button
                                    onClick={() => removeKey(key.id)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>Server</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span>Virtual Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span>Key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 border-t-2 border-dashed border-gray-500"></div>
                    <span>Assignment</span>
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
            <CardTitle>Consistent Hashing Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Consistent hashing is a distributed hashing scheme that minimizes the number of keys that need to be remapped when nodes are added or removed from a hash table.</p>
              
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>Hash Ring:</strong> A circular hash space where both servers and keys are mapped</li>
                <li><strong>Virtual Nodes:</strong> Multiple hash positions per physical server for better load distribution</li>
                <li><strong>Clockwise Assignment:</strong> Keys are assigned to the next server in clockwise direction</li>
                <li><strong>Minimal Redistribution:</strong> Only affected keys need to be moved when topology changes</li>
              </ul>

              <h3>Algorithm Steps</h3>
              <ol>
                <li><strong>Hash Servers:</strong> Map each server to one or more positions on the hash ring</li>
                <li><strong>Create Virtual Nodes:</strong> Generate multiple hash positions per server</li>
                <li><strong>Hash Keys:</strong> Map each key to a position on the hash ring</li>
                <li><strong>Assign Keys:</strong> Each key goes to the next server clockwise on the ring</li>
                <li><strong>Handle Changes:</strong> Add/remove servers with minimal key redistribution</li>
              </ol>

              <h3>Virtual Nodes Benefits</h3>
              <ul>
                <li><strong>Better Load Distribution:</strong> More uniform key distribution across servers</li>
                <li><strong>Reduced Hot Spots:</strong> Prevents clustering of keys on single server</li>
                <li><strong>Fault Tolerance:</strong> Keys from failed server distributed across multiple survivors</li>
                <li><strong>Gradual Migration:</strong> Smooth load redistribution when scaling</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Key Lookup:</strong> O(log N) where N is number of virtual nodes</li>
                <li><strong>Add Server:</strong> O(K/N) keys need to be redistributed on average</li>
                <li><strong>Remove Server:</strong> O(K/N) keys need to be redistributed on average</li>
                <li><strong>Hash Computation:</strong> O(1) for each key or server</li>
              </ul>

              <h3>Properties</h3>
              <ul>
                <li><strong>Balance:</strong> Load is distributed roughly evenly across servers</li>
                <li><strong>Monotonicity:</strong> When servers are added, keys only move to new servers</li>
                <li><strong>Spread:</strong> Small set of servers handle each key</li>
                <li><strong>Load:</strong> Each server handles roughly the same number of keys</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Distributed hash tables (DHTs)</li>
                <li>Content delivery networks (CDNs)</li>
                <li>Load balancing in web services</li>
                <li>Database sharding</li>
                <li>Distributed caching systems (Redis, Memcached)</li>
                <li>Peer-to-peer networks</li>
                <li>Distributed storage systems</li>
              </ul>

              <h3>Real-world Usage</h3>
              <ul>
                <li><strong>Amazon DynamoDB:</strong> Partitioning data across nodes</li>
                <li><strong>Apache Cassandra:</strong> Data distribution and replication</li>
                <li><strong>Memcached:</strong> Distributing cached objects</li>
                <li><strong>Chord DHT:</strong> Peer-to-peer file sharing</li>
                <li><strong>Akamai CDN:</strong> Content distribution</li>
              </ul>

              <h3>Advantages</h3>
              <ul>
                <li>Minimal data movement when scaling</li>
                <li>No central coordination required</li>
                <li>Good load distribution with virtual nodes</li>
                <li>Fault tolerant and self-organizing</li>
                <li>Scales to large number of nodes</li>
              </ul>

              <h3>Trade-offs</h3>
              <ul>
                <li><strong>Complexity:</strong> More complex than simple modular hashing</li>
                <li><strong>Memory Overhead:</strong> Requires storing hash ring metadata</li>
                <li><strong>Replication:</strong> May need additional mechanisms for data replication</li>
                <li><strong>Hot Spots:</strong> Can still occur without sufficient virtual nodes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
