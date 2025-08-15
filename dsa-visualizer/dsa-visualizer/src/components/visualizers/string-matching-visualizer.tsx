"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, RotateCcw, Search, BookOpen, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// --- Types ---
interface MatchStep {
  step: number;
  textIndex: number;
  patternIndex: number;
  action: 'match' | 'mismatch' | 'shift' | 'found';
  description: string;
  patternStart: number;
  matches: number[];
}

// --- Constants ---
const ALGORITHMS = {
  kmp: { name: "KMP Algorithm", description: "Knuth-Morris-Pratt pattern matching" },
  boyermoore: { name: "Boyer-Moore Algorithm", description: "Boyer-Moore pattern matching with bad character rule" }
};

// --- Algorithm Information ---
const ALGORITHM_INFO = {
  kmp: {
    title: "Thuật toán KMP (Knuth-Morris-Pratt)",
    principle: "KMP là thuật toán tìm kiếm chuỗi con hiệu quả với độ phức tạp O(n+m):",
    steps: [
      "1. Tiền xử lý: Tạo bảng LPS (Longest Proper Prefix Suffix)",
      "2. So sánh ký tự từ trái sang phải",
      "3. Khi gặp mismatch:",
      "   - Sử dụng bảng LPS để xác định vị trí tiếp theo của pattern",
      "   - Không cần quay lại trong text, chỉ dịch chuyển pattern",
      "4. Tiếp tục cho đến khi tìm thấy hoặc hết text"
    ],
    complexity: "Độ phức tạp: O(n + m) với n là độ dài text, m là độ dài pattern",
    applications: "Ứng dụng: Tìm kiếm trong text editor, DNA sequencing, data compression"
  },
  boyermoore: {
    title: "Thuật toán Boyer-Moore",
    principle: "Boyer-Moore tìm kiếm từ phải sang trái với bad character rule:",
    steps: [
      "1. Tiền xử lý: Tạo bảng bad character cho pattern",
      "2. So sánh ký tự từ phải sang trái của pattern",
      "3. Khi gặp mismatch:",
      "   - Áp dụng bad character rule để xác định bước nhảy",
      "   - Dịch chuyển pattern sang phải theo quy tắc",
      "4. Lặp lại cho đến khi tìm thấy hoặc hết text"
    ],
    complexity: "Độ phức tạp: O(nm) worst case, O(n/m) best case",
    applications: "Ứng dụng: Text search engines, grep command, antivirus scanning"
  }
};

// Default texts for demonstration
const SAMPLE_TEXTS = {
  simple: "ABABDABACDABABCABCABCABCABC",
  dna: "ATCGATCGATCGATCGAATCGATCGATCG",
  english: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
};

const SAMPLE_PATTERNS = {
  simple: "ABABCAB",
  dna: "ATCG",
  english: "THE"
};

const StringMatchingVisualizer = () => {
  const [text, setText] = useState(SAMPLE_TEXTS.simple);
  const [pattern, setPattern] = useState(SAMPLE_PATTERNS.simple);
  const [algorithm, setAlgorithm] = useState('kmp');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [matchSteps, setMatchSteps] = useState<MatchStep[]>([]);
  const [speed, setSpeed] = useState(5);
  const [matches, setMatches] = useState<number[]>([]);

  const speedRef = useRef(speed);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // KMP preprocessing - compute LPS array
  const computeLPS = (pattern: string): number[] => {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
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
    return lps;
  };

  // KMP Algorithm
  const kmpSearch = (text: string, pattern: string): MatchStep[] => {
    const steps: MatchStep[] = [];
    const lps = computeLPS(pattern);
    let textIndex = 0;
    let patternIndex = 0;
    let stepCount = 0;
    const foundMatches: number[] = [];

    while (textIndex < text.length) {
      stepCount++;

      if (text[textIndex] === pattern[patternIndex]) {
        steps.push({
          step: stepCount,
          textIndex,
          patternIndex,
          action: 'match',
          description: `Khớp: '${text[textIndex]}' tại vị trí text[${textIndex}] và pattern[${patternIndex}]`,
          patternStart: textIndex - patternIndex,
          matches: [...foundMatches]
        });

        textIndex++;
        patternIndex++;

        if (patternIndex === pattern.length) {
          const matchStart = textIndex - pattern.length;
          foundMatches.push(matchStart);
          
          stepCount++;
          steps.push({
            step: stepCount,
            textIndex: textIndex - 1,
            patternIndex: patternIndex - 1,
            action: 'found',
            description: `Tìm thấy pattern tại vị trí ${matchStart}!`,
            patternStart: matchStart,
            matches: [...foundMatches]
          });

          patternIndex = lps[patternIndex - 1];
        }
      } else {
        steps.push({
          step: stepCount,
          textIndex,
          patternIndex,
          action: 'mismatch',
          description: `Không khớp: '${text[textIndex]}' ≠ '${pattern[patternIndex]}' tại text[${textIndex}], pattern[${patternIndex}]`,
          patternStart: textIndex - patternIndex,
          matches: [...foundMatches]
        });

        if (patternIndex !== 0) {
          stepCount++;
          const newPatternIndex = lps[patternIndex - 1];
          steps.push({
            step: stepCount,
            textIndex,
            patternIndex: newPatternIndex,
            action: 'shift',
            description: `Dịch chuyển pattern sử dụng LPS: pattern index từ ${patternIndex} về ${newPatternIndex}`,
            patternStart: textIndex - newPatternIndex,
            matches: [...foundMatches]
          });
          patternIndex = newPatternIndex;
        } else {
          textIndex++;
        }
      }
    }

    return steps;
  };

  // Boyer-Moore bad character preprocessing
  const badCharTable = (pattern: string): Map<string, number> => {
    const table = new Map<string, number>();
    
    for (let i = 0; i < pattern.length; i++) {
      table.set(pattern[i], i);
    }
    
    return table;
  };

  // Boyer-Moore Algorithm (simplified with just bad character rule)
  const boyerMooreSearch = (text: string, pattern: string): MatchStep[] => {
    const steps: MatchStep[] = [];
    const badChar = badCharTable(pattern);
    let textIndex = 0;
    let stepCount = 0;
    const foundMatches: number[] = [];

    while (textIndex <= text.length - pattern.length) {
      let patternIndex = pattern.length - 1;
      stepCount++;

      // Compare from right to left
      while (patternIndex >= 0 && pattern[patternIndex] === text[textIndex + patternIndex]) {
        steps.push({
          step: stepCount,
          textIndex: textIndex + patternIndex,
          patternIndex,
          action: 'match',
          description: `Khớp: '${text[textIndex + patternIndex]}' tại vị trí text[${textIndex + patternIndex}] và pattern[${patternIndex}]`,
          patternStart: textIndex,
          matches: [...foundMatches]
        });
        patternIndex--;
        stepCount++;
      }

      if (patternIndex < 0) {
        // Pattern found
        foundMatches.push(textIndex);
        steps.push({
          step: stepCount,
          textIndex: textIndex + pattern.length - 1,
          patternIndex: 0,
          action: 'found',
          description: `Tìm thấy pattern tại vị trí ${textIndex}!`,
          patternStart: textIndex,
          matches: [...foundMatches]
        });
        textIndex++;
      } else {
        // Mismatch occurred
        const mismatchChar = text[textIndex + patternIndex];
        steps.push({
          step: stepCount,
          textIndex: textIndex + patternIndex,
          patternIndex,
          action: 'mismatch',
          description: `Không khớp: '${mismatchChar}' ≠ '${pattern[patternIndex]}' tại text[${textIndex + patternIndex}], pattern[${patternIndex}]`,
          patternStart: textIndex,
          matches: [...foundMatches]
        });

        // Apply bad character rule
        const badCharShift = badChar.get(mismatchChar);
        const shift = Math.max(1, patternIndex - (badCharShift || -1));
        
        stepCount++;
        steps.push({
          step: stepCount,
          textIndex: textIndex + shift,
          patternIndex: pattern.length - 1,
          action: 'shift',
          description: `Dịch chuyển pattern ${shift} vị trí sang phải sử dụng bad character rule`,
          patternStart: textIndex + shift,
          matches: [...foundMatches]
        });

        textIndex += shift;
      }
    }

    return steps;
  };

  const startSearch = () => {
    if (isAnimating) {
      stopSearch();
      return;
    }

    if (!text.trim() || !pattern.trim()) {
      alert('Vui lòng nhập text và pattern!');
      return;
    }

    let steps: MatchStep[];
    if (algorithm === 'kmp') {
      steps = kmpSearch(text.toUpperCase(), pattern.toUpperCase());
    } else {
      steps = boyerMooreSearch(text.toUpperCase(), pattern.toUpperCase());
    }

    setMatchSteps(steps);
    setCurrentStep(-1);
    setMatches([]);
    setIsAnimating(true);
    
    animateSearch(steps);
  };

  const stopSearch = () => {
    setIsAnimating(false);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const animateSearch = (steps: MatchStep[]) => {
    let stepIndex = 0;

    const animate = () => {
      if (stepIndex >= steps.length) {
        setIsAnimating(false);
        return;
      }

      const step = steps[stepIndex];
      setCurrentStep(stepIndex);
      setMatches(step.matches);

      stepIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 150);
    };

    animate();
  };

  const resetSearch = () => {
    stopSearch();
    setCurrentStep(-1);
    setMatches([]);
    setMatchSteps([]);
  };

  const loadSample = (type: keyof typeof SAMPLE_TEXTS) => {
    setText(SAMPLE_TEXTS[type]);
    setPattern(SAMPLE_PATTERNS[type]);
    resetSearch();
  };

  const getCharColor = (charIndex: number, isPattern: boolean = false) => {
    if (currentStep < 0 || !matchSteps[currentStep]) return '';

    const step = matchSteps[currentStep];
    
    if (isPattern) {
      if (charIndex === step.patternIndex) {
        if (step.action === 'match') return 'bg-green-200 text-green-800';
        if (step.action === 'mismatch') return 'bg-red-200 text-red-800';
        if (step.action === 'found') return 'bg-purple-200 text-purple-800';
        return 'bg-yellow-200 text-yellow-800';
      }
      return 'bg-blue-100 text-blue-800';
    } else {
      // Text character
      if (matches.some(match => charIndex >= match && charIndex < match + pattern.length)) {
        return 'bg-purple-200 text-purple-800 font-bold';
      }
      
      if (charIndex === step.textIndex) {
        if (step.action === 'match') return 'bg-green-200 text-green-800';
        if (step.action === 'mismatch') return 'bg-red-200 text-red-800';
        if (step.action === 'found') return 'bg-purple-200 text-purple-800';
        return 'bg-yellow-200 text-yellow-800';
      }
      
      // Check if character is part of current pattern position
      const patternStart = step.patternStart;
      if (charIndex >= patternStart && charIndex < patternStart + pattern.length) {
        return 'bg-blue-100 text-blue-800';
      }
    }
    
    return '';
  };

  const AlgorithmInfo = ({ algorithmKey }: { algorithmKey: string }) => {
    const info = ALGORITHM_INFO[algorithmKey as keyof typeof ALGORITHM_INFO];
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Nguyên lý
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {info.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Nguyên lý hoạt động:</h4>
              <p className="text-sm text-gray-700 mb-2">{info.principle}</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {info.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Phân tích:</h4>
              <p className="text-sm text-gray-700">{info.complexity}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ứng dụng thực tế:</h4>
              <p className="text-sm text-gray-700">{info.applications}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6" />
            String Pattern Matching Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Input Controls */}
          <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="text">Text (chuỗi chính)</Label>
                <Input
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isAnimating}
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="pattern">Pattern (chuỗi tìm kiếm)</Label>
                <Input
                  id="pattern"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  disabled={isAnimating}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => loadSample('simple')} variant="outline" size="sm">
                Simple Text
              </Button>
              <Button onClick={() => loadSample('dna')} variant="outline" size="sm">
                DNA Sequence
              </Button>
              <Button onClick={() => loadSample('english')} variant="outline" size="sm">
                English Text
              </Button>
            </div>
          </div>

          {/* Algorithm Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isAnimating}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, alg]) => (
                    <SelectItem key={key} value={key}>
                      {alg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Speed: {speed}</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-32"
              />
            </div>

            <div className="flex gap-2 items-end">
              <AlgorithmInfo algorithmKey={algorithm} />

              <Button
                onClick={startSearch}
                className={isAnimating ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isAnimating ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Search
                  </>
                )}
              </Button>

              <Button onClick={resetSearch} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Visualization */}
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual">Visual Matching</TabsTrigger>
              <TabsTrigger value="steps">Step-by-Step</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="space-y-6">
                  {/* Text display */}
                  <div>
                    <h4 className="font-semibold mb-2">Text:</h4>
                    <div className="flex flex-wrap gap-1 font-mono text-lg p-2 bg-gray-50 rounded">
                      {text.toUpperCase().split('').map((char, idx) => (
                        <span
                          key={idx}
                          className={`px-1 py-0.5 rounded min-w-[24px] text-center ${getCharColor(idx)}`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-sm text-gray-500 mt-1">
                      {text.split('').map((_, idx) => (
                        <span key={idx} className="px-1 min-w-[24px] text-center">
                          {idx}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pattern display */}
                  <div>
                    <h4 className="font-semibold mb-2">Pattern:</h4>
                    <div className="flex gap-1 font-mono text-lg p-2 bg-gray-50 rounded">
                      {pattern.toUpperCase().split('').map((char, idx) => (
                        <span
                          key={idx}
                          className={`px-1 py-0.5 rounded min-w-[24px] text-center ${getCharColor(idx, true)}`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Current step info */}
                  {currentStep >= 0 && matchSteps[currentStep] && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Current Step:</h4>
                      <p className="text-sm">{matchSteps[currentStep].description}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span>Step: {currentStep + 1}/{matchSteps.length}</span>
                        <span>Matches found: {matches.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="steps" className="mt-6">
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Algorithm Steps</h3>
                  <p className="text-sm text-gray-600">
                    {ALGORITHMS[algorithm as keyof typeof ALGORITHMS].description}
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {matchSteps.slice(0, currentStep + 1).map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 border-b ${
                        index === currentStep ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">Step {step.step}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          step.action === 'match' ? 'bg-green-100 text-green-800' :
                          step.action === 'found' ? 'bg-purple-100 text-purple-800' :
                          step.action === 'mismatch' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.action === 'match' ? 'Khớp' : 
                           step.action === 'found' ? 'Tìm thấy' :
                           step.action === 'mismatch' ? 'Không khớp' : 'Dịch chuyển'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  ))}
                  
                  {matchSteps.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click &quot;Start Search&quot; to see algorithm steps</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StringMatchingVisualizer;
