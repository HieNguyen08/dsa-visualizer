# Advanced Sorting Algorithms Development Plan

## 🔄 Additional Sorting Algorithms to Implement

### 1. **Radix Sort** - Thuật toán sắp xếp theo cơ số
```typescript
// Features to implement:
- Digit-by-digit visualization
- Multiple passes demonstration
- Counting sort for each digit
- Best for integer arrays
- O(d×n) time complexity visualization
```

### 2. **Bucket Sort** - Sắp xếp theo nhóm
```typescript
// Features to implement:
- Bucket distribution visualization
- Individual bucket sorting
- Merge buckets animation
- Good for uniform distribution
- Average O(n + k) complexity
```

### 3. **Shell Sort** - Cải tiến của Insertion Sort
```typescript
// Features to implement:
- Gap sequence visualization (Knuth, Ciura, etc.)
- Multiple gap phases
- Insertion sort within gaps
- Gap reduction animation
- Better than O(n²) in practice
```

### 4. **Tim Sort** - Python's built-in sort
```typescript
// Features to implement:
- Run detection (ascending/descending sequences)
- Merge optimization
- Galloping mode
- Binary insertion sort for small runs
- Real-world hybrid algorithm
```

### 5. **Cycle Sort** - Minimum writes algorithm
```typescript
// Features to implement:
- Cycle detection and formation
- Minimum memory writes
- Position calculation
- Good for memory-constrained systems
- O(n²) but minimal writes
```

### 6. **Pancake Sort** - Fun algorithm
```typescript
// Features to implement:
- Flip operation visualization
- Finding largest element
- Stack-like flipping animation
- Fun educational tool
- O(n²) but interesting approach
```

### 7. **Strand Sort** - Recursive merging
```typescript
// Features to implement:
- Strand extraction
- Recursive merging
- Linked list visualization
- Good for partially sorted data
- O(n²) worst case, O(n) best case
```

## 🎨 Enhanced Sorting Visualizer Features

### Multi-Algorithm Comparison
- Split screen comparison of 2-4 algorithms
- Same dataset, different algorithms
- Performance metrics side-by-side
- Speed adjustment for each algorithm independently

### Advanced Visualization Modes
- **3D Bar Chart**: Height-based 3D representation
- **Circle Sort**: Arrange elements in a circle
- **Sound Visualization**: Different tones for different values
- **Color Gradient**: Smooth color transitions
- **Particle System**: Elements as animated particles

### Interactive Features
- **Custom Input**: User-defined arrays
- **Pattern Generation**: Various data patterns (reversed, nearly sorted, random, etc.)
- **Algorithm Racing**: Multiple algorithms compete
- **Step-by-step Mode**: Manual control of each step
- **Complexity Analysis**: Real-time big-O visualization

### Educational Enhancements
- **Algorithm Explanation**: Detailed steps and theory
- **Code Display**: Show actual implementation alongside
- **Complexity Graph**: Time/space complexity charts
- **Historical Context**: Who invented, when, why
- **Use Cases**: When to use each algorithm
