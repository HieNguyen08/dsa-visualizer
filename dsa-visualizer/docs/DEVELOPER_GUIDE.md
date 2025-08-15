# 👨‍💻 Developer Guide - DSA Visualizer

Hướng dẫn chi tiết cho developers làm việc với DSA Visualizer codebase.

## 📋 Mục lục

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Code Organization](#code-organization)
- [Component Development](#component-development)
- [Algorithm Integration](#algorithm-integration)
- [State Management](#state-management)
- [Performance Guidelines](#performance-guidelines)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend: Next.js 15 + TypeScript + Tailwind CSS
Components: Radix UI + Shadcn/ui
Icons: Lucide React
Bundler: Turbopack (Next.js 15)
Styling: Tailwind CSS + PostCSS
```

### Project Structure Deep Dive

```
dsa-visualizer/
├── src/
│   ├── app/                         # Next.js 15 App Router
│   │   ├── dashboard/              # Dashboard pages
│   │   │   └── page.tsx           # Main dashboard
│   │   ├── sorting/               # Sorting algorithms
│   │   │   └── page.tsx          # Sorting comparison page
│   │   ├── pathfinding/          # Pathfinding page
│   │   │   └── page.tsx         # Grid-based pathfinding
│   │   ├── visualizer/          # Individual visualizers
│   │   │   ├── [algorithm]/     # Dynamic algorithm pages
│   │   │   ├── binary-tree/    # Binary tree visualizer
│   │   │   ├── avl-tree/       # AVL tree visualizer
│   │   │   ├── trie/           # Trie visualizer
│   │   │   ├── bloom-filter/   # Bloom filter visualizer
│   │   │   └── ...            # Other visualizers
│   │   ├── globals.css        # Global styles & Tailwind imports
│   │   ├── layout.tsx         # Root layout with navigation
│   │   └── page.tsx          # Landing page
│   ├── components/              # React components
│   │   ├── landing/           # Landing page components
│   │   │   ├── hero.tsx      # Hero section
│   │   │   ├── features.tsx  # Features showcase
│   │   │   ├── tech-stack.tsx # Technology stack
│   │   │   └── cta.tsx       # Call to action
│   │   ├── navigation/       # Navigation components
│   │   │   └── navbar.tsx   # Main navigation
│   │   ├── shared/          # Shared components
│   │   │   ├── algorithm-principle.tsx # Algorithm info modal
│   │   │   └── mode-toggle.tsx        # Dark/light theme
│   │   ├── ui/             # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   └── visualizers/   # Algorithm visualizer components
│   │       ├── sorting-visualizer.tsx
│   │       ├── binary-tree-visualizer.tsx
│   │       ├── pathfinding-visualizer.tsx
│   │       └── ...
│   ├── hooks/            # Custom React hooks
│   │   └── use-mobile.ts # Mobile detection hook
│   └── lib/             # Utility functions
│       └── utils.ts    # General utilities (cn, etc.)
├── public/             # Static assets
│   ├── file.svg       # File icon
│   ├── globe.svg      # Globe icon
│   ├── next.svg       # Next.js logo
│   ├── vercel.svg     # Vercel logo
│   └── window.svg     # Window icon
└── docs/              # Documentation
    ├── CONTRIBUTING.md
    ├── DEVELOPER_GUIDE.md
    └── ...
```

## ⚙️ Development Setup

### Prerequisites
```bash
# Required versions
Node.js >= 18.17.0
npm >= 9.0.0
Git latest
```

### Environment Setup

1. **Clone và Install**
```bash
git clone [repository-url]
cd dsa-visualizer/dsa-visualizer
npm install
```

2. **Environment Variables**
```bash
# Create .env.local file
cp .env.example .env.local

# Add your environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

3. **Development Commands**
```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build

# Start production server
npm start
```

### VSCode Configuration

Tạo `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "\"([^\"]*)\""]
  ]
}
```

## 📁 Code Organization

### File Naming Conventions

```
Components: PascalCase.tsx (AlgorithmPrinciple.tsx)
Pages: page.tsx (Next.js 15 convention)  
Types: camelCase.ts (algorithmTypes.ts)
Hooks: use-kebab-case.ts (use-mobile.ts)
Utils: kebab-case.ts (array-utils.ts)
```

### Import Order

```typescript
// 1. React và Next.js imports
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// 3. Internal imports
import { AlgorithmPrinciple } from '@/components/shared/algorithm-principle';
import { useLocalStorage } from '@/hooks/use-local-storage';

// 4. Types và constants
import type { AlgorithmStep } from './types';
import { ANIMATION_SPEED } from './constants';
```

### Component Structure Template

```typescript
// components/visualizers/example-visualizer.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
interface ExampleStep {
  description: string;
  data: number[];
  highlightedIndices: number[];
  operation: 'compare' | 'swap' | 'complete';
}

interface ExampleVisualizerProps {
  initialData?: number[];
  speed?: number;
  onComplete?: () => void;
}

// Component
export function ExampleVisualizer({ 
  initialData = [64, 34, 25, 12, 22, 11, 90],
  speed = 500,
  onComplete 
}: ExampleVisualizerProps) {
  // State
  const [data, setData] = useState<number[]>(initialData);
  const [steps, setSteps] = useState<ExampleStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Algorithm implementation
  const runAlgorithm = useCallback(() => {
    const newSteps: ExampleStep[] = [];
    const workingData = [...data];
    
    // Algorithm logic here
    // Push steps to newSteps array
    
    setSteps(newSteps);
    setCurrentStep(0);
  }, [data]);

  // Effects
  useEffect(() => {
    runAlgorithm();
  }, [runAlgorithm]);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      onComplete?.();
    }
  }, [isPlaying, currentStep, steps.length, speed, onComplete]);

  // Event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Render
  const currentStepData = steps[currentStep];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Algorithm</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex gap-2 mb-4">
          <Button onClick={handlePlay} disabled={isPlaying}>
            Play
          </Button>
          <Button onClick={handlePause} disabled={!isPlaying}>
            Pause
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>

        {/* Visualization */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {currentStepData?.description || 'Ready to start'}
          </div>
          
          <div className="flex gap-1 justify-center">
            {data.map((value, index) => (
              <div
                key={index}
                className={`
                  w-12 h-12 flex items-center justify-center rounded
                  transition-colors duration-200
                  ${currentStepData?.highlightedIndices?.includes(index)
                    ? 'bg-blue-200 border-blue-500'
                    : 'bg-gray-100 border-gray-300'
                  }
                  border-2
                `}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🧩 Component Development

### Algorithm Visualizer Development

#### 1. Planning Phase
- Identify algorithm steps
- Design state structure
- Plan user interactions
- Consider performance implications

#### 2. Implementation Steps

```typescript
// Step 1: Define interfaces
interface AlgorithmStep {
  description: string;
  data: any[];
  highlightedElements: number[];
  operation: string;
  metadata?: Record<string, any>;
}

// Step 2: Implement algorithm logic
const implementAlgorithm = (inputData: number[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  // Algorithm implementation with step tracking
  return steps;
};

// Step 3: Create visualization component
const VisualizationDisplay = ({ step }: { step: AlgorithmStep }) => {
  // Visual representation of current step
};

// Step 4: Add controls
const Controls = ({ onPlay, onPause, onReset, isPlaying }: ControlProps) => {
  // Play, pause, reset, speed controls
};

// Step 5: Combine in main component
const AlgorithmVisualizer = () => {
  // State management và lifecycle
  return (
    <>
      <Controls {...controlProps} />
      <VisualizationDisplay step={currentStep} />
    </>
  );
};
```

#### 3. Adding Algorithm Principle Button

```typescript
// In your visualizer page
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

// Add to header section
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
  <div className="flex items-center gap-3 mb-4">
    <IconComponent className="h-8 w-8 text-blue-600" />
    <h1 className="text-3xl font-bold text-gray-900">Algorithm Name</h1>
  </div>
  <div className="mb-4 sm:mb-0">
    <AlgorithmPrinciple 
      title="Algorithm Name"
      description="Brief description of the algorithm"
      timeComplexity={{
        best: "O(n log n)",
        average: "O(n log n)", 
        worst: "O(n²)"
      }}
      spaceComplexity="O(log n)"
      principles={[
        "Key principle 1",
        "Key principle 2", 
        "Key principle 3"
      ]}
      applications={[
        "Real world application 1",
        "Real world application 2"
      ]}
      advantages={[
        "Advantage 1",
        "Advantage 2"
      ]}
    />
  </div>
</div>
```

### UI Component Guidelines

#### Responsive Design Pattern

```typescript
// Use Tailwind responsive prefixes
<div className="
  grid grid-cols-1           // Mobile: single column
  md:grid-cols-2             // Tablet: two columns  
  lg:grid-cols-3             // Desktop: three columns
  xl:grid-cols-4             // Large: four columns
  gap-4                      // Consistent spacing
">
  {items.map(item => (
    <Card key={item.id} className="
      p-4                    // Padding
      hover:shadow-lg        // Hover effect
      transition-shadow      // Smooth transition
      duration-200           // Animation timing
    ">
      {/* Card content */}
    </Card>
  ))}
</div>
```

#### Animation Patterns

```typescript
// CSS transitions for smooth animations
const animationClasses = {
  enter: "transition-all duration-300 ease-in-out",
  highlight: "bg-blue-200 border-blue-500 scale-105",
  normal: "bg-gray-100 border-gray-300 scale-100",
  complete: "bg-green-200 border-green-500"
};

// Use with conditional classes
<div className={`
  ${animationClasses.enter}
  ${isHighlighted ? animationClasses.highlight : animationClasses.normal}
`}>
```

## 📊 State Management

### Local State Pattern

```typescript
// Use useState for component-specific state
const [visualizerState, setVisualizerState] = useState({
  data: initialData,
  steps: [],
  currentStep: 0,
  isPlaying: false,
  speed: 500
});

// Update state immutably
const updateVisualizerState = (updates: Partial<VisualizerState>) => {
  setVisualizerState(prev => ({ ...prev, ...updates }));
};
```

### Global State (Future)

```typescript
// For user preferences, progress, etc.
// Consider Zustand or Context API for global state

interface UserState {
  completedAlgorithms: string[];
  preferences: {
    theme: 'light' | 'dark';
    defaultSpeed: number;
    language: 'vi' | 'en';
  };
  progress: {
    totalTime: number;
    algorithmsLearned: number;
  };
}
```

## ⚡ Performance Guidelines

### Optimization Strategies

#### 1. Minimize Re-renders

```typescript
// Use useCallback for event handlers
const handlePlay = useCallback(() => {
  setIsPlaying(true);
}, []);

// Use useMemo for expensive calculations  
const processedData = useMemo(() => {
  return data.map(processDataItem);
}, [data]);

// Memoize components when appropriate
const MemoizedVisualization = memo(({ step }: { step: AlgorithmStep }) => {
  return <div>{/* Visualization */}</div>;
});
```

#### 2. Efficient Animations

```typescript
// Use CSS transforms instead of changing layout properties
// ✅ Good - uses transform
<div style={{
  transform: `translateX(${position}px) scale(${scale})`,
  transition: 'transform 200ms ease'
}} />

// ❌ Bad - triggers layout
<div style={{
  left: `${position}px`,
  width: `${width}px`,
  transition: 'all 200ms ease'  
}} />
```

#### 3. Data Structure Optimization

```typescript
// Use efficient data structures for algorithms
// ✅ Good - Map for O(1) lookups
const visited = new Map<string, boolean>();

// ❌ Bad - Array.includes is O(n)
const visited: string[] = [];
if (visited.includes(nodeId)) { /* ... */ }
```

## 🧪 Testing Strategy

### Component Testing Pattern

```typescript
// __tests__/components/sorting-visualizer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SortingVisualizer } from '../sorting-visualizer';

describe('SortingVisualizer', () => {
  it('renders initial data correctly', () => {
    const initialData = [64, 34, 25];
    render(<SortingVisualizer initialData={initialData} />);
    
    initialData.forEach(value => {
      expect(screen.getByText(value.toString())).toBeInTheDocument();
    });
  });

  it('starts animation when play button is clicked', () => {
    render(<SortingVisualizer />);
    
    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);
    
    expect(playButton).toBeDisabled();
  });
});
```

### Algorithm Logic Testing

```typescript
// __tests__/algorithms/bubble-sort.test.ts
import { bubbleSort } from '../algorithms/bubble-sort';

describe('Bubble Sort Algorithm', () => {
  it('sorts array correctly', () => {
    const input = [64, 34, 25, 12, 22, 11, 90];
    const expected = [11, 12, 22, 25, 34, 64, 90];
    
    const steps = bubbleSort(input);
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep.data).toEqual(expected);
  });

  it('generates correct number of steps', () => {
    const input = [3, 2, 1];
    const steps = bubbleSort(input);
    
    // Should have multiple steps for visualization
    expect(steps.length).toBeGreaterThan(1);
  });
});
```

## 🚀 Deployment

### Build Optimization

```javascript
// next.config.ts
const nextConfig = {
  output: 'standalone', // For Docker deployment
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['example.com'], // Add external image domains
  },
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundleAnalyzer: {
        enabled: true,
      },
    },
  }),
};
```

### Environment Variables

```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ANALYTICS_ID=your-production-analytics-id

# .env.local (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=your-dev-analytics-id
```

### Docker Support (Future)

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder  
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## 📋 Development Checklist

### Before Starting Development
- [ ] Read codebase overview
- [ ] Understand component patterns  
- [ ] Set up development environment
- [ ] Run existing tests
- [ ] Check responsive design on different devices

### Before Submitting PR
- [ ] TypeScript compilation passes
- [ ] Lint checks pass  
- [ ] Manual testing completed
- [ ] Responsive design verified
- [ ] Accessibility tested
- [ ] Performance impact assessed
- [ ] Documentation updated

### For New Visualizers
- [ ] Algorithm principle button added
- [ ] Vietnamese translations complete
- [ ] Interactive controls working
- [ ] Animation speed adjustable
- [ ] Step-by-step explanation clear
- [ ] Error handling implemented
- [ ] Edge cases covered

---

Happy coding! 🚀 

Nếu có questions, đừng ngần ngại tạo issue hoặc liên hệ maintainers.
