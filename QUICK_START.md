# 🚀 Quick Start cho Collaborators - DSA Visualizer

## 📋 Setup nhanh trong 5 phút

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/dsa-visualizer.git
cd dsa-visualizer/dsa-visualizer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Mở Browser
```
http://localhost:3000
```

## 🎯 Project Overview

**DSA Visualizer** là platform học tập thuật toán tương tác với:
- ✅ **24+ thuật toán** được việt hóa hoàn chỉnh
- ✅ **Interactive visualizations** với step-by-step animation  
- ✅ **Responsive design** cho desktop/mobile
- ✅ **Dark/Light theme** support
- ✅ **TypeScript** với full type safety

## 📁 Cấu trúc Project

```
dsa-visualizer/
├── docs/                          # 📚 Documentation
│   ├── CONTRIBUTING.md            # Development workflow  
│   ├── DEVELOPER_GUIDE.md         # Technical guide
│   ├── DATABASE.md                # Database & permissions
│   ├── DEPLOYMENT.md              # Deployment guides
│   └── API.md                     # Future API docs
├── dsa-visualizer/                # 🚀 Next.js App
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom hooks
│   │   └── lib/                   # Utilities
│   ├── public/                    # Static assets
│   └── package.json               # Dependencies
└── README.md                      # Main documentation
```

## 🛠️ Development Commands

```bash
# Development server với hot reload
npm run dev

# Type checking
npm run type-check

# Linting & formatting
npm run lint
npm run lint:fix

# Production build
npm run build
npm start
```

## 🎨 Key Components

### Dashboard (`/src/app/dashboard/page.tsx`)
- 24+ algorithm cards với Vietnamese descriptions
- Difficulty levels: Dễ, Trung bình, Khó
- Time/Space complexity information

### Visualizers (`/src/app/visualizer/`)
- Interactive algorithm demonstrations
- Speed controls & step-by-step execution
- Algorithm Principle buttons với detailed explanations

### UI Components (`/src/components/ui/`)
- Radix UI + Tailwind CSS
- Consistent design system
- Accessible components

## 🌐 Vietnamese Localization

Tất cả content đã được việt hóa:
- ✅ Algorithm names & descriptions
- ✅ UI text & navigation
- ✅ Button labels & tooltips  
- ✅ Educational content
- ✅ Error messages

## 📊 Algorithms Covered

### Sorting (Sắp xếp)
- Bubble Sort, Selection Sort, Insertion Sort
- Merge Sort, Quick Sort, Heap Sort

### Data Structures
- Binary Tree, AVL Tree, Trie
- Stack, Queue, Linked List, Heap

### Graph Algorithms  
- Dijkstra, A* Pathfinding
- MST (Minimum Spanning Tree)

### Advanced
- Bloom Filter, Skip List, Union-Find
- Huffman Coding, Polynomial Operations
- Segment Tree, String Algorithms

## 🔧 Tech Stack

- **Frontend**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Icons**: Lucide React
- **Bundler**: Turbopack (Next.js 15)
- **Linting**: ESLint + Prettier

## 🤝 Contributing

### Quick Contribution Flow
1. **Fork repository** trên GitHub
2. **Clone fork**: `git clone https://github.com/YOUR_USERNAME/dsa-visualizer.git`
3. **Create branch**: `git checkout -b feature/your-feature`
4. **Make changes** và test locally
5. **Commit**: `git commit -m "feat: description"`
6. **Push**: `git push origin feature/your-feature`
7. **Create Pull Request** trên GitHub

### Branch Naming Convention
```bash
feature/algorithm-name      # New algorithm implementation
fix/bug-description        # Bug fixes  
docs/update-readme         # Documentation updates
refactor/component-name    # Code refactoring
ui/improve-responsiveness  # UI improvements
```

### Commit Message Format
```bash
feat: add Binary Search Tree visualizer
fix: resolve mobile navigation issue  
docs: update API documentation
refactor: optimize sorting algorithms
ui: improve dashboard card layout
```

## 📖 Essential Documentation

### For New Developers
1. **[DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Technical architecture, patterns, templates
2. **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Development workflow, standards, PR process

### For Database Work
3. **[DATABASE.md](docs/DATABASE.md)** - Schema design, permissions, security

### For Deployment
4. **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Environment setup, CI/CD, production

### For API Integration  
5. **[API.md](docs/API.md)** - Future backend API documentation

## 🚨 Common Issues & Solutions

### TypeScript Errors
```bash
# Type check all files
npm run type-check

# Common fix: restart TypeScript server in VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules if needed
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

## 🎯 Current Focus Areas

### Phase 1: ✅ Completed
- [x] Vietnamese localization
- [x] Dashboard với 24+ algorithms  
- [x] Algorithm Principle buttons
- [x] Responsive design

### Phase 2: 🚧 In Progress
- [ ] Complete Algorithm Principle buttons cho remaining pages
- [ ] User authentication system
- [ ] Progress tracking
- [ ] Database integration

### Phase 3: 📋 Planned
- [ ] Real-time collaboration
- [ ] Classroom management
- [ ] Advanced analytics
- [ ] Mobile app

## 🔗 Useful Links

- **Live Demo**: [Coming Soon]
- **GitHub Issues**: [Create Issue](https://github.com/YOUR_USERNAME/dsa-visualizer/issues)
- **Discussions**: [Join Discussion](https://github.com/YOUR_USERNAME/dsa-visualizer/discussions)
- **Documentation**: [docs/](docs/)

## 💡 Tips for Collaborators

### Development Best Practices
- ✅ Always run `npm run type-check` before committing
- ✅ Use `npm run lint:fix` để auto-fix formatting
- ✅ Test responsive design on different screen sizes
- ✅ Verify Vietnamese translations are correct
- ✅ Add Vietnamese comments cho complex algorithms

### Code Style
- ✅ Use TypeScript interfaces for props
- ✅ Follow naming convention: PascalCase for components
- ✅ Use Tailwind CSS classes consistently
- ✅ Add proper JSDoc comments cho functions

### Testing Your Changes
1. Run development server: `npm run dev`
2. Test algorithm visualizations manually
3. Check responsive design (Chrome DevTools)
4. Verify all buttons/links work
5. Test dark/light theme switching

---

**Happy coding! 🚀**

Questions? Check [CONTRIBUTING.md](docs/CONTRIBUTING.md) hoặc create an issue!
