"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Type, RotateCcw } from 'lucide-react';

interface StringMatch {
  index: number;
  length: number;
  isHighlighted: boolean;
  isMatch: boolean;
}

interface AlgorithmStep {
  text: string;
  pattern: string;
  currentIndex: number;
  patternIndex: number;
  matches: StringMatch[];
  description: string;
  comparisons: number;
  lpsArray?: number[];
  badCharTable?: { [key: string]: number };
}

type StringAlgorithm = 'naive' | 'kmp' | 'boyer-moore' | 'rabin-karp';

export default function StringAlgorithmsPage() {
  const [text, setText] = useState("ABABDABACDABABCABCABCABCAB");
  const [pattern, setPattern] = useState("ABABCAB");
  const [algorithm, setAlgorithm] = useState<StringAlgorithm>('kmp');
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({ matches: 0, comparisons: 0, timeComplexity: '' });

  // KMP Algorithm Implementation
  const kmpSearch = (text: string, pattern: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = text.length;
    const m = pattern.length;
    let comparisons = 0;
    const matches: number[] = [];

    // Build LPS (Longest Proper Prefix which is also Suffix) array
    const buildLPS = (): number[] => {
      const lps = new Array(m).fill(0);
      let len = 0;
      let i = 1;

      while (i < m) {
        if (pattern[i] === pattern[len]) {
          len++;
          lps[i] = len;
          i++;
        } else {
          if (len !== 0) {
            len = lps[len - 1];
          } else {
            lps[i] = 0;
            i++;
          }
        }
      }

      steps.push({
        text,
        pattern,
        currentIndex: -1,
        patternIndex: -1,
        matches: [],
        description: `Built LPS array: [${lps.join(', ')}]`,
        comparisons,
        lpsArray: [...lps]
      });

      return lps;
    };

    const lps = buildLPS();
    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < n) {
      const currentMatches: StringMatch[] = matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      }));

      // Add current comparison visualization
      if (j < m && i < n) {
        currentMatches.push({
          index: i - j,
          length: j + 1,
          isHighlighted: true,
          isMatch: false
        });
      }

      steps.push({
        text,
        pattern,
        currentIndex: i,
        patternIndex: j,
        matches: currentMatches,
        description: j < m && i < n 
          ? `Comparing text[${i}] = '${text[i]}' with pattern[${j}] = '${pattern[j]}'`
          : `Searching completed`,
        comparisons,
        lpsArray: lps
      });

      if (j < m && i < n && pattern[j] === text[i]) {
        comparisons++;
        i++;
        j++;
      }

      if (j === m) {
        // Found a match
        matches.push(i - j);
        
        steps.push({
          text,
          pattern,
          currentIndex: i,
          patternIndex: j,
          matches: matches.map(idx => ({
            index: idx,
            length: m,
            isHighlighted: idx === i - j,
            isMatch: true
          })),
          description: `Match found at index ${i - j}`,
          comparisons,
          lpsArray: lps
        });

        j = lps[j - 1];
      } else if (i < n && j < m && pattern[j] !== text[i]) {
        comparisons++;
        if (j !== 0) {
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }

    // Final step
    steps.push({
      text,
      pattern,
      currentIndex: -1,
      patternIndex: -1,
      matches: matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      })),
      description: `KMP search completed! Found ${matches.length} match(es)`,
      comparisons,
      lpsArray: lps
    });

    return steps;
  };

  // Boyer-Moore Algorithm Implementation
  const boyerMooreSearch = (text: string, pattern: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = text.length;
    const m = pattern.length;
    let comparisons = 0;
    const matches: number[] = [];

    // Build Bad Character Table
    const buildBadCharTable = (): { [key: string]: number } => {
      const badChar: { [key: string]: number } = {};
      
      for (let i = 0; i < m - 1; i++) {
        badChar[pattern[i]] = m - 1 - i;
      }

      // Set default shift for characters not in pattern
      for (let i = 0; i < 256; i++) {
        const char = String.fromCharCode(i);
        if (!(char in badChar)) {
          badChar[char] = m;
        }
      }

      steps.push({
        text,
        pattern,
        currentIndex: -1,
        patternIndex: -1,
        matches: [],
        description: `Built Bad Character Table`,
        comparisons,
        badCharTable: { ...badChar }
      });

      return badChar;
    };

    const badChar = buildBadCharTable();
    let s = 0; // shift of the pattern with respect to text

    while (s <= n - m) {
      let j = m - 1;

      const currentMatches: StringMatch[] = matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      }));

      // Visualize current alignment
      currentMatches.push({
        index: s,
        length: m,
        isHighlighted: true,
        isMatch: false
      });

      steps.push({
        text,
        pattern,
        currentIndex: s + j,
        patternIndex: j,
        matches: currentMatches,
        description: `Aligning pattern at position ${s}, starting comparison from right`,
        comparisons,
        badCharTable: badChar
      });

      // Keep reducing index j of pattern while characters of pattern and text are matching
      while (j >= 0 && pattern[j] === text[s + j]) {
        comparisons++;
        
        steps.push({
          text,
          pattern,
          currentIndex: s + j,
          patternIndex: j,
          matches: currentMatches,
          description: `Match: text[${s + j}] = pattern[${j}] = '${pattern[j]}'`,
          comparisons,
          badCharTable: badChar
        });

        j--;
      }

      if (j < 0) {
        // Pattern found
        matches.push(s);
        
        steps.push({
          text,
          pattern,
          currentIndex: s,
          patternIndex: -1,
          matches: matches.map(idx => ({
            index: idx,
            length: m,
            isHighlighted: idx === s,
            isMatch: true
          })),
          description: `Match found at index ${s}`,
          comparisons,
          badCharTable: badChar
        });

        // Shift pattern to the right by 1 (or use good suffix rule for optimization)
        s += 1;
      } else {
        // Mismatch occurred
        comparisons++;
        const mismatchChar = text[s + j];
        const shift = Math.max(1, j - (badChar[mismatchChar] || m));

        steps.push({
          text,
          pattern,
          currentIndex: s + j,
          patternIndex: j,
          matches: currentMatches,
          description: `Mismatch: text[${s + j}] = '${mismatchChar}' ≠ pattern[${j}] = '${pattern[j]}'. Shift by ${shift}`,
          comparisons,
          badCharTable: badChar
        });

        s += shift;
      }
    }

    // Final step
    steps.push({
      text,
      pattern,
      currentIndex: -1,
      patternIndex: -1,
      matches: matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      })),
      description: `Boyer-Moore search completed! Found ${matches.length} match(es)`,
      comparisons,
      badCharTable: badChar
    });

    return steps;
  };

  // Naive Algorithm Implementation
  const naiveSearch = (text: string, pattern: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = text.length;
    const m = pattern.length;
    let comparisons = 0;
    const matches: number[] = [];

    for (let i = 0; i <= n - m; i++) {
      let j = 0;

      const currentMatches: StringMatch[] = matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      }));

      // Visualize current alignment
      currentMatches.push({
        index: i,
        length: m,
        isHighlighted: true,
        isMatch: false
      });

      steps.push({
        text,
        pattern,
        currentIndex: i,
        patternIndex: 0,
        matches: currentMatches,
        description: `Aligning pattern at position ${i}`,
        comparisons
      });

      while (j < m && text[i + j] === pattern[j]) {
        comparisons++;
        
        steps.push({
          text,
          pattern,
          currentIndex: i + j,
          patternIndex: j,
          matches: currentMatches,
          description: `Match: text[${i + j}] = pattern[${j}] = '${pattern[j]}'`,
          comparisons
        });

        j++;
      }

      if (j === m) {
        // Pattern found
        matches.push(i);
        
        steps.push({
          text,
          pattern,
          currentIndex: i,
          patternIndex: -1,
          matches: matches.map(idx => ({
            index: idx,
            length: m,
            isHighlighted: idx === i,
            isMatch: true
          })),
          description: `Match found at index ${i}`,
          comparisons
        });
      } else if (j < m) {
        // Mismatch occurred
        if (i + j < n) {
          comparisons++;
          steps.push({
            text,
            pattern,
            currentIndex: i + j,
            patternIndex: j,
            matches: currentMatches,
            description: `Mismatch: text[${i + j}] = '${text[i + j]}' ≠ pattern[${j}] = '${pattern[j]}'`,
            comparisons
          });
        }
      }
    }

    // Final step
    steps.push({
      text,
      pattern,
      currentIndex: -1,
      patternIndex: -1,
      matches: matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      })),
      description: `Naive search completed! Found ${matches.length} match(es)`,
      comparisons
    });

    return steps;
  };

  // Rabin-Karp Algorithm Implementation (simplified version)
  const rabinKarpSearch = (text: string, pattern: string): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const n = text.length;
    const m = pattern.length;
    let comparisons = 0;
    const matches: number[] = [];
    const base = 256;
    const prime = 101;

    // Calculate hash values
    let patternHash = 0;
    let textHash = 0;
    let h = 1;

    // h = pow(base, m-1) % prime
    for (let i = 0; i < m - 1; i++) {
      h = (h * base) % prime;
    }

    // Calculate initial hash values
    for (let i = 0; i < m; i++) {
      patternHash = (base * patternHash + pattern.charCodeAt(i)) % prime;
      textHash = (base * textHash + text.charCodeAt(i)) % prime;
    }

    steps.push({
      text,
      pattern,
      currentIndex: -1,
      patternIndex: -1,
      matches: [],
      description: `Pattern hash: ${patternHash}, Initial text window hash: ${textHash}`,
      comparisons
    });

    // Slide the pattern over text one by one
    for (let i = 0; i <= n - m; i++) {
      const currentMatches: StringMatch[] = matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      }));

      // Visualize current window
      currentMatches.push({
        index: i,
        length: m,
        isHighlighted: true,
        isMatch: false
      });

      steps.push({
        text,
        pattern,
        currentIndex: i,
        patternIndex: -1,
        matches: currentMatches,
        description: `Checking window at position ${i}, hash: ${textHash}`,
        comparisons
      });

      if (patternHash === textHash) {
        // Hash values match, check characters one by one
        let j = 0;
        while (j < m && text[i + j] === pattern[j]) {
          comparisons++;
          j++;
        }

        if (j === m) {
          // Pattern found
          matches.push(i);
          
          steps.push({
            text,
            pattern,
            currentIndex: i,
            patternIndex: -1,
            matches: matches.map(idx => ({
              index: idx,
              length: m,
              isHighlighted: idx === i,
              isMatch: true
            })),
            description: `Hash match confirmed! Pattern found at index ${i}`,
            comparisons
          });
        } else {
          comparisons++;
          steps.push({
            text,
            pattern,
            currentIndex: i + j,
            patternIndex: j,
            matches: currentMatches,
            description: `Hash collision: characters don't match at position ${j}`,
            comparisons
          });
        }
      }

      // Calculate hash value for next window
      if (i < n - m) {
        textHash = (base * (textHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % prime;
        
        // Convert negative value to positive
        if (textHash < 0) {
          textHash = textHash + prime;
        }
      }
    }

    // Final step
    steps.push({
      text,
      pattern,
      currentIndex: -1,
      patternIndex: -1,
      matches: matches.map(idx => ({
        index: idx,
        length: m,
        isHighlighted: false,
        isMatch: true
      })),
      description: `Rabin-Karp search completed! Found ${matches.length} match(es)`,
      comparisons
    });

    return steps;
  };

  const getTimeComplexity = (alg: StringAlgorithm): string => {
    switch (alg) {
      case 'naive': return 'O(n × m)';
      case 'kmp': return 'O(n + m)';
      case 'boyer-moore': return 'O(n × m) worst, O(n/m) best';
      case 'rabin-karp': return 'O(n + m) average, O(n × m) worst';
      default: return 'O(n + m)';
    }
  };

  const startSearch = () => {
    if (!text || !pattern) return;

    let algorithmSteps: AlgorithmStep[] = [];

    switch (algorithm) {
      case 'naive':
        algorithmSteps = naiveSearch(text.toUpperCase(), pattern.toUpperCase());
        break;
      case 'kmp':
        algorithmSteps = kmpSearch(text.toUpperCase(), pattern.toUpperCase());
        break;
      case 'boyer-moore':
        algorithmSteps = boyerMooreSearch(text.toUpperCase(), pattern.toUpperCase());
        break;
      case 'rabin-karp':
        algorithmSteps = rabinKarpSearch(text.toUpperCase(), pattern.toUpperCase());
        break;
      default:
        algorithmSteps = kmpSearch(text.toUpperCase(), pattern.toUpperCase());
    }

    setSteps(algorithmSteps);
    setCurrentStep(0);
  };

  const play = () => {
    if (steps.length === 0) {
      startSearch();
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
  };

  // Auto-play animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying && currentStep < steps.length - 1) {
      intervalId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isPlaying, currentStep, steps.length]);

  // Update stats when step changes
  useEffect(() => {
    if (steps[currentStep]) {
      const currentMatches = steps[currentStep].matches.filter(m => m.isMatch).length;
      setStats({
        matches: currentMatches,
        comparisons: steps[currentStep].comparisons,
        timeComplexity: getTimeComplexity(algorithm)
      });
    }
  }, [currentStep, steps, algorithm]);

  const currentStepData = steps[currentStep];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Type className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">String Processing Algorithms</h1>
        </div>
        <p className="text-gray-600">
          Explore string matching algorithms: KMP, Boyer-Moore, Rabin-Karp, and Naive approach.
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
                <label className="text-sm font-medium mb-2 block">Text</label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to search in"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Pattern</label>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter pattern to search for"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Algorithm</label>
                <Select value={algorithm} onValueChange={(value: StringAlgorithm) => setAlgorithm(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="naive">Naive Search</SelectItem>
                    <SelectItem value="kmp">KMP Algorithm</SelectItem>
                    <SelectItem value="boyer-moore">Boyer-Moore</SelectItem>
                    <SelectItem value="rabin-karp">Rabin-Karp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={play} disabled={isPlaying} size="sm">
                  <Play className="w-4 h-4" />
                </Button>
                <Button onClick={pause} disabled={!isPlaying} size="sm" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
                <Button onClick={reset} size="sm" variant="outline">
                  <Square className="w-4 h-4" />
                </Button>
                <Button onClick={() => { setText("ABABDABACDABABCABCABCABCAB"); setPattern("ABABCAB"); }} size="sm" variant="outline">
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
                  <span>Matches:</span>
                  <span className="font-mono">{stats.matches}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comparisons:</span>
                  <span className="font-mono">{stats.comparisons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Complexity:</span>
                  <span className="font-mono text-xs">{stats.timeComplexity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Step:</span>
                  <span className="font-mono">{currentStep + 1}/{steps.length || 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm-specific info */}
          {currentStepData?.lpsArray && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>LPS Array (KMP)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {currentStepData.lpsArray.map((value, idx) => (
                    <div key={idx} className="text-center">
                      <div className="font-mono bg-gray-100 p-1">{pattern[idx]}</div>
                      <div className="font-mono text-blue-600">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>String Matching Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description || 'Configure text and pattern, then click Start to begin'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Text visualization */}
                <div>
                  <h4 className="font-medium mb-2">Text:</h4>
                  <div className="flex flex-wrap gap-1 font-mono text-lg bg-gray-50 p-4 rounded">
                    {(currentStepData?.text || text).split('').map((char, index) => {
                      const className = "w-8 h-8 flex items-center justify-center border rounded";
                      let bgColor = "bg-white";

                      if (currentStepData?.matches) {
                        // Check if this character is part of a match
                        const isInMatch = currentStepData.matches.some(match => 
                          index >= match.index && index < match.index + match.length
                        );
                        
                        if (isInMatch) {
                          const match = currentStepData.matches.find(m => 
                            index >= m.index && index < m.index + m.length
                          );
                          
                          if (match?.isMatch) {
                            bgColor = "bg-green-200";
                          } else if (match?.isHighlighted) {
                            bgColor = "bg-yellow-200";
                          }
                        }

                        // Highlight current comparison
                        if (currentStepData.currentIndex === index) {
                          bgColor = "bg-red-200";
                        }
                      }

                      return (
                        <div key={index} className={`${className} ${bgColor}`}>
                          {char}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1 font-mono text-xs text-gray-500 mt-1 ml-4">
                    {(currentStepData?.text || text).split('').map((_, index) => (
                      <div key={index} className="w-8 text-center">
                        {index}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern visualization */}
                <div>
                  <h4 className="font-medium mb-2">Pattern:</h4>
                  <div className="flex gap-1 font-mono text-lg bg-gray-50 p-4 rounded">
                    {(currentStepData?.pattern || pattern).split('').map((char, index) => {
                      let className = "w-8 h-8 flex items-center justify-center border rounded bg-white";

                      if (currentStepData?.patternIndex === index) {
                        className += " bg-red-200";
                      }

                      return (
                        <div key={index} className={className}>
                          {char}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-1 font-mono text-xs text-gray-500 mt-1 ml-4">
                    {(currentStepData?.pattern || pattern).split('').map((_, index) => (
                      <div key={index} className="w-8 text-center">
                        {index}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 border rounded"></div>
                    <span>Current Comparison</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 border rounded"></div>
                    <span>Active Character</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border rounded"></div>
                    <span>Match Found</span>
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
            <CardTitle>Algorithm Information</CardTitle>
          </CardHeader>
          <CardContent>
            {algorithm === 'naive' && (
              <div className="prose max-w-none">
                <h3>Naive String Matching</h3>
                <p>The simplest approach that checks for pattern at each position in the text by comparing character by character.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n × m) where n = text length, m = pattern length</li>
                  <li><strong>Space Complexity:</strong> O(1)</li>
                  <li><strong>Best Use Case:</strong> Small patterns and texts, or when simplicity is preferred</li>
                </ul>
              </div>
            )}

            {algorithm === 'kmp' && (
              <div className="prose max-w-none">
                <h3>Knuth-Morris-Pratt (KMP) Algorithm</h3>
                <p>Uses preprocessing to build a failure function (LPS array) to skip characters intelligently when a mismatch occurs.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n + m) - linear time</li>
                  <li><strong>Space Complexity:</strong> O(m) for the LPS array</li>
                  <li><strong>Key Feature:</strong> Never re-examines text characters</li>
                  <li><strong>Best Use Case:</strong> When pattern has repeating subpatterns</li>
                </ul>
              </div>
            )}

            {algorithm === 'boyer-moore' && (
              <div className="prose max-w-none">
                <h3>Boyer-Moore Algorithm</h3>
                <p>Compares pattern from right to left and uses bad character heuristic to skip sections of text.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n × m) worst case, O(n/m) best case</li>
                  <li><strong>Space Complexity:</strong> O(|Σ|) where Σ is the alphabet size</li>
                  <li><strong>Key Feature:</strong> Can skip multiple characters at once</li>
                  <li><strong>Best Use Case:</strong> Large alphabets and long patterns</li>
                </ul>
              </div>
            )}

            {algorithm === 'rabin-karp' && (
              <div className="prose max-w-none">
                <h3>Rabin-Karp Algorithm</h3>
                <p>Uses hashing to find pattern matches. Compares hash values first, then characters if hashes match.</p>
                <ul>
                  <li><strong>Time Complexity:</strong> O(n + m) average, O(n × m) worst case</li>
                  <li><strong>Space Complexity:</strong> O(1)</li>
                  <li><strong>Key Feature:</strong> Uses rolling hash for efficiency</li>
                  <li><strong>Best Use Case:</strong> Multiple pattern searching and plagiarism detection</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
