# 🚀 DSA Visualizer - Advanced Algorithm Learning Platform

A comprehensive, interactive platform for learning Data Structures and Algorithms with AI-powered assistance, community features, and advanced visualizations.

## ✨ Features

### 🔐 **Authentication & User Management**
- **Multi-provider authentication** (Email/Password, Google, GitHub)
- **Role-based access control** (Guest, User, Teacher, Admin)
- **Guest mode** with limited access to basic algorithms
- **User profiles** with progress tracking

### 🧠 **AI-Powered Learning Assistant**
- **Multi-language support** (JavaScript, TypeScript, Python, Java, C++, C, C#)
- **Interactive code examples** and explanations
- **Algorithm optimization suggestions**
- **Real-time code analysis** and feedback
- **Smart hints** and step-by-step guidance

### 📊 **Advanced Algorithm Visualizers**
- **Sorting Algorithms**: Quick Sort, Merge Sort, Heap Sort, Radix Sort, etc.
- **Data Structures**: Binary Trees, AVL Trees, Hash Tables, Stacks, Queues, Linked Lists
- **Graph Algorithms**: Dijkstra, BFS, DFS, MST algorithms
- **Dynamic Programming** visualizations
- **Pathfinding** algorithms with interactive grids

### 🎮 **Interactive Learning Tools**
- **Algorithm Playground** - Practice coding with AI assistance
- **Performance Profiler** - Benchmark and analyze algorithm performance
- **Split-screen Comparison** - Compare algorithms side by side
- **Learning Center** - Step-by-step tutorials with progress tracking

### 👥 **Community Features**
- **Discussion Forums** - Ask questions and share knowledge
- **Q&A System** - Stack Overflow-style question and answer platform
- **Feedback System** - Report bugs and request features
- **Real-time Comments** and discussions on algorithms

### 👑 **Admin Dashboard**
- **User Management** - View and manage users, teachers, and admins
- **Analytics** - Track usage, popular algorithms, and user engagement
- **Feedback Management** - Review and respond to user feedback
- **System Monitoring** - Monitor performance and user activity

### 🎨 **Modern UI/UX**
- **Dark/Light Mode** with system preference detection
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** and transitions
- **Accessibility** features built-in

## 🏗️ **Technical Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **Tailwind CSS** - Modern styling with dark mode
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations

### **Backend**
- **Next.js API Routes** - Serverless backend
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **NextAuth.js** - Complete authentication solution

### **Authentication**
- **JWT tokens** for secure sessions
- **OAuth providers** (Google, GitHub)
- **bcrypt** for password hashing
- **Role-based access control**

### **AI Integration**
- **OpenAI API** - GPT-powered code assistance
- **Google Gemini** - Alternative AI model support
- **Custom prompt engineering** for algorithm explanations

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL database
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd dsa-visualizer/dsa-visualizer
```

2. **Run setup script** (Windows)
```powershell
.\setup.ps1
```

Or (Linux/Mac):
```bash
chmod +x setup.sh
./setup.sh
```

3. **Configure environment variables**
```bash
# Copy and edit the .env file
cp .env.example .env
```

Update `.env` with your credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dsa_visualizer"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GITHUB_CLIENT_ID="your-github-client-id"
OPENAI_API_KEY="your-openai-api-key"
```

4. **Start the development server**
```bash
npm run dev
```

5. **Visit** `http://localhost:3000`

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── community/         # Community features
│   ├── playground/        # Algorithm playground
│   ├── visualizer/        # Algorithm visualizers
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ai/               # AI assistant components
│   ├── navigation/       # Navigation components
│   ├── ui/               # UI library components
│   └── visualizers/      # Algorithm visualizer components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
└── middleware.ts         # Authentication middleware

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 🎯 **Usage Guide**

### **For Students**
1. **Sign up** for an account or use guest mode
2. **Explore visualizers** to understand algorithms
3. **Use the playground** to practice coding with AI help
4. **Join discussions** in the community section
5. **Track your progress** in the learning center

### **For Teachers**
1. **Create teacher account** to access advanced features
2. **Monitor student progress** and engagement
3. **Create custom challenges** and assignments
4. **Participate in community discussions**

### **For Administrators**
1. **Access admin dashboard** to manage the platform
2. **View analytics** and user statistics
3. **Manage feedback** and feature requests
4. **Monitor system performance** and usage

## 🔧 **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database
npm run setup        # Complete setup process
```

## 🌟 **Key Features Deep Dive**

### **Algorithm Playground**
- Write code in multiple languages
- Get AI-powered hints and suggestions
- Interactive challenges with scoring
- Real-time code analysis

### **Performance Profiler**
- Benchmark different algorithms
- Visual complexity analysis
- Performance comparison charts
- Memory usage tracking

### **Hash Table Visualizer**
- Multiple hash functions (Division, Multiplication)
- Collision resolution strategies (Chaining, Linear/Quadratic Probing)
- Interactive insertion, search, and deletion
- Load factor monitoring

### **Community Platform**
- Discussion categories (Questions, Tutorials, Bug Reports)
- Voting system for posts and answers
- Tag-based organization
- Real-time search and filtering

## 🔒 **Security Features**
- **Input validation** and sanitization
- **Rate limiting** on API endpoints  
- **CSRF protection** with NextAuth
- **SQL injection** protection via Prisma
- **Password hashing** with bcrypt
- **JWT token** security

## 🎨 **Customization**
- **Theme system** with CSS variables
- **Configurable animations** and speeds
- **Multiple visualization styles**
- **Customizable AI assistant** behavior

## 📊 **Database Schema**
- **Users** - Authentication and profile data
- **Posts/Comments** - Community content
- **Feedback** - Bug reports and feature requests
- **Progress** - Learning progress tracking
- **Analytics** - Usage statistics

## 🤝 **Contributing**
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 **License**
This project is licensed under the MIT License.

## 🆘 **Support**
- Check the **FAQ** in the community section
- **Report bugs** via the feedback system
- **Request features** through the community platform
- Contact administrators for technical support

## 🗺️ **Roadmap**
- [ ] Mobile app development
- [ ] Advanced AI tutoring
- [ ] Collaborative coding features
- [ ] More algorithm visualizers
- [ ] Integration with learning management systems
- [ ] Multi-language interface support

---

Made with ❤️ for the algorithm learning community
