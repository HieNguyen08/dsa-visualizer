"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Type, Search, RotateCcw } from 'lucide-react';

interface SuffixArrayStep {
  description: string;
  suffixes: { suffix: string; index: number; rank?: number }[];
  suffixArray: number[];
  lcpArray: number[];
  searchPattern?: string;
  searchResult?: number[];
  highlightedIndices: number[];
  stage: 'build' | 'sort' | 'lcp' | 'search';
}

export default function SuffixArrayPage() {
  const [inputText, setInputText] = useState('banana');
  const [searchPattern, setSearchPattern] = useState('');
  const [steps, setSteps] = useState<SuffixArrayStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([600]);

  // Suffix Array implementation
  class SuffixArrayBuilder {
    private text: string;
    private steps: SuffixArrayStep[] = [];

    constructor(text: string) {
      this.text = text + '$'; // Add terminating character
      this.buildSuffixArray();
    }

    private buildSuffixArray() {
      const n = this.text.length;
      const suffixes: { suffix: string; index: number }[] = [];
      
      // Step 1: Generate all suffixes
      for (let i = 0; i < n; i++) {
        suffixes.push({
          suffix: this.text.substring(i),
          index: i
        });
      }
      
      this.addStep('Generated all suffixes', suffixes, [], [], [], 'build');

      // Step 2: Sort suffixes lexicographically
      const sortedSuffixes = [...suffixes];
      
      // Bubble sort for visualization
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (sortedSuffixes[j].suffix > sortedSuffixes[j + 1].suffix) {
            [sortedSuffixes[j], sortedSuffixes[j + 1]] = [sortedSuffixes[j + 1], sortedSuffixes[j]];
            this.addStep(
              `Swapped "${sortedSuffixes[j + 1].suffix}" and "${sortedSuffixes[j].suffix}"`,
              sortedSuffixes,
              [],
              [],
              [j, j + 1],
              'sort'
            );
          }
        }
      }

      const suffixArray = sortedSuffixes.map(s => s.index);
      this.addStep('Suffix array constructed', sortedSuffixes, suffixArray, [], [], 'sort');

      // Step 3: Build LCP array
      const lcpArray = this.buildLCPArray(suffixArray);
      this.addStep('LCP array constructed', sortedSuffixes, suffixArray, lcpArray, [], 'lcp');
    }

    private buildLCPArray(suffixArray: number[]): number[] {
      const n = this.text.length;
      const lcp = new Array(n).fill(0);
      const rank = new Array(n).fill(0);

      // Build rank array
      for (let i = 0; i < n; i++) {
        rank[suffixArray[i]] = i;
      }

      let h = 0;
      for (let i = 0; i < n; i++) {
        if (rank[i] > 0) {
          const j = suffixArray[rank[i] - 1];
          while (i + h < n && j + h < n && this.text[i + h] === this.text[j + h]) {
            h++;
          }
          lcp[rank[i]] = h;
          if (h > 0) h--;
        }
      }

      return lcp;
    }

    private addStep(
      description: string,
      suffixes: { suffix: string; index: number }[],
      suffixArray: number[],
      lcpArray: number[],
      highlightedIndices: number[],
      stage: 'build' | 'sort' | 'lcp' | 'search'
    ) {
      this.steps.push({
        description,
        suffixes: suffixes.map(s => ({ ...s })),
        suffixArray: [...suffixArray],
        lcpArray: [...lcpArray],
        highlightedIndices: [...highlightedIndices],
        stage
      });
    }

    search(pattern: string): number[] {
      if (!pattern) return [];

      const suffixArray = this.steps[this.steps.length - 1].suffixArray;
      const results: number[] = [];

      // Binary search for pattern
      let left = 0;
      let right = suffixArray.length - 1;

      // Find leftmost occurrence
      let leftBound = -1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const suffix = this.text.substring(suffixArray[mid]);
        
        if (suffix.startsWith(pattern)) {
          leftBound = mid;
          right = mid - 1;
        } else if (suffix < pattern) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      if (leftBound === -1) {
        const sortedSuffixes = this.steps[this.steps.length - 1].suffixes;
        this.addStep(
          `Pattern "${pattern}" not found`,
          sortedSuffixes,
          suffixArray,
          this.steps[this.steps.length - 1].lcpArray,
          [],
          'search'
        );
        return [];
      }

      // Find rightmost occurrence
      left = 0;
      right = suffixArray.length - 1;
      let rightBound = -1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const suffix = this.text.substring(suffixArray[mid]);
        
        if (suffix.startsWith(pattern)) {
          rightBound = mid;
          left = mid + 1;
        } else if (suffix < pattern) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // Collect all occurrences
      for (let i = leftBound; i <= rightBound; i++) {
        results.push(suffixArray[i]);
      }

      const sortedSuffixes = this.steps[this.steps.length - 1].suffixes;
      const highlightedIndices = [];
      for (let i = leftBound; i <= rightBound; i++) {
        highlightedIndices.push(i);
      }

      this.addStep(
        `Found ${results.length} occurrence(s) of "${pattern}" at positions: ${results.join(', ')}`,
        sortedSuffixes,
        suffixArray,
        this.steps[this.steps.length - 1].lcpArray,
        highlightedIndices,
        'search'
      );

      return results;
    }

    getSteps(): SuffixArrayStep[] {
      return this.steps;
    }
  }

  // Build suffix array
  // const buildSuffixArray = () => {
  //   if (!inputText.trim()) return;
    
  //   const builder = new SuffixArrayBuilder(inputText);
  //   setSteps(builder.getSteps());
  //   setCurrentStep(0);
  // };

  // Perform pattern search
  const performSearch = () => {
    if (!searchPattern.trim() || steps.length === 0) return;
    
    const builder = new SuffixArrayBuilder(inputText);
    builder.search(searchPattern);
    
    const newSteps = builder.getSteps();
    setSteps(newSteps);
    setCurrentStep(newSteps.length - 1);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Run demo
  const runDemo = () => {
    setInputText('banana');
    setSearchPattern('ana');
    
    const builder = new SuffixArrayBuilder('banana');
    builder.search('ana');
    
    setSteps(builder.getSteps());
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

  // Build on text change
  useEffect(() => {
    if (inputText.trim()) {
      const builder = new SuffixArrayBuilder(inputText);
      setSteps(builder.getSteps());
      setCurrentStep(0);
    }
  }, [inputText]);

  const currentStepData = steps[currentStep];

  // Render suffix array visualization
  const renderSuffixArray = () => {
    if (!currentStepData) return null;

    const { suffixes, suffixArray, lcpArray, highlightedIndices, stage } = currentStepData;
    const displayText = inputText + '$';

    return (
      <div className="space-y-6">
        {/* Original Text */}
        <div>
          <h4 className="font-medium mb-2">Original Text</h4>
          <div className="flex gap-1 justify-center">
            {displayText.split('').map((char, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">{index}</div>
                <div className="w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center font-bold bg-white">
                  {char}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suffixes Table */}
        <div>
          <h4 className="font-medium mb-2">
            {stage === 'build' ? 'All Suffixes' :
             stage === 'sort' ? 'Sorting Suffixes' :
             stage === 'lcp' ? 'Suffix Array with LCP' :
             'Pattern Search Results'}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-sm">Rank</th>
                  <th className="border border-gray-300 p-2 text-sm">Index</th>
                  <th className="border border-gray-300 p-2 text-sm">Suffix</th>
                  {stage === 'lcp' && <th className="border border-gray-300 p-2 text-sm">LCP</th>}
                </tr>
              </thead>
              <tbody>
                {suffixes.map((suffix, rank) => {
                  const isHighlighted = highlightedIndices.includes(rank);
                  const isSearchMatch = stage === 'search' && searchPattern && 
                    suffix.suffix.startsWith(searchPattern);
                  
                  return (
                    <tr key={rank} className={`
                      ${isHighlighted ? 'bg-yellow-200 animate-pulse' : ''}
                      ${isSearchMatch ? 'bg-green-200' : ''}
                    `}>
                      <td className="border border-gray-300 p-2 text-center font-mono text-sm">
                        {rank}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-mono text-sm">
                        {suffix.index}
                      </td>
                      <td className="border border-gray-300 p-2 font-mono text-sm">
                        {stage === 'search' && searchPattern ? (
                          <span>
                            <span className={suffix.suffix.startsWith(searchPattern) ? 'bg-green-300 font-bold' : ''}>
                              {suffix.suffix.substring(0, searchPattern.length)}
                            </span>
                            {suffix.suffix.substring(searchPattern.length)}
                          </span>
                        ) : (
                          suffix.suffix
                        )}
                      </td>
                      {stage === 'lcp' && (
                        <td className="border border-gray-300 p-2 text-center font-mono text-sm">
                          {lcpArray[rank] || 0}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suffix Array */}
        {suffixArray.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Suffix Array</h4>
            <div className="flex gap-1 justify-center flex-wrap">
              {suffixArray.map((index, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">SA[{i}]</div>
                  <div className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-sm ${
                    highlightedIndices.includes(i) ? 'bg-yellow-300 border-yellow-600' :
                    'bg-blue-100 border-blue-400'
                  }`}>
                    {index}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LCP Array */}
        {lcpArray.length > 0 && stage === 'lcp' && (
          <div>
            <h4 className="font-medium mb-2">LCP Array (Longest Common Prefix)</h4>
            <div className="flex gap-1 justify-center flex-wrap">
              {lcpArray.map((lcp, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">LCP[{i}]</div>
                  <div className="w-12 h-12 border-2 border-purple-400 rounded flex items-center justify-center font-bold text-sm bg-purple-100">
                    {lcp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Type className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Suffix Array</h1>
        </div>
        <p className="text-gray-600">
          Visualize suffix array construction and pattern searching algorithm.
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
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">Max 10 characters</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Pattern</label>
                <div className="space-y-2">
                  <Input
                    value={searchPattern}
                    onChange={(e) => setSearchPattern(e.target.value.toLowerCase())}
                    placeholder="Pattern to search..."
                  />
                  <Button onClick={performSearch} size="sm" className="w-full">
                    <Search className="w-4 h-4 mr-1" />
                    Search Pattern
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
                  <span>Suffixes:</span>
                  <span className="font-mono">{inputText.length + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Stage:</span>
                  <span className="font-mono capitalize">{currentStepData?.stage || 'none'}</span>
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
              <CardTitle>Suffix Array Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Enter text to build suffix array'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderSuffixArray()}

                {/* Stage Indicator */}
                {currentStepData && (
                  <div className="flex justify-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      currentStepData.stage === 'build' ? 'bg-blue-100 text-blue-800' :
                      currentStepData.stage === 'sort' ? 'bg-orange-100 text-orange-800' :
                      currentStepData.stage === 'lcp' ? 'bg-purple-100 text-purple-800' :
                      currentStepData.stage === 'search' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentStepData.stage.toUpperCase()}
                      {currentStepData.searchPattern && ` - "${currentStepData.searchPattern}"`}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 border border-yellow-400"></div>
                    <span>Currently Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-400"></div>
                    <span>Pattern Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-400"></div>
                    <span>Suffix Array</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 border border-purple-400"></div>
                    <span>LCP Array</span>
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
            <CardTitle>Suffix Array Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>Overview</h3>
              <p>A suffix array is a sorted array of all suffixes of a string. It&apos;s a space-efficient alternative to suffix trees for many string processing problems.</p>
              
              <h3>Construction Process</h3>
              <ol>
                <li><strong>Generate Suffixes:</strong> Create all suffixes of the input string</li>
                <li><strong>Sort Suffixes:</strong> Sort suffixes lexicographically</li>
                <li><strong>Extract Indices:</strong> Store starting positions of sorted suffixes</li>
                <li><strong>Build LCP Array:</strong> Compute longest common prefixes between adjacent suffixes</li>
              </ol>

              <h3>Key Components</h3>
              <ul>
                <li><strong>Suffix Array (SA):</strong> SA[i] contains the starting position of the i-th smallest suffix</li>
                <li><strong>LCP Array:</strong> LCP[i] is the length of longest common prefix between SA[i-1] and SA[i]</li>
                <li><strong>Rank Array:</strong> Inverse of suffix array - rank[i] gives position of suffix starting at i</li>
              </ul>

              <h3>Pattern Search Algorithm</h3>
              <ol>
                <li><strong>Binary Search:</strong> Use binary search on sorted suffix array</li>
                <li><strong>Find Range:</strong> Locate leftmost and rightmost occurrences</li>
                <li><strong>Extract Results:</strong> All suffixes in range start with the pattern</li>
              </ol>

              <h3>Time Complexity</h3>
              <ul>
                <li><strong>Naive Construction:</strong> O(n² log n) - sort n suffixes of average length n/2</li>
                <li><strong>Advanced Construction:</strong> O(n log n) using radix sort or DC3 algorithm</li>
                <li><strong>LCP Construction:</strong> O(n) using Kasai algorithm</li>
                <li><strong>Pattern Search:</strong> O(m log n + occ) where m is pattern length, occ is occurrences</li>
              </ul>

              <h3>Space Complexity</h3>
              <p>O(n) - much more space-efficient than suffix trees</p>

              <h3>Advantages</h3>
              <ul>
                <li>Space-efficient compared to suffix trees</li>
                <li>Simple to implement and understand</li>
                <li>Cache-friendly due to array structure</li>
                <li>Supports fast pattern searches</li>
              </ul>

              <h3>Applications</h3>
              <ul>
                <li>Pattern matching and string searching</li>
                <li>Finding longest repeated substrings</li>
                <li>Computing longest common substrings</li>
                <li>Burrows-Wheeler transform</li>
                <li>Data compression algorithms</li>
                <li>Bioinformatics sequence analysis</li>
              </ul>

              <h3>Advanced Algorithms</h3>
              <ul>
                <li><strong>DC3 (Difference Cover 3):</strong> O(n) construction algorithm</li>
                <li><strong>SA-IS:</strong> Suffix Array by Induced Sorting</li>
                <li><strong>Radix Sort:</strong> For integer alphabet suffix sorting</li>
                <li><strong>Kasai Algorithm:</strong> Linear time LCP array construction</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
