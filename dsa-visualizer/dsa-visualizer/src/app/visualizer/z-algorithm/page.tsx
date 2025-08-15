"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Zap, RotateCcw } from 'lucide-react';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

interface ZAlgorithmStep {
  description: string;
  text: string;
  pattern: string;
  combinedString: string;
  zArray: number[];
  currentIndex: number;
  left: number;
  right: number;
  matches: number[];
  highlightedIndices: number[];
  stage: 'combine' | 'process' | 'match' | 'complete';
}

export default function ZAlgorithmPage() {
  const [text, setText] = useState('abcabcabcabc');
  const [pattern, setPattern] = useState('abc');
  const [steps, setSteps] = useState<ZAlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);

  // Z Algorithm implementation
  class ZAlgorithm {
    private text: string;
    private pattern: string;
    private combinedString: string;
    private zArray: number[];
    private steps: ZAlgorithmStep[] = [];

    constructor(text: string, pattern: string) {
      this.text = text;
      this.pattern = pattern;
      this.combinedString = pattern + '$' + text; // Combine pattern and text with separator
      this.zArray = new Array(this.combinedString.length).fill(0);
      this.runZAlgorithm();
    }

    private runZAlgorithm() {
      const s = this.combinedString;
      const n = s.length;
      let left = 0;
      let right = 0;

      this.addStep(
        `Combined string: "${this.pattern}" + "$" + "${this.text}" = "${s}"`,
        -1, left, right, [], [], 'combine'
      );

      for (let i = 1; i < n; i++) {
        this.addStep(
          `Processing index ${i}: character '${s[i]}'`,
          i, left, right, [], [i], 'process'
        );

        // If i is within the current Z-box, use previously computed values
        if (i <= right) {
          const mirror = i - left;
          this.zArray[i] = Math.min(right - i + 1, this.zArray[mirror]);
          
          this.addStep(
            `Index ${i} is within Z-box [${left}, ${right}]. Mirror index: ${mirror}. Initial Z[${i}] = min(${right - i + 1}, Z[${mirror}]) = ${this.zArray[i]}`,
            i, left, right, [], [i, mirror, left], 'process'
          );
        }

        // Try to extend the match
        const oldValue = this.zArray[i];
        while (i + this.zArray[i] < n && s[this.zArray[i]] === s[i + this.zArray[i]]) {
          this.zArray[i]++;
        }

        if (this.zArray[i] > oldValue) {
          this.addStep(
            `Extended Z[${i}] from ${oldValue} to ${this.zArray[i]} by matching characters`,
            i, left, right, [], [i], 'process'
          );
        }

        // If the match extends past the current right boundary, update the Z-box
        if (i + this.zArray[i] - 1 > right) {
          left = i;
          right = i + this.zArray[i] - 1;
          
          this.addStep(
            `Updated Z-box: left = ${left}, right = ${right}`,
            i, left, right, [], [left, right], 'process'
          );
        }
      }

      // Find pattern matches
      const matches = this.findMatches();
      this.addStep(
        `Pattern matching complete. Found ${matches.length} occurrence(s)`,
        -1, left, right, matches, [], 'complete'
      );
    }

    private findMatches(): number[] {
      const matches: number[] = [];
      const patternLength = this.pattern.length;
      
      // Pattern matches occur where Z[i] equals pattern length
      for (let i = patternLength + 1; i < this.zArray.length; i++) {
        if (this.zArray[i] === patternLength) {
          // Convert back to original text position
          const textPosition = i - patternLength - 1;
          matches.push(textPosition);
        }
      }

      return matches;
    }

    private addStep(
      description: string,
      currentIndex: number,
      left: number,
      right: number,
      matches: number[],
      highlightedIndices: number[],
      stage: 'combine' | 'process' | 'match' | 'complete'
    ) {
      this.steps.push({
        description,
        text: this.text,
        pattern: this.pattern,
        combinedString: this.combinedString,
        zArray: [...this.zArray],
        currentIndex,
        left,
        right,
        matches: [...matches],
        highlightedIndices: [...highlightedIndices],
        stage
      });
    }

    getSteps(): ZAlgorithmStep[] {
      return this.steps;
    }
  }

  // Run Z Algorithm
  // const runZAlgorithm = () => {
  //   if (!text.trim() || !pattern.trim()) return;
    
  //   const zAlgo = new ZAlgorithm(text, pattern);
  //   setSteps(zAlgo.getSteps());
  //   setCurrentStep(0);
  // };

  // Demo examples
  const runDemo = () => {
    setText('abcabcabcabc');
    setPattern('abc');
    
    const zAlgo = new ZAlgorithm('abcabcabcabc', 'abc');
    setSteps(zAlgo.getSteps());
    setCurrentStep(0);
  };

  // Load example
  const loadExample = (textValue: string, patternValue: string) => {
    setText(textValue);
    setPattern(patternValue);
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

  // Run on pattern/text change
  useEffect(() => {
    if (text.trim() && pattern.trim()) {
      const zAlgo = new ZAlgorithm(text, pattern);
      setSteps(zAlgo.getSteps());
      setCurrentStep(0);
    }
  }, [text, pattern]);

  const currentStepData = steps[currentStep];

  // Render Z Algorithm visualization
  const renderZAlgorithm = () => {
    if (!currentStepData) return null;

    const {
      combinedString,
      zArray,
      currentIndex,
      left,
      right,
      matches,
      highlightedIndices,
      stage
    } = currentStepData;

    return (
      <div className="space-y-6">
        {/* Original Text and Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Pattern</h4>
            <div className="flex gap-1 justify-center">
              {pattern.split('').map((char, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{index}</div>
                  <div className="w-8 h-8 border-2 border-blue-400 rounded flex items-center justify-center font-bold bg-blue-100">
                    {char}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Text</h4>
            <div className="flex gap-1 justify-center flex-wrap">
              {text.split('').map((char, index) => {
                const isMatch = matches.includes(index);
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">{index}</div>
                    <div className={`w-8 h-8 border-2 rounded flex items-center justify-center font-bold ${
                      isMatch ? 'bg-green-300 border-green-600' :
                      'bg-gray-100 border-gray-400'
                    }`}>
                      {char}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Combined String */}
        <div>
          <h4 className="font-medium mb-2">Combined String (Pattern + $ + Text)</h4>
          <div className="flex gap-1 justify-center flex-wrap">
            {combinedString.split('').map((char, index) => {
              const isCurrentIndex = index === currentIndex;
              const isInZBox = index >= left && index <= right && left !== -1 && right !== -1;
              const isHighlighted = highlightedIndices.includes(index);
              const isSeparator = char === '$';
              const isPatternPart = index < pattern.length;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{index}</div>
                  <div className={`w-8 h-8 border-2 rounded flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCurrentIndex ? 'bg-red-300 border-red-600 transform scale-110' :
                    isHighlighted ? 'bg-yellow-300 border-yellow-600' :
                    isSeparator ? 'bg-purple-200 border-purple-500' :
                    isPatternPart ? 'bg-blue-100 border-blue-400' :
                    isInZBox ? 'bg-orange-100 border-orange-400' :
                    'bg-white border-gray-400'
                  }`}>
                    {char}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Z Array */}
        <div>
          <h4 className="font-medium mb-2">Z Array (Length of longest substring starting from index i which is also prefix)</h4>
          <div className="flex gap-1 justify-center flex-wrap">
            {zArray.map((value, index) => {
              const isCurrentIndex = index === currentIndex;
              const isHighlighted = highlightedIndices.includes(index);
              const isPatternMatch = index > pattern.length && value === pattern.length;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">Z[{index}]</div>
                  <div className={`w-10 h-10 border-2 rounded flex items-center justify-center text-sm font-bold ${
                    isCurrentIndex ? 'bg-red-200 border-red-500' :
                    isPatternMatch ? 'bg-green-200 border-green-500' :
                    isHighlighted ? 'bg-yellow-200 border-yellow-500' :
                    value > 0 ? 'bg-blue-100 border-blue-400' :
                    'bg-gray-50 border-gray-300'
                  }`}>
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm State */}
        {stage !== 'combine' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-700">Current Index</div>
              <div className="text-xl font-bold text-blue-900">{currentIndex >= 0 ? currentIndex : '-'}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="font-medium text-orange-700">Left (Z-box)</div>
              <div className="text-xl font-bold text-orange-900">{left >= 0 ? left : '-'}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-700">Right (Z-box)</div>
              <div className="text-xl font-bold text-purple-900">{right >= 0 ? right : '-'}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-700">Matches Found</div>
              <div className="text-xl font-bold text-green-900">{matches.length}</div>
            </div>
          </div>
        )}

        {/* Pattern Matches */}
        {matches.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Pattern Matches in Text</h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                Found {matches.length} occurrence(s) of &quot;{pattern}&quot; at position(s):
              </p>
              <div className="flex gap-2 flex-wrap">
                {matches.map((pos, index) => (
                  <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-mono">
                    {pos}
                  </span>
                ))}
              </div>
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
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Thuật Toán Z</h1>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Thuật Toán Z"
              description="Thuật toán Z là một thuật toán khớp chuỗi thời gian tuyến tính sử dụng mảng Z để tìm tất cả các lần xuất hiện của pattern trong text."
              timeComplexity={{
                best: "O(n + m)",
                average: "O(n + m)", 
                worst: "O(n + m)"
              }}
              spaceComplexity="O(n + m)"
              principles={[
                "Tạo chuỗi kết hợp pattern + delimiter + text",
                "Xây dựng mảng Z để lưu độ dài tiền tố chung",
                "Sử dụng Z-box để tối ưu hóa tính toán",
                "Tìm vị trí có Z[i] = |pattern|"
              ]}
              applications={[
                "Pattern matching trong text",
                "Tìm kiếm chuỗi con",
                "Text processing và bioinformatics",
                "String algorithms trong competitive programming"
              ]}
              advantages={[
                "Thời gian tuyến tính O(n + m)",
                "Đơn giản hơn KMP algorithm",
                "Tìm tất cả occurrence cùng lúc",
                "Không cần preprocessing phức tạp"
              ]}
            />
          </div>
        </div>
        <p className="text-gray-600">
          Trực quan hóa thuật toán Z để khớp mẫu hiệu quả trong thời gian tuyến tính.
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
                <label className="text-sm font-medium mb-2 block">Pattern</label>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value.toLowerCase())}
                  placeholder="Enter pattern..."
                  maxLength={8}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Text</label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value.toLowerCase())}
                  placeholder="Enter text..."
                  maxLength={20}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Examples</label>
                <div className="space-y-1">
                  <Button 
                    onClick={() => loadExample('abcabcabcabc', 'abc')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start text-xs"
                  >
                    Pattern: &quot;abc&quot;, Text: &quot;abcabcabcabc&quot;
                  </Button>
                  <Button 
                    onClick={() => loadExample('aabaacaadaabaaba', 'aaba')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start text-xs"
                  >
                    Pattern: &quot;aaba&quot;, Text: &quot;aabaacaadaabaaba&quot;
                  </Button>
                  <Button 
                    onClick={() => loadExample('abcdefg', 'xyz')} 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-left justify-start text-xs"
                  >
                    Pattern: &quot;xyz&quot;, Text: &quot;abcdefg&quot;
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
                  <span>Pattern Length:</span>
                  <span className="font-mono">{pattern.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Text Length:</span>
                  <span className="font-mono">{text.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combined Length:</span>
                  <span className="font-mono">{currentStepData?.combinedString.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Stage:</span>
                  <span className="font-mono capitalize">{currentStepData?.stage || 'none'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Matches Found:</span>
                  <span className="font-mono">{currentStepData?.matches.length || 0}</span>
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
              <CardTitle>Z Algorithm Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Enter pattern and text to start pattern matching'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderZAlgorithm()}

                {/* Stage Indicator */}
                {currentStepData && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.stage === 'combine' ? 'bg-gray-100 text-gray-800' :
                      currentStepData.stage === 'process' ? 'bg-blue-100 text-blue-800' :
                      currentStepData.stage === 'match' ? 'bg-green-100 text-green-800' :
                      currentStepData.stage === 'complete' ? 'bg-purple-100 text-purple-800' :
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
                    <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
                    <span>Highlighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-400"></div>
                    <span>Z-box Range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-500"></div>
                    <span>Pattern Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-200 border border-purple-500"></div>
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
            <CardTitle>Z Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>Z Algorithm is a linear-time string matching algorithm that preprocesses the pattern to find all occurrences in the text efficiently.</p>
              
              <h3>Key Concepts</h3>
              <ul>
                <li><strong>Z Array:</strong> Z[i] is the length of the longest substring starting from i which is also a prefix</li>
                <li><strong>Z-box:</strong> The rightmost segment [L, R] where Z[L] = R - L + 1</li>
                <li><strong>Combined String:</strong> Pattern + separator + text to find pattern occurrences</li>
                <li><strong>Mirror Property:</strong> Use previously computed Z values within the Z-box</li>
              </ul>

              <h3>Algorithm Steps</h3>
              <ol>
                <li><strong>Combine:</strong> Create string S = Pattern + $ + Text</li>
                <li><strong>Initialize:</strong> Set L = 0, R = 0, Z[0] = 0</li>
                <li><strong>For each position i from 1 to |S|-1:</strong></li>
                <ul>
                  <li>If i &gt; R: compute Z[i] by direct comparison</li>
                  <li>If i ≤ R: use mirror property Z[i] = min(R - i + 1, Z[i - L])</li>
                  <li>Try to extend Z[i] by comparing characters</li>
                  <li>If i + Z[i] - 1 &gt; R: update L = i, R = i + Z[i] - 1</li>
                </ul>
                <li><strong>Extract matches:</strong> Pattern occurs where Z[i] = |Pattern|</li>
              </ol>

              <h3>Z-box Optimization</h3>
              <p>The Z-box [L, R] represents the segment with the largest R such that S[L...R] = S[0...R-L]:</p>
              <ul>
                <li>For index i within the Z-box, we can use the mirror value Z[i - L]</li>
                <li>This avoids redundant character comparisons</li>
                <li>The algorithm is linear because each character is compared at most twice</li>
              </ul>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Preprocessing:</strong> O(m + n) where m = pattern length, n = text length</li>
                <li><strong>Searching:</strong> O(1) per match found</li>
                <li><strong>Total:</strong> O(m + n) - linear time complexity</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(m + n) for the combined string and Z array</p>

              <h3>Advantages</h3>
              <ul>
                <li>Linear time complexity O(m + n)</li>
                <li>Simple to understand and implement</li>
                <li>No preprocessing phase separate from searching</li>
                <li>Works well for multiple pattern searches</li>
                <li>Memory efficient compared to some alternatives</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>String pattern matching and text search</li>
                <li>Finding all occurrences of a pattern in text</li>
                <li>Substring matching in bioinformatics</li>
                <li>Text processing and analysis</li>
                <li>Regular expression engines (as a component)</li>
                <li>Data deduplication algorithms</li>
              </ul>

              <h3>Comparison with Other Algorithms</h3>
              <ul>
                <li><strong>vs KMP:</strong> Similar time complexity, simpler implementation</li>
                <li><strong>vs Naive:</strong> Much faster O(m+n) vs O(mn)</li>
                <li><strong>vs Boyer-Moore:</strong> Better worst-case, worse average case for random text</li>
                <li><strong>vs Rabin-Karp:</strong> No hash collisions, guaranteed linear time</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
