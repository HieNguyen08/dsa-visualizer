# 🚀 DSA Visualizer - Trực Quan Hóa Cấu Trúc Dữ Liệu & Thuật Toán

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 📖 Giới thiệu

DSA Visualizer là một nền tảng web tương tác tiên tiến được thiết kế để giúp học sinh, sinh viên và lập trình viên học tập và hiểu sâu về **Cấu trúc Dữ liệu và Thuật toán (Data Structures & Algorithms)** thông qua trực quan hóa động và tương tác trực tiếp.

### 🎯 Mục tiêu
- **Học tập trực quan**: Biến các khái niệm trừu tượng thành hình ảnh dễ hiểu
- **Tương tác thực tế**: Cho phép người dùng thực nghiệm với dữ liệu thực
- **Tiếng Việt hoàn chỉnh**: Giao diện và nội dung 100% bằng tiếng Việt
- **Giáo dục chất lượng cao**: Cung cấp kiến thức sâu và chính xác

## ✨ Tính năng chính

### 🏠 Dashboard Quản lý Học tập
- **Theo dõi tiến độ**: Hệ thống tracking học tập cá nhân
- **Phân loại thuật toán**: Sắp xếp, Cây, Đồ thị, Cấu trúc dữ liệu, Nâng cao
- **Lọc và tìm kiếm**: Tìm kiếm thuật toán theo tên, mô tả hoặc khái niệm
- **Đánh giá độ khó**: 3 mức độ - Dễ, Trung bình, Khó

### 🎮 Trực Quan Hóa Tương Tác
#### 📊 Thuật Toán Sắp Xếp
- Bubble Sort, Quick Sort, Merge Sort, Heap Sort
- So sánh hiệu suất trực quan
- Điều chỉnh tốc độ animation

#### 🌲 Cấu Trúc Cây
- **Binary Search Tree**: Chèn, xóa, tìm kiếm
- **AVL Tree**: Tự cân bằng với phép xoay
- **Red-Black Tree**: Cây đỏ-đen với thuộc tính màu
- **Segment Tree**: Truy vấn khoảng hiệu quả
- **Trie (Prefix Tree)**: Tìm kiếm chuỗi và tiền tố

#### 🔗 Cấu Trúc Dữ Liệu
- **Stack & Queue**: LIFO và FIFO với ứng dụng thực tế
- **Linked List**: Danh sách liên kết đơn và đôi
- **Hash Table**: Bảng băm với xử lý collision
- **Bloom Filter**: Cấu trúc xác suất cho membership testing
- **Skip List**: Cấu trúc xác suất cho tìm kiếm nhanh

#### 🗺️ Thuật Toán Đồ Thị
- **Pathfinding**: Dijkstra, A*, BFS, DFS
- **Minimum Spanning Tree**: Kruskal, Prim
- **Union-Find**: Disjoint Set với path compression

#### 🧠 Thuật Toán Nâng Cao
- **Manacher Algorithm**: Tìm palindrome thời gian tuyến tính
- **Z Algorithm**: Khớp chuỗi hiệu quả
- **Huffman Coding**: Nén dữ liệu tối ưu

### 🎓 Nút "Nguyên lý Thuật toán"
Mỗi visualizer đều có nút giải thích chi tiết:
- **Mô tả thuật toán**: Nguyên lý hoạt động
- **Độ phức tạp**: Time & Space complexity
- **Ứng dụng thực tế**: Sử dụng trong industry
- **Ưu điểm**: Tại sao nên học thuật toán này

## 🛠️ Công nghệ sử dụng

### Frontend Framework
- **Next.js 15.4.6**: React framework với App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful SVG icons

### UI Components
- **Radix UI**: Accessible component primitives
- **Shadcn/ui**: Modern component library
- **Framer Motion**: Smooth animations (future)

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Turbopack**: Fast bundler (Next.js 15)

## 📦 Cài đặt và Chạy

### Yêu cầu hệ thống
- **Node.js**: >= 18.17.0
- **npm**: >= 9.0.0
- **Git**: Latest version

### Clone Repository
```bash
git clone https://github.com/[your-username]/dsa-visualizer.git
cd dsa-visualizer/dsa-visualizer
```

### Cài đặt Dependencies
```bash
npm install
```

### Chạy Development Server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Build cho Production
```bash
npm run build
npm start
```

## 📁 Cấu trúc Project

```
dsa-visualizer/
├── src/
│   ├── app/                          # App Router (Next.js 15)
│   │   ├── dashboard/               # Dashboard page
│   │   ├── sorting/                 # Sorting algorithms page
│   │   ├── pathfinding/            # Pathfinding page
│   │   ├── visualizer/             # Individual visualizers
│   │   │   ├── binary-tree/        # Binary tree visualizer
│   │   │   ├── avl-tree/           # AVL tree visualizer
│   │   │   ├── trie/               # Trie visualizer
│   │   │   ├── bloom-filter/       # Bloom filter visualizer
│   │   │   └── ...                 # Other visualizers
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Homepage
│   ├── components/                  # React components
│   │   ├── landing/                # Landing page components
│   │   ├── navigation/             # Navigation components
│   │   ├── shared/                 # Shared components
│   │   ├── ui/                     # UI components (shadcn)
│   │   └── visualizers/            # Visualizer components
│   ├── hooks/                      # Custom React hooks
│   └── lib/                        # Utility functions
├── public/                         # Static assets
├── docs/                          # Documentation
├── .env.local                     # Environment variables
├── next.config.ts                 # Next.js configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies & scripts
```

## 📖 Documentation

Để tìm hiểu thêm về project:

- **[📋 Contributing Guidelines](docs/CONTRIBUTING.md)** - Quy trình phát triển, coding standards, PR process
- **[👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md)** - Architecture, code organization, component development  
- **[🗄️ Database & Permissions](docs/DATABASE.md)** - Database setup, schema design, user permissions
- **[🚀 Deployment Guide](docs/DEPLOYMENT.md)** - Environment setup, CI/CD, production deployment
- **[📡 API Documentation](docs/API.md)** - API endpoints, authentication, response formats (future)

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Để bắt đầu:

1. **Đọc documentation**: [CONTRIBUTING.md](docs/CONTRIBUTING.md) để hiểu workflow
2. **Setup environment**: Theo [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)  
3. **Hiểu architecture**: Xem [database design](docs/DATABASE.md) và [deployment process](docs/DEPLOYMENT.md)
4. **Tạo PR**: Follow coding standards và testing guidelines

### 🔧 Quick Start cho Contributors
1. Fork repository này
2. Tạo branch cho feature: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📋 Roadmap

### Phase 1: ✅ Hoàn thành
- [x] Việt hóa hoàn chỉnh giao diện
- [x] Dashboard với 24+ thuật toán
- [x] Nút "Nguyên lý thuật toán" cho major visualizers
- [x] Responsive design

### Phase 2: 🚧 Đang phát triển
- [ ] Database integration cho user progress
- [ ] Authentication system
- [ ] Advanced visualizers (Dynamic Programming, Graph Advanced)
- [ ] Mobile app (React Native)

### Phase 3: 🔮 Kế hoạch
- [ ] AI-powered learning path recommendations
- [ ] Collaborative learning features
- [ ] Code playground integration
- [ ] Performance analytics

## 📊 Algorithm Coverage

| Loại | Số lượng | Trạng thái |
|------|----------|------------|
| Sorting | 8+ | ✅ Hoàn thành |
| Tree Structures | 6+ | ✅ Hoàn thành |
| Graph Algorithms | 5+ | ✅ Hoàn thành |
| Data Structures | 8+ | ✅ Hoàn thành |
| Advanced | 10+ | 🚧 Một phần |

## 🙏 Acknowledgments

- **Lucide**: Beautiful icon set
- **Vercel**: Deployment platform
- **Next.js Team**: Amazing React framework
- **Tailwind Labs**: Excellent CSS framework
- **Radix UI**: Accessible component primitives

## 📧 Liên hệ

- **Email**: [your-email@domain.com]
- **GitHub**: [@your-username](https://github.com/your-username)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/your-profile)

## 📄 License

Dự án này được cấp phép dưới [MIT License](./LICENSE).

---

<div align="center">

**⭐ Nếu project này hữu ích, hãy star cho repository! ⭐**

Made with ❤️ for Vietnamese developers and students

</div>
