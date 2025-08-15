"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, RotateCcw, ArrowLeft, ArrowRight, Square, Calculator } from 'lucide-react';

// --- Constants ---
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_SPEED = 5;

// --- Types ---
interface ConversionStep {
  step: number;
  currentChar: string;
  stack: string[];
  output: string[];
  description: string;
  action: 'push' | 'pop' | 'output' | 'scan';
  reasoning: string;
}

interface Animation {
  type: 'scan' | 'push' | 'pop' | 'output' | 'complete';
  character?: string;
  stack: string[];
  output: string[];
  currentIndex: number;
  description: string;
}

// --- Helper Functions ---
const isOperator = (char: string): boolean => {
  return ['+', '-', '*', '/', '^'].includes(char);
};

const isOperand = (char: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(char);
};

const getPrecedence = (operator: string): number => {
  switch (operator) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    case '^':
      return 3;
    default:
      return 0;
  }
};

const isRightAssociative = (operator: string): boolean => {
  return operator === '^';
};

const validateExpression = (expression: string): { valid: boolean; error?: string } => {
  if (!expression.trim()) {
    return { valid: false, error: 'Expression cannot be empty' };
  }
  
  const cleanExpr = expression.replace(/\s/g, '');
  
  // Check for valid characters
  for (const char of cleanExpr) {
    if (!isOperand(char) && !isOperator(char) && char !== '(' && char !== ')') {
      return { valid: false, error: `Invalid character: ${char}` };
    }
  }
  
  // Check for balanced parentheses
  let parenthesesCount = 0;
  for (const char of cleanExpr) {
    if (char === '(') parenthesesCount++;
    if (char === ')') parenthesesCount--;
    if (parenthesesCount < 0) {
      return { valid: false, error: 'Mismatched closing parenthesis' };
    }
  }
  
  if (parenthesesCount !== 0) {
    return { valid: false, error: 'Mismatched parentheses' };
  }
  
  // Check for consecutive operators
  for (let i = 0; i < cleanExpr.length - 1; i++) {
    if (isOperator(cleanExpr[i]) && isOperator(cleanExpr[i + 1])) {
      return { valid: false, error: 'Consecutive operators are not allowed' };
    }
  }
  
  // Check if starts or ends with operator (except for unary minus)
  if (isOperator(cleanExpr[0]) && cleanExpr[0] !== '-') {
    return { valid: false, error: 'Expression cannot start with an operator' };
  }
  
  if (isOperator(cleanExpr[cleanExpr.length - 1])) {
    return { valid: false, error: 'Expression cannot end with an operator' };
  }
  
  return { valid: true };
};

// --- Algorithm Implementation ---
const infixToPostfix = (infix: string): ConversionStep[] => {
  const steps: ConversionStep[] = [];
  const stack: string[] = [];
  const output: string[] = [];
  const expression = infix.replace(/\s/g, ''); // Remove spaces
  let stepCounter = 1;
  
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    
    if (isOperand(char)) {
      // Add operand to output
      output.push(char);
      steps.push({
        step: stepCounter++,
        currentChar: char,
        stack: [...stack],
        output: [...output],
        description: `Add operand '${char}' to output`,
        action: 'output',
        reasoning: 'Operands are directly added to the output queue'
      });
    } else if (char === '(') {
      // Push opening parenthesis to stack
      stack.push(char);
      steps.push({
        step: stepCounter++,
        currentChar: char,
        stack: [...stack],
        output: [...output],
        description: `Push opening parenthesis '(' to stack`,
        action: 'push',
        reasoning: 'Opening parentheses mark the start of a sub-expression'
      });
    } else if (char === ')') {
      // Pop operators until opening parenthesis
      steps.push({
        step: stepCounter++,
        currentChar: char,
        stack: [...stack],
        output: [...output],
        description: `Encountered closing parenthesis ')'`,
        action: 'scan',
        reasoning: 'Need to pop all operators until matching opening parenthesis'
      });
      
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        const operator = stack.pop()!;
        output.push(operator);
        steps.push({
          step: stepCounter++,
          currentChar: char,
          stack: [...stack],
          output: [...output],
          description: `Pop operator '${operator}' from stack to output`,
          action: 'pop',
          reasoning: 'Pop operators until opening parenthesis is found'
        });
      }
      
      // Remove the opening parenthesis
      if (stack.length > 0) {
        stack.pop();
        steps.push({
          step: stepCounter++,
          currentChar: char,
          stack: [...stack],
          output: [...output],
          description: `Remove matching opening parenthesis '(' from stack`,
          action: 'pop',
          reasoning: 'Matching parentheses are discarded after processing'
        });
      }
    } else if (isOperator(char)) {
      // Pop operators with higher or equal precedence (considering associativity)
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        isOperator(stack[stack.length - 1]) &&
        (
          getPrecedence(stack[stack.length - 1]) > getPrecedence(char) ||
          (getPrecedence(stack[stack.length - 1]) === getPrecedence(char) && !isRightAssociative(char))
        )
      ) {
        const operator = stack.pop()!;
        output.push(operator);
        steps.push({
          step: stepCounter++,
          currentChar: char,
          stack: [...stack],
          output: [...output],
          description: `Pop operator '${operator}' (higher precedence) from stack to output`,
          action: 'pop',
          reasoning: `Operator '${operator}' has higher precedence than '${char}' or same precedence with left associativity`
        });
      }
      
      // Push current operator to stack
      stack.push(char);
      steps.push({
        step: stepCounter++,
        currentChar: char,
        stack: [...stack],
        output: [...output],
        description: `Push operator '${char}' to stack`,
        action: 'push',
        reasoning: 'Current operator has lower precedence or is right associative'
      });
    }
  }
  
  // Pop remaining operators
  while (stack.length > 0) {
    const operator = stack.pop()!;
    output.push(operator);
    steps.push({
      step: stepCounter++,
      currentChar: '',
      stack: [...stack],
      output: [...output],
      description: `Pop remaining operator '${operator}' from stack to output`,
      action: 'pop',
      reasoning: 'All remaining operators in stack are popped to output'
    });
  }
  
  return steps;
};

const getAnimations = (steps: ConversionStep[]): Animation[] => {
  const animations: Animation[] = [];
  
  steps.forEach((step, index) => {
    animations.push({
      type: step.action === 'output' ? 'output' : 
            step.action === 'push' ? 'push' : 
            step.action === 'pop' ? 'pop' : 'scan',
      character: step.currentChar,
      stack: [...step.stack],
      output: [...step.output],
      currentIndex: index,
      description: step.description
    });
  });
  
  animations.push({
    type: 'complete',
    stack: [],
    output: steps[steps.length - 1]?.output || [],
    currentIndex: steps.length,
    description: 'Conversion completed!'
  });
  
  return animations;
};

// --- Main Component ---
const InfixToPostfixVisualizer = () => {
  // --- State Management ---
  const [inputExpression, setInputExpression] = useState<string>('A+B*C');
  const [steps, setSteps] = useState<ConversionStep[]>([]);
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
  const processExpression = useCallback(() => {
    const validation = validateExpression(inputExpression);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid expression');
      return;
    }
    
    setValidationError('');
    const conversionSteps = infixToPostfix(inputExpression);
    const animationSteps = getAnimations(conversionSteps);
    
    setSteps(conversionSteps);
    setAnimations(animationSteps);
    setCurrentStep(-1);
    setStepIndex(-1);
  }, [inputExpression]);
  
  useEffect(() => {
    processExpression();
  }, [processExpression]);
  
  const startAnimation = () => {
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    if (animations.length === 0) {
      processExpression();
      return;
    }
    
    setIsAnimating(true);
    setCurrentStep(-1);
    animateConversion();
  };
  
  const animateConversion = () => {
    let animationIndex = 0;
    
    const animate = () => {
      if (animationIndex >= animations.length) {
        setIsAnimating(false);
        setCurrentStep(animations.length - 1);
        return;
      }
      
      setCurrentStep(animationIndex);
      animationIndex++;
      animationTimeoutRef.current = setTimeout(animate, (11 - speedRef.current) * 150);
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
  
  const predefinedExpressions = [
    'A+B*C',
    'A+B*C-D',
    'A*(B+C)',
    '(A+B)*(C+D)',
    'A+B*C^D',
    'A^B^C',
    '(A+B)*(C-D)/(E+F)'
  ];
  
  // --- Render Functions ---
  const renderExpression = (expression: string, currentIndex: number = -1) => {
    return (
      <div className="flex justify-center gap-1 mb-4">
        {expression.replace(/\s/g, '').split('').map((char, index) => (
          <div
            key={index}
            className={`
              px-3 py-2 rounded border-2 font-mono font-bold text-lg
              ${index === currentIndex ? 'bg-yellow-200 border-yellow-400' : 'bg-white border-gray-300'}
            `}
          >
            {char}
          </div>
        ))}
      </div>
    );
  };
  
  const renderStack = (stack: string[]) => {
    return (
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-center">Stack (LIFO)</h4>
        <div className="flex flex-col-reverse gap-1 min-h-[200px] justify-end">
          {stack.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-purple-500 text-white rounded font-mono font-bold text-center"
              style={{
                animation: index === stack.length - 1 ? 'pulse 0.5s' : undefined
              }}
            >
              {item}
            </div>
          ))}
          {stack.length === 0 && (
            <div className="text-gray-400 text-center italic">Empty</div>
          )}
        </div>
        <div className="text-xs text-center mt-2 text-gray-600">
          Top → Bottom
        </div>
      </div>
    );
  };
  
  const renderOutput = (output: string[]) => {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-center">Output Queue</h4>
        <div className="flex flex-wrap gap-1 min-h-[60px] items-center justify-center">
          {output.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-green-500 text-white rounded font-mono font-bold"
              style={{
                animation: index === output.length - 1 ? 'pulse 0.5s' : undefined
              }}
            >
              {item}
            </div>
          ))}
          {output.length === 0 && (
            <div className="text-gray-400 text-center italic">Empty</div>
          )}
        </div>
        <div className="text-xs text-center mt-2 text-gray-600">
          Postfix Expression: {output.join(' ') || 'Not ready'}
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
            Infix to Postfix Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Infix Expression:</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={inputExpression}
                onChange={(e) => setInputExpression(e.target.value)}
                placeholder="Enter infix expression (e.g., A+B*C)"
                disabled={isAnimating}
                className={validationError ? 'border-red-500' : ''}
              />
              <Button onClick={processExpression} disabled={isAnimating} variant="outline">
                Process
              </Button>
            </div>
            
            {validationError && (
              <p className="text-red-500 text-sm mb-2">{validationError}</p>
            )}
            
            {/* Predefined Examples */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium">Examples:</span>
              {predefinedExpressions.map((expr, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  disabled={isAnimating}
                  onClick={() => setInputExpression(expr)}
                  className="text-xs"
                >
                  {expr}
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
                    Start Animation
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

          {/* Expression Display */}
          {steps.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-center">Input Expression</h4>
              {renderExpression(inputExpression, 
                isStepByStep && stepIndex >= 0 ? 
                  steps[stepIndex]?.currentChar ? inputExpression.replace(/\s/g, '').indexOf(steps[stepIndex].currentChar) : -1 :
                  isAnimating && currentStep >= 0 && animations[currentStep] ? 
                    animations[currentStep].character ? inputExpression.replace(/\s/g, '').indexOf(animations[currentStep].character || '') : -1 : -1
              )}
            </div>
          )}

          {/* Visualization */}
          {steps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {renderStack(
                isStepByStep && stepIndex >= 0 ? steps[stepIndex].stack :
                isAnimating && currentStep >= 0 && animations[currentStep] ? animations[currentStep].stack :
                []
              )}
              {renderOutput(
                isStepByStep && stepIndex >= 0 ? steps[stepIndex].output :
                isAnimating && currentStep >= 0 && animations[currentStep] ? animations[currentStep].output :
                []
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
                  
                  {/* Current state */}
                  <div className="mt-2 text-sm">
                    <div><strong>Current Character:</strong> {steps[stepIndex].currentChar || 'End of expression'}</div>
                    <div><strong>Action:</strong> {steps[stepIndex].action}</div>
                    <div><strong>Stack:</strong> [{steps[stepIndex].stack.join(', ')}]</div>
                    <div><strong>Output:</strong> [{steps[stepIndex].output.join(', ')}]</div>
                  </div>
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
                        <th className="p-1">Char</th>
                        <th className="p-1">Action</th>
                        <th className="p-1">Stack</th>
                        <th className="p-1">Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.slice(0, isStepByStep ? stepIndex + 1 : isAnimating ? currentStep + 1 : steps.length).map((step, index) => (
                        <tr key={index} className={`border-b ${
                          (isStepByStep && index === stepIndex) || (isAnimating && index === currentStep) 
                            ? 'bg-blue-100 font-semibold' : ''
                        }`}>
                          <td className="p-1">{step.step}</td>
                          <td className="p-1 font-mono">{step.currentChar || '-'}</td>
                          <td className="p-1 capitalize">{step.action}</td>
                          <td className="p-1 font-mono">[{step.stack.join(',')}]</td>
                          <td className="p-1 font-mono">[{step.output.join(',')}]</td>
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
            <h3 className="font-semibold mb-2">About Infix to Postfix Conversion</h3>
            <p className="text-sm text-gray-600 mb-2">
              The infix to postfix conversion uses a stack-based algorithm to convert expressions from infix notation 
              (where operators are between operands) to postfix notation (where operators follow their operands).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Algorithm Steps:</span>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Scan expression from left to right</li>
                  <li>If operand: add to output</li>
                  <li>If &apos;(&apos;: push to stack</li>
                  <li>If &apos;)&apos;: pop until &apos;(&apos; found</li>
                  <li>If operator: pop higher precedence operators, then push</li>
                  <li>Pop remaining operators</li>
                </ol>
              </div>
              <div>
                <span className="font-medium">Operator Precedence:</span>
                <div className="mt-1 space-y-1">
                  <div>^ (Power): Highest (Right associative)</div>
                  <div>*, / (Multiply, Divide): Medium</div>
                  <div>+, - (Add, Subtract): Lowest</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <span className="font-medium">Time Complexity:</span> O(n) where n is the length of the expression
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfixToPostfixVisualizer;
