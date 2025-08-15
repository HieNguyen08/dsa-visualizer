"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface ManacherStep {
  description: string;
  processedString: string;
  palindromeArray: number[];
  currentIndex: number;
  center: number;
  rightBound: number;
  mirrorIndex: number;
  foundPalindromes: { start: number; end: number; length: number; text: string }[];
  highlightedIndices: number[];
  stage: 'preprocess' | 'process' | 'expand' | 'complete';
}

export default function ManacherPage() {
  const [inputText, setInputText] = useState('babad');
  const [steps, setSteps] = useState<ManacherStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);

  // Manacher Algorithm implementation
  class ManacherAlgorithm {
    private originalText: string;
    private processedText: string;
    private palindromeArray: number[];
    private steps: ManacherStep[] = [];

    constructor(text: string) {
      this.originalText = text;
      this.processedText = this.preprocess(text);
      this.palindromeArray = new Array(this.processedText.length).fill(0);
      this.runManacher();
    }

    private preprocess(text: string): string {
      // Insert '#' between characters to handle even-length palindromes
      const processed = '#' + text.split('').join('#') + '#';
      
      this.addStep(
        `Preprocessed string: "${text}" → "${processed}"`,
        processed,
        new Array(processed.length).fill(0),
        -1, -1, -1, -1,
        [],
        [],
        'preprocess'
      );

      return processed;
    }

    private runManacher() {
      const n = this.processedText.length;
      let center = 0;
      let rightBound = 0;

      for (let i = 0; i < n; i++) {
        const mirrorIndex = 2 * center - i;

        // If i is within the right boundary, use previously computed values
        if (i < rightBound) {
          this.palindromeArray[i] = Math.min(rightBound - i, this.palindromeArray[mirrorIndex]);
          
          this.addStep(
            `Using mirror property: P[${i}] = min(${rightBound} - ${i}, P[${mirrorIndex}]) = ${this.palindromeArray[i]}`,
            this.processedText,
            [...this.palindromeArray],
            i, center, rightBound, mirrorIndex,
            this.extractPalindromes(),
            [i, mirrorIndex, center],
            'process'
          );
        }

        // Try to expand palindrome centered at i
        const oldRadius = this.palindromeArray[i];
        while (
          i + this.palindromeArray[i] + 1 < n &&
          i - this.palindromeArray[i] - 1 >= 0 &&
          this.processedText[i + this.palindromeArray[i] + 1] === 
          this.processedText[i - this.palindromeArray[i] - 1]
        ) {
          this.palindromeArray[i]++;
        }

        if (this.palindromeArray[i] > oldRadius) {
          this.addStep(
            `Expanded palindrome at index ${i} from radius ${oldRadius} to ${this.palindromeArray[i]}`,
            this.processedText,
            [...this.palindromeArray],
            i, center, rightBound, mirrorIndex,
            this.extractPalindromes(),
            [i],
            'expand'
          );
        }

        // If palindrome centered at i extends past rightBound, adjust center and rightBound
        if (i + this.palindromeArray[i] > rightBound) {
          center = i;
          rightBound = i + this.palindromeArray[i];

          this.addStep(
            `Updated center to ${center} and right bound to ${rightBound}`,
            this.processedText,
            [...this.palindromeArray],
            i, center, rightBound, mirrorIndex,
            this.extractPalindromes(),
            [center],
            'process'
          );
        }
      }

      this.addStep(
        `Algorithm complete! Found ${this.extractPalindromes().length} palindromic substrings`,
        this.processedText,
        [...this.palindromeArray],
        -1, center, rightBound, -1,
        this.extractPalindromes(),
        [],
        'complete'
      );
    }

    private extractPalindromes(): { start: number; end: number; length: number; text: string }[] {
      const palindromes: { start: number; end: number; length: number; text: string }[] = [];
      
      for (let i = 0; i < this.palindromeArray.length; i++) {
        if (this.palindromeArray[i] > 0) {
          // Convert back to original string coordinates
          const center = Math.floor(i / 2);
          const radius = Math.floor((this.palindromeArray[i] + 1) / 2);
          
          if (radius > 0) {
            const start = center - radius + 1;
            const end = center + radius - 1;
            
            if (start >= 0 && end < this.originalText.length) {
              const text = this.originalText.substring(start, end + 1);
              palindromes.push({ start, end, length: text.length, text });
            }
          }
        }
      }

      // Remove duplicates and sort by length descending
      const uniquePalindromes = palindromes.filter((p, index, arr) => 
        arr.findIndex(other => other.start === p.start && other.end === p.end) === index
      );

      return uniquePalindromes.sort((a, b) => b.length - a.length);
    }

    private addStep(
      description: string,
      processedString: string,
      palindromeArray: number[],
      currentIndex: number,
      center: number,
      rightBound: number,
      mirrorIndex: number,
      foundPalindromes: { start: number; end: number; length: number; text: string }[],
      highlightedIndices: number[],
      stage: 'preprocess' | 'process' | 'expand' | 'complete'
    ) {
      this.steps.push({
        description,
        processedString,
        palindromeArray: [...palindromeArray],
        currentIndex,
        center,
        rightBound,
        mirrorIndex,
        foundPalindromes: [...foundPalindromes],
        highlightedIndices: [...highlightedIndices],
        stage
      });
    }

    getSteps(): ManacherStep[] {
      return this.steps;
    }

    getLongestPalindrome(): string {
      const palindromes = this.extractPalindromes();
      return palindromes.length > 0 ? palindromes[0].text : '';
    }
  }

  // Run Manacher algorithm
  // const runManacher = () => {
  //   if (!inputText.trim()) return;
    
  //   const manacher = new ManacherAlgorithm(inputText);
  //   setSteps(manacher.getSteps());
  //   setCurrentStep(0);
  // };

  // Demo examples
  const runDemo = () => {
    setInputText('babad');
    
    const manacher = new ManacherAlgorithm('babad');
    setSteps(manacher.getSteps());
    setCurrentStep(0);
  };

  // Other examples
  const loadExample = (text: string) => {
    setInputText(text);
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

  // Run on text change
  useEffect(() => {
    if (inputText.trim()) {
      const manacher = new ManacherAlgorithm(inputText);
      setSteps(manacher.getSteps());
      setCurrentStep(0);
    }
  }, [inputText]);

  const currentStepData = steps[currentStep];

  // Render Manacher visualization
  const renderManacher = () => {
    if (!currentStepData) return null;

    const {
      processedString,
      palindromeArray,
      currentIndex,
      center,
      rightBound,
      mirrorIndex,
      foundPalindromes,
      highlightedIndices,
      stage
    } = currentStepData;

    return (
      <div className="space-y-6">
        {/* Original String */}
        <div>
          <h4 className="font-medium mb-2">Original String</h4>
          <div className="flex gap-1 justify-center">
            {inputText.split('').map((char, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">{index}</div>
                <div className="w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center font-bold bg-white">
                  {char}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processed String */}
        <div>
          <h4 className="font-medium mb-2">Preprocessed String (with separators)</h4>
          <div className="flex gap-1 justify-center flex-wrap">
            {processedString.split('').map((char, index) => {
              const isCurrentIndex = index === currentIndex;
              const isCenter = index === center;
              const isMirror = index === mirrorIndex;
              const isHighlighted = highlightedIndices.includes(index);
              const isInBound = center !== -1 && rightBound !== -1 && index <= rightBound && index >= center;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{index}</div>
                  <div className={`w-8 h-8 border-2 rounded flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCurrentIndex ? 'bg-red-300 border-red-600 transform scale-110' :
                    isCenter ? 'bg-blue-300 border-blue-600' :
                    isMirror ? 'bg-purple-300 border-purple-600' :
                    isHighlighted ? 'bg-yellow-300 border-yellow-600' :
                    isInBound ? 'bg-green-100 border-green-400' :
                    char === '#' ? 'bg-gray-100 border-gray-400 text-gray-500' :
                    'bg-white border-gray-400'
                  }`}>
                    {char}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Palindrome Array */}
        <div>
          <h4 className="font-medium mb-2">Palindrome Radius Array P[i]</h4>
          <div className="flex gap-1 justify-center flex-wrap">
            {palindromeArray.map((radius, index) => {
              const isCurrentIndex = index === currentIndex;
              const isCenter = index === center;
              const isMirror = index === mirrorIndex;
              const isHighlighted = highlightedIndices.includes(index);
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">P[{index}]</div>
                  <div className={`w-10 h-10 border-2 rounded flex items-center justify-center text-sm font-bold ${
                    isCurrentIndex ? 'bg-red-200 border-red-500' :
                    isCenter ? 'bg-blue-200 border-blue-500' :
                    isMirror ? 'bg-purple-200 border-purple-500' :
                    isHighlighted ? 'bg-yellow-200 border-yellow-500' :
                    radius > 0 ? 'bg-green-100 border-green-400' :
                    'bg-gray-50 border-gray-300'
                  }`}>
                    {radius}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm State */}
        {stage !== 'preprocess' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-700">Current Index</div>
              <div className="text-xl font-bold text-blue-900">{currentIndex >= 0 ? currentIndex : '-'}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-700">Center</div>
              <div className="text-xl font-bold text-green-900">{center >= 0 ? center : '-'}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-700">Right Bound</div>
              <div className="text-xl font-bold text-purple-900">{rightBound >= 0 ? rightBound : '-'}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="font-medium text-orange-700">Mirror Index</div>
              <div className="text-xl font-bold text-orange-900">{mirrorIndex >= 0 ? mirrorIndex : '-'}</div>
            </div>
          </div>
        )}

        {/* Found Palindromes */}
        {foundPalindromes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Found Palindromes (by length)</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-sm">Palindrome</th>
                    <th className="border border-gray-300 p-2 text-sm">Start</th>
                    <th className="border border-gray-300 p-2 text-sm">End</th>
                    <th className="border border-gray-300 p-2 text-sm">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {foundPalindromes.slice(0, 10).map((palindrome, index) => (
                    <tr key={index} className={index === 0 ? 'bg-green-50' : ''}>
                      <td className="border border-gray-300 p-2 font-mono text-center font-bold">
                        &quot;{palindrome.text}&quot;
                      </td>
                      <td className="border border-gray-300 p-2 text-center">{palindrome.start}</td>
                      <td className="border border-gray-300 p-2 text-center">{palindrome.end}</td>
                      <td className="border border-gray-300 p-2 text-center">{palindrome.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {foundPalindromes.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing top 10 of {foundPalindromes.length} palindromes found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Thuật Toán Manacher</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Thuật Toán Manacher"
              description="Thuật toán Manacher là một thuật toán thời gian tuyến tính để tìm tất cả các chuỗi con palindrome trong một chuỗi."
              timeComplexity={{
                best: "O(n)",
                average: "O(n)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "Tiền xử lý chuỗi với ký tự phân cách",
                "Sử dụng thông tin palindrome đã biết",
                "Tối ưu hóa mở rộng tâm",
                "Duy trì center và rightBound"
              ]}
              applications={[
                "Tìm palindrome dài nhất",
                "Đếm số palindrome trong chuỗi",
                "Pattern matching with palindromes",
                "String processing algorithms"
              ]}
              advantages={[
                "Thời gian tuyến tính O(n)",
                "Tìm tất cả palindrome cùng lúc",
                "Hiệu quả hơn brute force O(n³)",
                "Cài đặt không quá phức tạp"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa thuật toán Manacher - thuật toán thời gian tuyến tính để tìm tất cả các chuỗi con palindrome.
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
                <label className="text-sm font-medium mb-2 block">Input Text</label>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.toLowerCase())}
                  placeholder="Enter text..."
                  maxLength={15}
                />
                <p className="text-xs text-gray-500 mt-1">Max 15 characters</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Examples</label>
                <div className="space-y-1">
                  <Button 
                    onClick={() => loadExample('babad')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start"
                  >
                    &quot;babad&quot;
                  </Button>
                  <Button 
                    onClick={() => loadExample('racecar')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start"
                  >
                    &quot;racecar&quot;
                  </Button>
                  <Button 
                    onClick={() => loadExample('abcdef')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start"
                  >
                    &quot;abcdef&quot;
                  </Button>
                  <Button 
                    onClick={() => loadExample('aaaa')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start"
                  >
                    &quot;aaaa&quot;
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
                  <span>Text Length:</span>
                  <span className="font-mono">{inputText.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processed Length:</span>
                  <span className="font-mono">{currentStepData?.processedString.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Stage:</span>
                  <span className="font-mono capitalize">{currentStepData?.stage || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Palindromes:</span>
                  <span className="font-mono">{currentStepData?.foundPalindromes.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Longest:</span>
                  <span className="font-mono text-xs">
                    {currentStepData?.foundPalindromes[0]?.text || 'None'}
                  </span>
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
              <CardTitle>Manacher Algorithm Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Enter text to find all palindromic substrings'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderManacher()}

                {/* Stage Indicator */}
                {currentStepData && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.stage === 'preprocess' ? 'bg-gray-100 text-gray-800' :
                      currentStepData.stage === 'process' ? 'bg-blue-100 text-blue-800' :
                      currentStepData.stage === 'expand' ? 'bg-orange-100 text-orange-800' :
                      currentStepData.stage === 'complete' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentStepData.stage.toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-300 border border-red-600"></div>
                    <span>Current Index</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-300 border border-blue-600"></div>
                    <span>Center</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-300 border border-purple-600"></div>
                    <span>Mirror</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-400"></div>
                    <span>Within Bounds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-400"></div>
                    <span>Separator</span>
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
            <CardTitle>Manacher Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Manacher&apos;s algorithm finds all palindromic substrings in linear time O(n) by cleverly using previously computed information.</p>
              
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>Preprocessing:</strong> Insert separators (#) to handle even-length palindromes uniformly</li>
                <li><strong>Mirror Property:</strong> Use symmetry of palindromes to avoid redundant comparisons</li>
                <li><strong>Right Boundary:</strong> Track the rightmost boundary of currently known palindromes</li>
                <li><strong>Center:</strong> Center of the palindrome that reaches the rightmost boundary</li>
              </ul>

              <h3>Algorithm Steps</h3>
              <ol>
                <li><strong>Preprocess:</strong> Transform string s to #s#t#r# format</li>
                <li><strong>Initialize:</strong> Set center = 0, rightBound = 0, P[i] = 0 for all i</li>
                <li><strong>For each position i:</strong></li>
                <ul>
                  <li>If i &lt; rightBound, use mirror property: P[i] = min(rightBound - i, P[mirror])</li>
                  <li>Try to expand palindrome centered at i</li>
                  <li>If expanded beyond rightBound, update center and rightBound</li>
                </ul>
                <li><strong>Extract:</strong> Convert palindrome radii back to original string coordinates</li>
              </ol>

              <h3>Mirror Property</h3>
              <p>If we&apos;re processing index i within a known palindrome:</p>
              <ul>
                <li>Mirror index = 2 * center - i</li>
                <li>P[i] ≥ min(rightBound - i, P[mirror])</li>
                <li>This gives us a starting point for expansion, avoiding redundant checks</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Total Time:</strong> O(n) - each character is visited at most twice</li>
                <li><strong>Preprocessing:</strong> O(n) to insert separators</li>
                <li><strong>Main Loop:</strong> O(n) amortized - rightBound only increases</li>
                <li><strong>Extraction:</strong> O(n) to convert back to original coordinates</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(n) for the palindrome radius array and preprocessed string</p>

              <h3>Why Linear Time?</h3>
              <p>The algorithm is linear because:</p>
              <ul>
                <li>Each character can only contribute to expanding rightBound once</li>
                <li>Mirror property eliminates redundant character comparisons</li>
                <li>Total expansions across all centers ≤ n</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Finding longest palindromic substring</li>
                <li>Counting all palindromic substrings</li>
                <li>Palindrome-related string problems</li>
                <li>DNA sequence analysis (palindromic patterns)</li>
                <li>Text compression algorithms</li>
              </ul>

              <h3>Advantages over Naive Approach</h3>
              <ul>
                <li><strong>Time:</strong> O(n) vs O(n³) naive approach</li>
                <li><strong>Efficiency:</strong> Uses previously computed information</li>
                <li><strong>Elegance:</strong> Single pass with clever symmetry exploitation</li>
                <li><strong>Practical:</strong> Works well for large strings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
