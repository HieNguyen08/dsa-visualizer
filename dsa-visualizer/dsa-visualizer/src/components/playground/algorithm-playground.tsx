"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Brain, Code2, Zap, Trophy, Target, BookOpen } from 'lucide-react';

// Temporary Badge component
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  hints: string[];
  solution: string;
  testCases: Array<{ input: string; output: string; }>;
}

const challenges: Challenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum Problem',
    difficulty: 'Easy',
    description: 'Given an array of integers and a target, return indices of two numbers that add up to target.',
    hints: [
      'Try using a hash map to store complements',
      'Think about time vs space trade-off',
      'One pass solution is possible'
    ],
    solution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    testCases: [
      { input: '[2,7,11,15], target=9', output: '[0,1]' },
      { input: '[3,2,4], target=6', output: '[1,2]' }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search Implementation',
    difficulty: 'Medium',
    description: 'Implement binary search algorithm to find target in sorted array.',
    hints: [
      'Remember the array is sorted',
      'Compare middle element with target',
      'Adjust search boundaries accordingly'
    ],
    solution: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    testCases: [
      { input: '[1,3,5,7,9], target=5', output: '2' },
      { input: '[1,3,5,7,9], target=2', output: '-1' }
    ]
  }
];

const AlgorithmPlayground = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (selectedChallenge) {
      setUserCode(`// ${selectedChallenge.title}\n// ${selectedChallenge.description}\n\nfunction solution() {\n    // Your code here\n    \n}`);
    }
  }, [selectedChallenge]);

  const runCode = () => {
    if (!selectedChallenge) return;
    
    // Simulate code execution and provide feedback
    if (userCode.toLowerCase().includes('map') || userCode.toLowerCase().includes('hash')) {
      setFeedback('✅ Great! You\'re using an efficient approach with hash map.');
      setScore(prev => prev + 10);
    } else if (userCode.includes('for') && userCode.includes('for')) {
      setFeedback('⚠️ Your solution works but has O(n²) complexity. Try using a hash map for O(n).');
    } else {
      setFeedback('❌ Try again! Check the hints if you need help.');
    }
  };

  const getNextHint = () => {
    if (!selectedChallenge) return;
    if (currentHint < selectedChallenge.hints.length - 1) {
      setCurrentHint(prev => prev + 1);
    }
    setShowHints(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Algorithm Playground
            <Badge className="ml-auto bg-yellow-100 text-yellow-800">
              <Trophy className="w-4 h-4 mr-1" />
              Score: {score}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Challenge Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedChallenge?.id === challenge.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedChallenge(challenge)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{challenge.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Assistant */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={getNextHint} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={!selectedChallenge}
                  >
                    Get Hint
                  </Button>
                  
                  {showHints && selectedChallenge && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 {selectedChallenge.hints[currentHint]}
                      </p>
                    </div>
                  )}
                  
                  {feedback && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2">
              {selectedChallenge ? (
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="test" className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Test Cases
                    </TabsTrigger>
                    <TabsTrigger value="solution" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Solution
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="mt-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{selectedChallenge.title}</CardTitle>
                          <Button onClick={runCode} className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Run Code
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{selectedChallenge.description}</p>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                          className="min-h-[400px] font-mono text-sm"
                          placeholder="Write your solution here..."
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="test" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Test Cases</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedChallenge.testCases.map((testCase, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Input:</p>
                                  <p className="text-sm font-mono bg-white p-2 rounded border">
                                    {testCase.input}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Expected Output:</p>
                                  <p className="text-sm font-mono bg-white p-2 rounded border">
                                    {testCase.output}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="solution" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Solution Explanation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                            {selectedChallenge.solution}
                          </pre>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">Algorithm Explanation:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {selectedChallenge.hints.map((hint, index) => (
                              <li key={index}>• {hint}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Code2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Select a challenge to start coding!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlgorithmPlayground;
