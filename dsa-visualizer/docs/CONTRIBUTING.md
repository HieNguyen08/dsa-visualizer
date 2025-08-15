# 🤝 Hướng dẫn Đóng góp (Contributing Guide)

Cảm ơn bạn quan tâm đến việc đóng góp cho DSA Visualizer! Đây là hướng dẫn chi tiết để giúp bạn bắt đầu.

## 📋 Mục lục

- [Cách thức đóng góp](#cách-thức-đóng-góp)
- [Quy trình Development](#quy-trình-development)
- [Coding Standards](#coding-standards)
- [Quy trình Pull Request](#quy-trình-pull-request)
- [Phân quyền và Vai trò](#phân-quyền-và-vai-trò)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

## 🚀 Cách thức đóng góp

### 1. Fork và Clone Repository

```bash
# Fork repository trên GitHub, sau đó clone
git clone https://github.com/[your-username]/dsa-visualizer.git
cd dsa-visualizer/dsa-visualizer

# Thêm upstream remote
git remote add upstream https://github.com/[original-owner]/dsa-visualizer.git
```

### 2. Cài đặt Development Environment

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Verify mọi thứ hoạt động
npm run lint
npm run type-check
```

### 3. Tạo Branch cho Feature

```bash
# Sync với upstream
git fetch upstream
git checkout main
git merge upstream/main

# Tạo branch mới
git checkout -b feature/your-feature-name
# Hoặc cho bug fix
git checkout -b fix/your-bug-fix
```

## 🔄 Quy trình Development

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/short-description` | `feature/binary-search-tree` |
| Bug Fix | `fix/short-description` | `fix/dashboard-sorting-issue` |
| Enhancement | `enhancement/short-description` | `enhancement/performance-optimization` |
| Documentation | `docs/short-description` | `docs/api-documentation` |

### Commit Message Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat`: Tính năng mới
- `fix`: Bug fix
- `docs`: Thay đổi documentation
- `style`: Formatting, missing semi colons, etc
- `refactor`: Code refactoring
- `test`: Thêm tests
- `chore`: Build process hoặc auxiliary tools

#### Examples:
```bash
feat(dashboard): thêm filter theo độ khó
fix(visualizer): sửa lỗi animation trong binary tree
docs(readme): cập nhật installation guide
style(components): format code theo prettier rules
```

## 💻 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good
interface AlgorithmCard {
  id: string;
  title: string;
  category: 'sorting' | 'tree' | 'graph' | 'data-structure' | 'advanced';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  description: string;
  concepts: string[];
}

// ❌ Bad
interface AlgorithmCard {
  id: any;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  concepts: any[];
}
```

### Component Guidelines

```tsx
// ✅ Good - Functional component with proper typing
interface VisualizerProps {
  data: number[];
  isPlaying: boolean;
  onPlay: () => void;
}

export function SortingVisualizer({ data, isPlaying, onPlay }: VisualizerProps) {
  return (
    <div className="visualizer-container">
      {/* Component content */}
    </div>
  );
}

// ❌ Bad - Missing types
export function SortingVisualizer({ data, isPlaying, onPlay }) {
  // ...
}
```

### CSS/Tailwind Guidelines

```tsx
// ✅ Good - Semantic class names và consistent spacing
<div className="container mx-auto px-4 py-8">
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg font-semibold">Algorithm Title</CardTitle>
    </CardHeader>
  </Card>
</div>

// ❌ Bad - Arbitrary values và inconsistent spacing
<div className="mx-auto px-2 py-3">
  <div className="shadow-xl">
    <div className="pb-2">
      <h3 className="text-[18px] font-[600]">Algorithm Title</h3>
    </div>
  </div>
</div>
```

### File Organization

```
src/app/visualizer/[algorithm-name]/
├── page.tsx                 # Main page component
├── components/             # Local components (nếu cần)
│   ├── controls.tsx
│   ├── visualization.tsx
│   └── stats.tsx
└── types.ts               # Local type definitions
```

## 🔍 Quy trình Pull Request

### 1. Pre-submission Checklist

- [ ] Code compile không có errors
- [ ] Đã test trên multiple browsers
- [ ] Có responsive design
- [ ] Tuân theo accessibility guidelines
- [ ] Có TypeScript types đầy đủ
- [ ] Code đã được format (Prettier)
- [ ] Lint checks pass (`npm run lint`)

### 2. Pull Request Template

Khi tạo PR, sử dụng template sau:

```markdown
## 📝 Mô tả
Brief description của changes

## 🎯 Loại thay đổi
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
Describe các tests đã thực hiện:
- [ ] Desktop Chrome/Firefox/Safari
- [ ] Mobile Chrome/Safari
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

## 📸 Screenshots
Nếu có UI changes, attach screenshots

## 📋 Checklist
- [ ] Code tuân theo project style guidelines
- [ ] Self-review completed
- [ ] Comments added cho complex logic
- [ ] Documentation updated (nếu cần)
- [ ] No console errors
```

### 3. Review Process

1. **Automated Checks**: GitHub Actions sẽ run lint, type-check
2. **Code Review**: Ít nhất 1 maintainer sẽ review
3. **Testing**: Manual testing on different devices/browsers
4. **Merge**: Sau khi approve, maintainer sẽ merge

## 👥 Phân quyền và Vai trò

### 🔴 Maintainer (Full Access)
- **Quyền hạn**: Merge PRs, manage issues, release management
- **Trách nhiệm**: Code review, architecture decisions, project direction
- **Thành viên**: [Project Owner], [Lead Developers]

### 🟡 Collaborator (Write Access)  
- **Quyền hạn**: Push to branches, create PRs, manage issues
- **Trách nhiệm**: Feature development, bug fixes, documentation
- **Yêu cầu**: Proven contribution history, understanding của codebase

### 🟢 Contributor (Fork & PR)
- **Quyền hạn**: Fork repository, submit PRs
- **Trách nhiệm**: Bug reports, small features, documentation improvements
- **Tất cả**: Welcome mọi người contribute!

### 🎓 Làm thế nào để trở thành Collaborator?

1. **Contribute consistently** (3-5 merged PRs)
2. **Show understanding** của project architecture
3. **Follow coding standards** và best practices
4. **Engage với community** (reviews, discussions)
5. **Request access** qua issue hoặc email

## 🐛 Bug Reports

Sử dụng GitHub Issues với template:

```markdown
**Describe the bug**
A clear và concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear và concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Priority Levels

| Priority | Description | Examples |
|----------|-------------|----------|
| 🔥 High | Critical for user experience | Performance issues, accessibility |
| 🟡 Medium | Nice to have improvements | New visualizers, UI enhancements |
| 🟢 Low | Future considerations | Advanced features, integrations |

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear và concise description of what the problem is.

**Describe the solution you'd like**
A clear và concise description of what you want to happen.

**Describe alternatives you've considered**
A clear và concise description of any alternative solutions.

**Implementation ideas**
If you have technical ideas, share them here.

**Priority level**
🔥 High / 🟡 Medium / 🟢 Low

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 📚 Development Resources

### Useful Links
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)

### Learning Resources
- [React Best Practices](https://react.dev/learn)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Algorithm Visualizations](https://visualgo.net/)

## 🆘 Cần trợ giúp?

- **GitHub Issues**: Cho technical questions
- **GitHub Discussions**: Cho general discussion
- **Email**: [maintainer-email] cho private concerns

---

Cảm ơn bạn đã đóng góp cho DSA Visualizer! 🙏

Mỗi đóng góp, dù lớn hay nhỏ, đều giúp cải thiện trải nghiệm học tập của hàng ngàn học sinh và sinh viên Việt Nam.
