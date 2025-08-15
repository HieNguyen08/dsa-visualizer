"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, RotateCcw, ArrowLeft, ArrowRight, Square, Calculator, X } from 'lucide-react';

// --- Constants ---
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_SPEED = 5;

// --- Types ---
interface Term {
  coefficient: number;
  exponent: number;
}

interface MultiplicationStep {
  step: number;
  term1: Term;
  term2: Term;
  result: Term;
  description: string;
  reasoning: string;
  currentPoly1: Term[];
  currentPoly2: Term[];
  resultPoly: Term[];
}

interface Animation {
  type: 'multiply' | 'add' | 'complete';
  step: number;
  term1?: Term;
  term2?: Term;
  result?: Term;
  description: string;
  highlightTerm1?: number;
  highlightTerm2?: number;
  resultPoly: Term[];
}

// --- Helper Functions ---
const parsePoly = (polyStr: string): Term[] => {
  if (!polyStr.trim()) return [];
  
  // Remove spaces and convert to lowercase
  const cleanStr = polyStr.replace(/\s/g, '').toLowerCase();
  
  // Split by + and - while keeping the signs
  const terms: string[] = [];
  let currentTerm = '';
  
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    if ((char === '+' || char === '-') && i > 0) {
      if (currentTerm) terms.push(currentTerm);
      currentTerm = char;
    } else {
      currentTerm += char;
    }
  }
  if (currentTerm) terms.push(currentTerm);
  
  return terms.map(term => {
    // Parse coefficient and exponent
    let coeff = 1;
    let exp = 0;
    
    // Handle negative terms
    if (term.startsWith('-')) {
      coeff = -1;
      term = term.substring(1);
    } else if (term.startsWith('+')) {
      term = term.substring(1);
    }
    
    // Check if term contains x
    if (term.includes('x')) {
      const parts = term.split('x');
      
      // Coefficient part
      if (parts[0] === '' || parts[0] === '+') {
        coeff = coeff * 1;
      } else if (parts[0] === '-') {
        coeff = coeff * -1;
      } else {
        coeff = coeff * parseFloat(parts[0]) || 1;
      }
      
      // Exponent part
      if (parts[1] === '') {
        exp = 1;
      } else if (parts[1].startsWith('^')) {
        exp = parseInt(parts[1].substring(1)) || 0;
      } else {
        exp = 1;
      }
    } else {
      // Constant term
      coeff = coeff * (parseFloat(term) || 0);
      exp = 0;
    }
    
    return { coefficient: coeff, exponent: exp };
  }).filter(term => term.coefficient !== 0);
};

const formatPoly = (poly: Term[]): string => {
  if (poly.length === 0) return '0';
  
  return poly
    .sort((a, b) => b.exponent - a.exponent)
    .map((term, index) => {
      let termStr = '';
      
      // Add sign
      if (index === 0) {
        if (term.coefficient < 0) termStr += '-';
      } else {
        termStr += term.coefficient >= 0 ? ' + ' : ' - ';
      }
      
      const absCoeff = Math.abs(term.coefficient);
      
      // Add coefficient
      if (term.exponent === 0) {
        termStr += absCoeff.toString();
      } else if (absCoeff === 1) {
        // Don't show coefficient if it's 1 (except for constant terms)
      } else {
        termStr += absCoeff.toString();
      }
      
      // Add variable and exponent
      if (term.exponent > 0) {
        termStr += 'x';
        if (term.exponent > 1) {
          termStr += `^${term.exponent}`;
        }
      }
      
      return termStr;
    })
    .join('');
};

const multiplyPolynomials = (poly1: Term[], poly2: Term[]): MultiplicationStep[] => {
  const steps: MultiplicationStep[] = [];
  const resultTerms: { [key: number]: number } = {};
  let stepCounter = 1;
  
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const term1 = poly1[i];
      const term2 = poly2[j];
      
      const resultCoeff = term1.coefficient * term2.coefficient;
      const resultExp = term1.exponent + term2.exponent;
      const result: Term = { coefficient: resultCoeff, exponent: resultExp };
      
      // Add to result
      if (resultTerms[resultExp]) {
        resultTerms[resultExp] += resultCoeff;
      } else {
        resultTerms[resultExp] = resultCoeff;
      }
      
      const currentResult = Object.entries(resultTerms)
        .map(([exp, coeff]) => ({ coefficient: coeff, exponent: parseInt(exp) }))
        .filter(term => term.coefficient !== 0)
        .sort((a, b) => b.exponent - a.exponent);
      
      steps.push({
        step: stepCounter++,
        term1,
        term2,
        result,
        description: `Multiply ${formatTerm(term1)} × ${formatTerm(term2)} = ${formatTerm(result)}`,
        reasoning: `Multiply coefficients: ${term1.coefficient} × ${term2.coefficient} = ${resultCoeff}. Add exponents: ${term1.exponent} + ${term2.exponent} = ${resultExp}`,
        currentPoly1: [...poly1],
        currentPoly2: [...poly2],
        resultPoly: currentResult
      });
    }
  }
  
  return steps;
};

const formatTerm = (term: Term): string => {
  if (term.exponent === 0) return term.coefficient.toString();
  
  let result = '';
  if (Math.abs(term.coefficient) === 1) {
    if (term.coefficient === -1) result = '-';
  } else {
    result = term.coefficient.toString();
  }
  
  result += 'x';
  if (term.exponent > 1) {
    result += `^${term.exponent}`;
  }
  
  return result;
};

const getAnimations = (steps: MultiplicationStep[]): Animation[] => {
  const animations: Animation[] = [];
  
  steps.forEach((step, index) => {
    animations.push({
      type: 'multiply',
      step: index,
      term1: step.term1,
      term2: step.term2,
      result: step.result,
      description: step.description,
      highlightTerm1: step.currentPoly1.findIndex(t => t.coefficient === step.term1.coefficient && t.exponent === step.term1.exponent),
      highlightTerm2: step.currentPoly2.findIndex(t => t.coefficient === step.term2.coefficient && t.exponent === step.term2.exponent),
      resultPoly: step.resultPoly
    });
  });
  
  animations.push({
    type: 'complete',
    step: steps.length,
    description: 'Polynomial multiplication completed!',
    resultPoly: steps[steps.length - 1]?.resultPoly || []
  });
  
  return animations;
};

// --- Main Component ---
const PolynomialVisualizer = () => {
  // --- State Management ---
  const [poly1Input, setPoly1Input] = useState<string>('2x^2 + 3x + 1');
  const [poly2Input, setPoly2Input] = useState<string>('x + 2');
  const [poly1, setPoly1] = useState<Term[]>([]);
  const [poly2, setPoly2] = useState<Term[]>([]);
  const [steps, setSteps] = useState<MultiplicationStep[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [validationError, setValidationError] = useState<string>('');
  
  // Animation refs
  const speedRef = useRef<number>(speed);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update speed ref when speed changes
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  // --- Handlers ---
  const processPolynomials = useCallback(() => {
    try {
      const p1 = parsePoly(poly1Input);
      const p2 = parsePoly(poly2Input);
      
      if (p1.length === 0 || p2.length === 0) {
        setValidationError('Both polynomials must be non-empty');
        return;
      }
      
      setValidationError('');
      setPoly1(p1);
      setPoly2(p2);
      
      const multiplySteps = multiplyPolynomials(p1, p2);
      const animationSteps = getAnimations(multiplySteps);
      
      setSteps(multiplySteps);
      setAnimations(animationSteps);
      setCurrentStep(-1);
      setStepIndex(-1);
    } catch {
      setValidationError('Invalid polynomial format');
    }
  }, [poly1Input, poly2Input]);
  
  useEffect(() => {
    processPolynomials();
  }, [processPolynomials]);
  
  const startAnimation = () => {
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    if (animations.length === 0) {
      processPolynomials();
      return;
    }
    
    setIsAnimating(true);
    setCurrentStep(-1);
    animateMultiplication();
  };
  
  const animateMultiplication = () => {
    let animationIndex = 0;
    
    const animate = () => {
      if (animationIndex >= animations.length) {
        setIsAnimating(false);
        setCurrentStep(animations.length - 1);
        return;
      }
      
      setCurrentStep(animationIndex);
      animationIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 200);
    };
    
    animate();
  };
  
  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setCurrentStep(-1);
  };
  
  const resetAnimation = () => {
    stopAnimation();
    setCurrentStep(-1);
    setStepIndex(-1);
  };
  
  const toggleStepByStep = () => {
    setIsStepByStep(!isStepByStep);
    if (!isStepByStep && steps.length > 0) {
      setStepIndex(0);
    } else {
      setStepIndex(-1);
    }
  };
  
  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };
  
  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };
  
  const predefinedExamples = [
    { poly1: '2x^2 + 3x + 1', poly2: 'x + 2' },
    { poly1: 'x^2 + 1', poly2: 'x - 1' },
    { poly1: '3x + 2', poly2: '2x + 1' },
    { poly1: 'x^3 + x^2 + x + 1', poly2: 'x + 1' },
    { poly1: '2x^2 - 3x + 1', poly2: 'x^2 + x - 2' }
  ];
  
  // --- Render Functions ---
  const renderPolynomial = (poly: Term[], highlightIndex: number = -1) => {
    if (poly.length === 0) return <div className="text-gray-400 italic">Empty</div>;
    
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {poly.map((term, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-600">
                {term.coefficient >= 0 ? '+' : '-'}
              </span>
            )}
            <div
              className={`
                px-3 py-2 rounded border-2 font-mono font-bold
                ${index === highlightIndex ? 'bg-yellow-200 border-yellow-400' : 'bg-blue-50 border-blue-200'}
              `}
            >
              {formatTerm({ coefficient: Math.abs(term.coefficient), exponent: term.exponent })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderResult = (resultPoly: Term[]) => {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-center">Result Polynomial</h4>
        <div className="text-center">
          <div className="text-xl font-mono font-bold text-green-700">
            {formatPoly(resultPoly)}
          </div>
        </div>
        <div className="text-xs text-center mt-2 text-gray-600">
          Degree: {resultPoly.length > 0 ? Math.max(...resultPoly.map(t => t.exponent)) : 0}
        </div>
      </div>
    );
  };
  
  // --- Component Render ---
  return (
    <div className="w-full mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Polynomial Multiplication Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Polynomial:</label>
              <Input
                value={poly1Input}
                onChange={(e) => setPoly1Input(e.target.value)}
                placeholder="e.g., 2x^2 + 3x + 1"
                disabled={isAnimating}
                className={validationError ? 'border-red-500' : ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Second Polynomial:</label>
              <Input
                value={poly2Input}
                onChange={(e) => setPoly2Input(e.target.value)}
                placeholder="e.g., x + 2"
                disabled={isAnimating}
                className={validationError ? 'border-red-500' : ''}
              />
            </div>
          </div>
          
          {validationError && (
            <p className="text-red-500 text-sm mb-4">{validationError}</p>
          )}
          
          {/* Predefined Examples */}
          <div className="mb-6">
            <span className="text-sm font-medium mb-2 block">Examples:</span>
            <div className="flex flex-wrap gap-2">
              {predefinedExamples.map((example, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  disabled={isAnimating}
                  onClick={() => {
                    setPoly1Input(example.poly1);
                    setPoly2Input(example.poly2);
                  }}
                  className="text-xs"
                >
                  ({example.poly1}) × ({example.poly2})
                </Button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Speed: {speed}</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={1}
                className="w-32"
              />
            </div>
            
            <div className="flex gap-2 items-end">
              <Button onClick={processPolynomials} disabled={isAnimating} variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Process
              </Button>
              
              <Button 
                onClick={startAnimation} 
                disabled={isStepByStep || steps.length === 0} 
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
                    Start Multiplication
                  </>
                )}
              </Button>
              
              <Button onClick={resetAnimation} disabled={isAnimating} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <Button 
                onClick={toggleStepByStep} 
                disabled={isAnimating || steps.length === 0}
                variant={isStepByStep ? "default" : "outline"}
              >
                Step Mode
              </Button>
            </div>
          </div>

          {/* Step-by-step controls */}
          {isStepByStep && steps.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              <Button onClick={prevStep} disabled={stepIndex <= 0} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-4 text-sm font-medium">
                Step {Math.max(0, stepIndex) + 1} of {steps.length}
              </span>
              <Button onClick={nextStep} disabled={stepIndex >= steps.length - 1} variant="outline" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Polynomial Display */}
          {steps.length > 0 && (
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-semibold mb-2 text-center">First Polynomial</h4>
                {renderPolynomial(poly1, 
                  isStepByStep && stepIndex >= 0 ? 
                    steps[stepIndex] ? poly1.findIndex(t => t.coefficient === steps[stepIndex].term1.coefficient && t.exponent === steps[stepIndex].term1.exponent) : -1 :
                    isAnimating && currentStep >= 0 && animations[currentStep] ? 
                      animations[currentStep].highlightTerm1 || -1 : -1
                )}
              </div>
              
              <div className="text-center">
                <X className="w-6 h-6 mx-auto text-gray-600" />
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-center">Second Polynomial</h4>
                {renderPolynomial(poly2,
                  isStepByStep && stepIndex >= 0 ? 
                    steps[stepIndex] ? poly2.findIndex(t => t.coefficient === steps[stepIndex].term2.coefficient && t.exponent === steps[stepIndex].term2.exponent) : -1 :
                    isAnimating && currentStep >= 0 && animations[currentStep] ? 
                      animations[currentStep].highlightTerm2 || -1 : -1
                )}
              </div>
              
              <div className="text-center">
                <div className="w-full h-px bg-gray-300 mb-2"></div>
                <div className="text-lg font-bold text-gray-700">Result</div>
              </div>
              
              {renderResult(
                isStepByStep && stepIndex >= 0 && steps[stepIndex] ? steps[stepIndex].resultPoly :
                isAnimating && currentStep >= 0 && animations[currentStep] ? animations[currentStep].resultPoly :
                steps.length > 0 ? steps[steps.length - 1].resultPoly : []
              )}
            </div>
          )}

          {/* Current Step Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {/* Step Description */}
            <div className="space-y-4">
              {isAnimating && animations.length > 0 && currentStep >= 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Animation Progress</h4>
                  <p>
                    Step {currentStep + 1} of {animations.length}
                    <span className="block mt-1 font-medium text-blue-700">
                      {animations[currentStep]?.description}
                    </span>
                  </p>
                </div>
              )}
              
              {isStepByStep && steps.length > 0 && stepIndex >= 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Step-by-Step Mode</h4>
                  <p className="font-medium">
                    Step {stepIndex + 1}: {steps[stepIndex].description}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{steps[stepIndex].reasoning}</p>
                </div>
              )}
            </div>

            {/* Step Recording Table */}
            {steps.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <h4 className="font-semibold mb-2">Step Recording</h4>
                <div className="text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-1">Step</th>
                        <th className="p-1">Term 1</th>
                        <th className="p-1">Term 2</th>
                        <th className="p-1">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.slice(0, isStepByStep ? stepIndex + 1 : isAnimating ? currentStep + 1 : steps.length).map((step, index) => (
                        <tr key={index} className={`border-b ${
                          (isStepByStep && index === stepIndex) || (isAnimating && index === currentStep) 
                            ? 'bg-blue-100 font-semibold' : ''
                        }`}>
                          <td className="p-1">{step.step}</td>
                          <td className="p-1 font-mono">{formatTerm(step.term1)}</td>
                          <td className="p-1 font-mono">{formatTerm(step.term2)}</td>
                          <td className="p-1 font-mono">{formatTerm(step.result)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Algorithm Information */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2">About Polynomial Multiplication</h3>
            <p className="text-sm text-gray-600 mb-2">
              Polynomial multiplication follows the distributive property: each term in the first polynomial 
              is multiplied by each term in the second polynomial. Like terms are then combined.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Algorithm Steps:</span>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Multiply each term in first polynomial by each term in second</li>
                  <li>For each multiplication: multiply coefficients, add exponents</li>
                  <li>Collect all resulting terms</li>
                  <li>Combine like terms (same exponent)</li>
                  <li>Sort by descending exponent</li>
                </ol>
              </div>
              <div>
                <span className="font-medium">Rules:</span>
                <div className="mt-1 space-y-1">
                  <div>Coefficient: a × b = ab</div>
                  <div>Exponent: x^m × x^n = x^(m+n)</div>
                  <div>Like terms: ax^n + bx^n = (a+b)x^n</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <span className="font-medium">Time Complexity:</span> O(m × n) where m and n are the number of terms in each polynomial
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolynomialVisualizer;
