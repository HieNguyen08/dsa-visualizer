"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Shapes, Plus, Trash2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  id: number;
  isHighlighted: boolean;
  isOnHull: boolean;
  isCurrentlyProcessing: boolean;
}

interface ConvexHullStep {
  description: string;
  points: Point[];
  hull: Point[];
  currentPoint?: Point;
  checkingPoint?: Point;
  leftmost?: Point;
  algorithm: 'graham' | 'jarvis' | 'quickhull';
  comparisons: number;
}

export default function ConvexHullPage() {
  const [points, setPoints] = useState<Point[]>([]);
  const [steps, setSteps] = useState<ConvexHullStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'graham' | 'jarvis' | 'quickhull'>('graham');
  const [inputX, setInputX] = useState('');
  const [inputY, setInputY] = useState('');
  const [nextId, setNextId] = useState(1);

  // Graham Scan Algorithm
  class GrahamScan {
    private steps: ConvexHullStep[] = [];
    private comparisons = 0;

    private orientation(p: Point, q: Point, r: Point): number {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
      if (val === 0) return 0; // Collinear
      return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
    }

    private distance(p1: Point, p2: Point): number {
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    private polarAngle(p0: Point, p: Point): number {
      return Math.atan2(p.y - p0.y, p.x - p0.x);
    }

    convexHull(inputPoints: Point[]): ConvexHullStep[] {
      this.steps = [];
      this.comparisons = 0;
      
      if (inputPoints.length < 3) {
        this.steps.push({
          description: 'Need at least 3 points for convex hull',
          points: [...inputPoints],
          hull: [],
          algorithm: 'graham',
          comparisons: this.comparisons
        });
        return this.steps;
      }

      const points = inputPoints.map(p => ({ ...p, isHighlighted: false, isOnHull: false, isCurrentlyProcessing: false }));

      // Step 1: Find the bottom-most point (or left most if tie)
      let minY = points[0];
      for (let i = 1; i < points.length; i++) {
        this.comparisons++;
        if (points[i].y < minY.y || (points[i].y === minY.y && points[i].x < minY.x)) {
          minY = points[i];
        }
      }
      
      minY.isHighlighted = true;
      this.steps.push({
        description: `Found bottom-most point P${minY.id} at (${minY.x}, ${minY.y})`,
        points: [...points],
        hull: [],
        leftmost: minY,
        algorithm: 'graham',
        comparisons: this.comparisons
      });

      // Step 2: Sort points by polar angle with respect to minY
      const sortedPoints = points.filter(p => p.id !== minY.id);
      sortedPoints.sort((a, b) => {
        this.comparisons++;
        const angleA = this.polarAngle(minY, a);
        const angleB = this.polarAngle(minY, b);
        if (angleA !== angleB) return angleA - angleB;
        return this.distance(minY, a) - this.distance(minY, b);
      });

      const allSortedPoints = [minY, ...sortedPoints];
      this.steps.push({
        description: 'Sorted points by polar angle with respect to bottom-most point',
        points: allSortedPoints,
        hull: [],
        leftmost: minY,
        algorithm: 'graham',
        comparisons: this.comparisons
      });

      // Step 3: Graham Scan
      const stack: Point[] = [];
      
      for (let i = 0; i < allSortedPoints.length; i++) {
        const currentPoint = { ...allSortedPoints[i], isCurrentlyProcessing: true };
        
        // Remove points that create clockwise turn
        while (stack.length > 1) {
          const orientation = this.orientation(stack[stack.length - 2], stack[stack.length - 1], currentPoint);
          this.comparisons++;
          
          if (orientation !== 2) { // Not counter-clockwise
            const removed = stack.pop()!;
            removed.isOnHull = false;
            this.steps.push({
              description: `Removed P${removed.id} - creates clockwise turn`,
              points: allSortedPoints.map(p => p.id === currentPoint.id ? currentPoint : 
                      p.id === removed.id ? removed : p),
              hull: [...stack],
              currentPoint,
              algorithm: 'graham',
              comparisons: this.comparisons
            });
          } else {
            break;
          }
        }
        
        currentPoint.isOnHull = true;
        currentPoint.isCurrentlyProcessing = false;
        stack.push(currentPoint);
        
        this.steps.push({
          description: `Added P${currentPoint.id} to hull`,
          points: allSortedPoints.map(p => p.id === currentPoint.id ? currentPoint : p),
          hull: [...stack],
          currentPoint,
          algorithm: 'graham',
          comparisons: this.comparisons
        });
      }

      // Final result
      this.steps.push({
        description: `Graham Scan complete. Hull has ${stack.length} points with ${this.comparisons} comparisons`,
        points: allSortedPoints,
        hull: stack,
        algorithm: 'graham',
        comparisons: this.comparisons
      });

      return this.steps;
    }
  }

  // Jarvis March (Gift Wrapping) Algorithm
  class JarvisMarch {
    private steps: ConvexHullStep[] = [];
    private comparisons = 0;

    private orientation(p: Point, q: Point, r: Point): number {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
      if (val === 0) return 0;
      return val > 0 ? 1 : 2;
    }

    convexHull(inputPoints: Point[]): ConvexHullStep[] {
      this.steps = [];
      this.comparisons = 0;

      if (inputPoints.length < 3) {
        this.steps.push({
          description: 'Need at least 3 points for convex hull',
          points: [...inputPoints],
          hull: [],
          algorithm: 'jarvis',
          comparisons: this.comparisons
        });
        return this.steps;
      }

      const points = inputPoints.map(p => ({ ...p, isHighlighted: false, isOnHull: false, isCurrentlyProcessing: false }));

      // Find the leftmost point
      let leftmost = points[0];
      for (let i = 1; i < points.length; i++) {
        this.comparisons++;
        if (points[i].x < leftmost.x || (points[i].x === leftmost.x && points[i].y < leftmost.y)) {
          leftmost = points[i];
        }
      }

      leftmost.isHighlighted = true;
      this.steps.push({
        description: `Found leftmost point P${leftmost.id} at (${leftmost.x}, ${leftmost.y})`,
        points: [...points],
        hull: [],
        leftmost,
        algorithm: 'jarvis',
        comparisons: this.comparisons
      });

      const hull: Point[] = [];
      let current = leftmost;

      do {
        current.isOnHull = true;
        current.isCurrentlyProcessing = true;
        hull.push(current);

        let next = points[0];
        for (let i = 1; i < points.length; i++) {
          this.comparisons++;
          
          const orient = this.orientation(current, next, points[i]);
          if (next.id === current.id || orient === 2 || 
              (orient === 0 && this.distance(current, points[i]) > this.distance(current, next))) {
            next = points[i];
          }

          next.isHighlighted = true;
          this.steps.push({
            description: `From P${current.id}, checking P${points[i].id} as potential next hull point`,
            points: [...points],
            hull: [...hull],
            currentPoint: current,
            checkingPoint: points[i],
            algorithm: 'jarvis',
            comparisons: this.comparisons
          });
          
          points.forEach(p => {
            if (p.id !== current.id && p.id !== next.id) {
              p.isHighlighted = false;
            }
          });
        }

        current.isCurrentlyProcessing = false;
        next.isHighlighted = false;
        current = next;

        this.steps.push({
          description: `Selected P${current.id} as next hull point`,
          points: [...points],
          hull: [...hull],
          currentPoint: current,
          algorithm: 'jarvis',
          comparisons: this.comparisons
        });

      } while (current.id !== leftmost.id);

      this.steps.push({
        description: `Jarvis March complete. Hull has ${hull.length} points with ${this.comparisons} comparisons`,
        points: [...points],
        hull: [...hull],
        algorithm: 'jarvis',
        comparisons: this.comparisons
      });

      return this.steps;
    }

    private distance(p1: Point, p2: Point): number {
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }
  }

  // Add point
  const addPoint = () => {
    const x = parseInt(inputX);
    const y = parseInt(inputY);
    
    if (isNaN(x) || isNaN(y)) return;
    
    const newPoint: Point = {
      x,
      y,
      id: nextId,
      isHighlighted: false,
      isOnHull: false,
      isCurrentlyProcessing: false
    };
    
    setPoints(prev => [...prev, newPoint]);
    setNextId(prev => prev + 1);
    setInputX('');
    setInputY('');
  };

  // Clear points
  const clearPoints = () => {
    setPoints([]);
    setSteps([]);
    setCurrentStep(0);
    setNextId(1);
  };

  // Generate random points
  const generateRandomPoints = () => {
    const randomPoints: Point[] = [];
    for (let i = 0; i < 8; i++) {
      randomPoints.push({
        x: Math.floor(Math.random() * 180) + 10,
        y: Math.floor(Math.random() * 180) + 10,
        id: i + 1,
        isHighlighted: false,
        isOnHull: false,
        isCurrentlyProcessing: false
      });
    }
    setPoints(randomPoints);
    setNextId(9);
  };

  // Run algorithm
  const runAlgorithm = () => {
    if (points.length < 3) return;
    
    let algorithmSteps: ConvexHullStep[] = [];
    
    if (selectedAlgorithm === 'graham') {
      const grahamScan = new GrahamScan();
      algorithmSteps = grahamScan.convexHull(points);
    } else if (selectedAlgorithm === 'jarvis') {
      const jarvisMarch = new JarvisMarch();
      algorithmSteps = jarvisMarch.convexHull(points);
    }
    
    setSteps(algorithmSteps);
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

  const currentStepData = steps[currentStep];

  // Render convex hull visualization
  const renderConvexHull = () => {
    const svgSize = 400;
    const margin = 20;
    const scale = (svgSize - 2 * margin) / 200;

    const pointsToRender = currentStepData?.points || points;
    const hullPoints = currentStepData?.hull || [];

    return (
      <div className="flex justify-center">
        <svg width={svgSize} height={svgSize} className="border border-gray-300 bg-white">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Hull polygon */}
          {hullPoints.length > 2 && (
            <polygon
              points={hullPoints.map(p => `${p.x * scale + margin},${(200 - p.y) * scale + margin}`).join(' ')}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />
          )}

          {/* Hull edges */}
          {hullPoints.length > 1 && hullPoints.map((point, index) => {
            const nextPoint = hullPoints[(index + 1) % hullPoints.length];
            return (
              <line
                key={`edge-${index}`}
                x1={point.x * scale + margin}
                y1={(200 - point.y) * scale + margin}
                x2={nextPoint.x * scale + margin}
                y2={(200 - nextPoint.y) * scale + margin}
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
            );
          })}

          {/* Points */}
          {pointsToRender.map(point => (
            <g key={point.id}>
              <circle
                cx={point.x * scale + margin}
                cy={(200 - point.y) * scale + margin}
                r={point.isCurrentlyProcessing ? 8 : point.isHighlighted ? 6 : point.isOnHull ? 5 : 4}
                fill={
                  point.isCurrentlyProcessing ? '#ef4444' :
                  point.isHighlighted ? '#f59e0b' :
                  point.isOnHull ? '#10b981' : '#6b7280'
                }
                stroke={point.isOnHull ? '#065f46' : '#374151'}
                strokeWidth="2"
              />
              <text
                x={point.x * scale + margin}
                y={(200 - point.y) * scale + margin - 12}
                textAnchor="middle"
                className="text-xs font-bold"
                fill="#374151"
              >
                P{point.id}
              </text>
            </g>
          ))}

          {/* Current checking line */}
          {currentStepData?.currentPoint && currentStepData?.checkingPoint && (
            <line
              x1={currentStepData.currentPoint.x * scale + margin}
              y1={(200 - currentStepData.currentPoint.y) * scale + margin}
              x2={currentStepData.checkingPoint.x * scale + margin}
              y2={(200 - currentStepData.checkingPoint.y) * scale + margin}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shapes className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Convex Hull Algorithms</h1>
        </div>
        <p className="text-gray-600">
          Visualize convex hull algorithms including Graham Scan and Jarvis March (Gift Wrapping).
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
                <label className="text-sm font-medium mb-2 block">Algorithm</label>
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value as 'graham' | 'jarvis' | 'quickhull')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="graham">Graham Scan</option>
                  <option value="jarvis">Jarvis March</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Point</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={inputX}
                      onChange={(e) => setInputX(e.target.value)}
                      placeholder="X (0-200)"
                      min="0"
                      max="200"
                    />
                    <Input
                      type="number"
                      value={inputY}
                      onChange={(e) => setInputY(e.target.value)}
                      placeholder="Y (0-200)"
                      min="0"
                      max="200"
                    />
                  </div>
                  <Button onClick={addPoint} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Point
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateRandomPoints} size="sm" variant="outline">
                  Random
                </Button>
                <Button onClick={clearPoints} size="sm" variant="outline">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={runAlgorithm} disabled={points.length < 3} className="w-full">
                Run {selectedAlgorithm === 'graham' ? 'Graham Scan' : 'Jarvis March'}
              </Button>

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
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Points:</span>
                  <span className="font-mono">{points.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hull Points:</span>
                  <span className="font-mono">{currentStepData?.hull.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Algorithm:</span>
                  <span className="font-mono capitalize">{selectedAlgorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comparisons:</span>
                  <span className="font-mono">{currentStepData?.comparisons || 0}</span>
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
              <CardTitle>Convex Hull Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Add points and run an algorithm to visualize convex hull construction'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Convex Hull Visualization */}
                {renderConvexHull()}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Currently Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span>Highlighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>On Hull</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span>Regular Point</span>
                  </div>
                </div>

                {/* Point List */}
                {points.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Points ({points.length})</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      {points.map(point => (
                        <div key={point.id} className="text-center p-2 bg-gray-50 rounded">
                          P{point.id}: ({point.x}, {point.y})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Algorithm Information */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Convex Hull Algorithms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>The convex hull of a set of points is the smallest convex polygon that contains all the points. It&apos;s like stretching a rubber band around the outermost points.</p>
              
              <h3>Graham Scan Algorithm</h3>
              <ul>
                <li><strong>Step 1:</strong> Find the bottom-most point (or leftmost if tie)</li>
                <li><strong>Step 2:</strong> Sort points by polar angle with respect to the bottom-most point</li>
                <li><strong>Step 3:</strong> Scan the sorted points and maintain a stack, removing points that create clockwise turns</li>
              </ul>
              
              <h3>Jarvis March (Gift Wrapping)</h3>
              <ul>
                <li><strong>Step 1:</strong> Start with the leftmost point</li>
                <li><strong>Step 2:</strong> For each point on the hull, find the most counterclockwise point</li>
                <li><strong>Step 3:</strong> Continue until returning to the starting point</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Graham Scan:</strong> O(n log n) due to sorting</li>
                <li><strong>Jarvis March:</strong> O(nh) where h is the number of hull points</li>
              </ul>

              <h3>Space Complexity</h3>
              <ul>
                <li><strong>Graham Scan:</strong> O(n) for the stack</li>
                <li><strong>Jarvis March:</strong> O(1) auxiliary space</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Computer graphics and rendering</li>
                <li>Image processing</li>
                <li>Geographic information systems (GIS)</li>
                <li>Pattern recognition</li>
                <li>Collision detection in games</li>
                <li>Optimization problems</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
