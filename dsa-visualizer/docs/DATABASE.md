# 🗄️ Database & Permissions Guide

Hướng dẫn chi tiết về database setup, phân quyền và quản lý data cho DSA Visualizer project.

## 📋 Mục lục

- [Database Architecture](#database-architecture)
- [Schema Design](#schema-design)
- [User Permissions](#user-permissions)
- [Environment Setup](#environment-setup)
- [Migration System](#migration-system)
- [Data Management](#data-management)
- [Security Guidelines](#security-guidelines)
- [Troubleshooting](#troubleshooting)

## 🏗️ Database Architecture

### Current State
**DSA Visualizer hiện tại là frontend-only application**, không yêu cầu database backend. Tất cả data được lưu trữ tại client-side bằng:

- **localStorage**: User preferences, progress tracking
- **sessionStorage**: Temporary visualization state
- **Static data**: Algorithm definitions, examples

### Future Database Integration

Khi project phát triển, chúng ta sẽ cần database cho:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - Visualizers   │    │ - User Auth     │    │ - User Data     │
│ - Progress UI   │    │ - Progress API  │    │ - Progress      │
│ - Settings      │    │ - Analytics     │    │ - Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Schema Design

### Proposed Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');

-- Algorithm progress tracking
CREATE TABLE algorithm_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    algorithm_slug VARCHAR(100) NOT NULL, -- 'bubble-sort', 'binary-search', etc.
    status completion_status DEFAULT 'not_started',
    best_time_ms INTEGER,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, algorithm_slug)
);

-- Progress status enum
CREATE TYPE completion_status AS ENUM (
    'not_started', 
    'in_progress', 
    'completed', 
    'mastered'
);

-- Learning sessions
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    algorithm_slug VARCHAR(100) NOT NULL,
    session_data JSONB, -- Visualization states, notes, etc.
    duration_ms INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL, -- 'first_sort', 'speed_master', etc.
    achievement_data JSONB,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'algorithm_start', 'algorithm_complete', etc.
    event_data JSONB,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_algorithm_progress_user_id ON algorithm_progress(user_id);
CREATE INDEX idx_algorithm_progress_algorithm ON algorithm_progress(algorithm_slug);
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_algorithm ON learning_sessions(algorithm_slug);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
```

### Sample Data Structure

```sql
-- Sample user data
INSERT INTO users (email, username, display_name, role, preferences) VALUES 
('student@example.com', 'student1', 'Học viên A', 'student', '{
    "theme": "dark",
    "language": "vi", 
    "defaultSpeed": 500,
    "notifications": true
}'),
('instructor@example.com', 'teacher1', 'Giảng viên B', 'instructor', '{
    "theme": "light",
    "language": "vi",
    "defaultSpeed": 300
}');

-- Sample progress data
INSERT INTO algorithm_progress (user_id, algorithm_slug, status, attempts, best_time_ms) VALUES 
((SELECT id FROM users WHERE username = 'student1'), 'bubble-sort', 'completed', 3, 45000),
((SELECT id FROM users WHERE username = 'student1'), 'binary-search', 'in_progress', 1, NULL);
```

## 👥 User Permissions

### Role-Based Access Control (RBAC)

#### 1. Admin Role
```javascript
// Full system access
const adminPermissions = {
  users: ['create', 'read', 'update', 'delete'],
  analytics: ['read', 'export'],
  algorithms: ['create', 'read', 'update', 'delete'],
  system: ['configure', 'backup', 'restore'],
  content: ['moderate', 'publish']
};
```

#### 2. Instructor Role  
```javascript
// Teaching and analytics access
const instructorPermissions = {
  users: ['read'], // View student progress only
  analytics: ['read'], // View class analytics
  algorithms: ['read'], // View all algorithms
  progress: ['read'], // View student progress
  content: ['suggest'] // Suggest content changes
};
```

#### 3. Student Role
```javascript
// Learning-focused permissions
const studentPermissions = {
  profile: ['read', 'update'], // Own profile only
  progress: ['read', 'update'], // Own progress only
  algorithms: ['read'], // View all algorithms
  sessions: ['create', 'read', 'update'] // Own learning sessions
};
```

### Permission Implementation

```typescript
// types/permissions.ts
export interface User {
  id: string;
  role: 'admin' | 'instructor' | 'student';
  permissions: string[];
}

export interface PermissionCheck {
  action: string;
  resource: string;
  resourceId?: string;
}

// utils/permissions.ts
export function hasPermission(
  user: User, 
  check: PermissionCheck
): boolean {
  // Admin có full access
  if (user.role === 'admin') return true;
  
  // Check specific permissions
  const permissionString = `${check.resource}:${check.action}`;
  return user.permissions.includes(permissionString);
}

// middleware/auth.ts  
export function requirePermission(
  action: string,
  resource: string
) {
  return (req: NextRequest, res: NextResponse) => {
    const user = getCurrentUser(req);
    
    if (!hasPermission(user, { action, resource })) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}
```

### Code Locations for Permissions

```
src/
├── middleware/
│   ├── auth.ts              # Authentication middleware
│   └── permissions.ts       # Permission checking
├── lib/
│   ├── auth.ts             # Auth utilities
│   ├── permissions.ts      # Permission utilities
│   └── database.ts         # Database connection
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── users/          # User management
│   │   ├── progress/       # Progress tracking
│   │   └── analytics/      # Analytics endpoints
│   ├── admin/              # Admin dashboard (admin only)
│   ├── instructor/         # Instructor dashboard
│   └── dashboard/          # Student dashboard
└── types/
    ├── auth.ts            # Auth-related types
    ├── database.ts        # Database types
    └── permissions.ts     # Permission types
```

## ⚙️ Environment Setup

### Development Environment

```bash
# .env.local file
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dsa_visualizer_dev"
DATABASE_POOL_SIZE=20

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-dev-secret-key"

# OAuth providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"  
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Analytics
ANALYTICS_API_KEY="your-analytics-key"
```

### Production Environment

```bash
# .env.production
# Database (use connection pooling)
DATABASE_URL="postgresql://user:pass@prod-host:5432/dsa_visualizer_prod"
DATABASE_POOL_SIZE=50
DATABASE_SSL=true

# Security
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### Database Setup Commands

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database user
sudo -u postgres createuser --interactive dsa_visualizer

# Create database
sudo -u postgres createdb dsa_visualizer_dev -O dsa_visualizer

# Connect to database
psql -h localhost -U dsa_visualizer -d dsa_visualizer_dev

# Run migrations (future)
npm run db:migrate
npm run db:seed
```

## 🔄 Migration System

### Migration Structure

```
database/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_achievements.sql
│   ├── 003_add_analytics.sql
│   └── ...
├── seeds/
│   ├── users.sql
│   ├── algorithms.sql
│   └── sample_data.sql
└── scripts/
    ├── migrate.js
    ├── rollback.js
    └── seed.js
```

### Migration Commands

```javascript
// package.json scripts
{
  "scripts": {
    "db:migrate": "node database/scripts/migrate.js",
    "db:rollback": "node database/scripts/rollback.js", 
    "db:seed": "node database/scripts/seed.js",
    "db:reset": "npm run db:rollback && npm run db:migrate && npm run db:seed"
  }
}

// database/scripts/migrate.js
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Check migration table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Run pending migrations
    const files = fs.readdirSync('./migrations').sort();
    
    for (const file of files) {
      const exists = await pool.query(
        'SELECT 1 FROM migrations WHERE filename = $1',
        [file]
      );

      if (exists.rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(`./migrations/${file}`, 'utf8');
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
      }
    }
  } finally {
    await pool.end();
  }
}
```

## 📈 Data Management

### Progress Tracking Implementation

```typescript
// lib/progress.ts
export interface AlgorithmProgress {
  algorithmSlug: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  attempts: number;
  bestTime: number | null;
  lastAttempt: Date;
}

export class ProgressTracker {
  async recordStart(userId: string, algorithmSlug: string) {
    await db.query(`
      INSERT INTO learning_sessions (user_id, algorithm_slug)
      VALUES ($1, $2)
      RETURNING id
    `, [userId, algorithmSlug]);
  }

  async recordCompletion(
    sessionId: string, 
    duration: number, 
    success: boolean
  ) {
    await db.query(`
      UPDATE learning_sessions 
      SET duration_ms = $2, completed = $3
      WHERE id = $1
    `, [sessionId, duration, success]);

    if (success) {
      await this.updateAlgorithmProgress(sessionId);
    }
  }

  async getProgressByUser(userId: string): Promise<AlgorithmProgress[]> {
    const result = await db.query(`
      SELECT algorithm_slug, status, attempts, best_time_ms, last_attempt
      FROM algorithm_progress 
      WHERE user_id = $1
    `, [userId]);

    return result.rows.map(row => ({
      algorithmSlug: row.algorithm_slug,
      status: row.status,
      attempts: row.attempts,
      bestTime: row.best_time_ms,
      lastAttempt: row.last_attempt
    }));
  }
}
```

### Analytics Implementation

```typescript
// lib/analytics.ts
export class AnalyticsCollector {
  async trackEvent(
    userId: string,
    eventType: string, 
    data: Record<string, any>
  ) {
    await db.query(`
      INSERT INTO analytics_events (user_id, event_type, event_data)
      VALUES ($1, $2, $3)
    `, [userId, eventType, JSON.stringify(data)]);
  }

  async getClassroomStats(instructorId: string) {
    // Get students under instructor
    const students = await this.getStudentsByInstructor(instructorId);
    const studentIds = students.map(s => s.id);

    // Aggregate statistics
    const stats = await db.query(`
      SELECT 
        algorithm_slug,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completions,
        AVG(best_time_ms) as avg_time
      FROM algorithm_progress 
      WHERE user_id = ANY($1)
      GROUP BY algorithm_slug
    `, [studentIds]);

    return stats.rows;
  }
}
```

## 🔒 Security Guidelines

### Database Security

#### 1. Connection Security
```javascript
// Secure database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 2. SQL Injection Prevention
```typescript
// ✅ Good - Parameterized queries
const getUser = async (email: string) => {
  return await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
};

// ❌ Bad - String concatenation  
const getUser = async (email: string) => {
  return await db.query(
    `SELECT * FROM users WHERE email = '${email}'`
  );
};
```

#### 3. Data Validation
```typescript
// Input validation schema
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  displayName: z.string().max(100).optional(),
});

const progressSchema = z.object({
  algorithmSlug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(['not_started', 'in_progress', 'completed', 'mastered']),
  duration: z.number().positive().optional()
});
```

#### 4. Rate Limiting
```typescript
// Rate limiting for API endpoints
import rateLimit from 'express-rate-limit';

const progressLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export default progressLimit;
```

### Access Control Implementation

```typescript
// API route protection example
// app/api/progress/[userId]/route.ts
import { requirePermission } from '@/middleware/permissions';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const currentUser = await getCurrentUser(request);
  
  // Users can only view their own progress unless they're instructors/admins
  if (currentUser.id !== params.userId && currentUser.role === 'student') {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  const progress = await getProgressByUser(params.userId);
  return Response.json(progress);
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U dsa_visualizer -d dsa_visualizer_dev -c "SELECT 1;"

# Check connection pool
# Monitor active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'dsa_visualizer_dev';
```

#### 2. Migration Issues
```sql
-- Check migration status
SELECT * FROM migrations ORDER BY executed_at DESC;

-- Manually mark migration as executed
INSERT INTO migrations (filename) VALUES ('002_add_achievements.sql');

-- Reset migration table (DANGER!)
DROP TABLE migrations;
```

#### 3. Permission Issues
```javascript
// Debug permission checking
console.log('User role:', user.role);
console.log('Required permission:', `${resource}:${action}`);
console.log('User permissions:', user.permissions);
console.log('Has permission:', hasPermission(user, { action, resource }));
```

#### 4. Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Check index usage
SELECT 
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
```

### Database Backup & Recovery

```bash
# Backup database
pg_dump -h localhost -U dsa_visualizer dsa_visualizer_prod > backup_$(date +%Y%m%d).sql

# Restore database  
psql -h localhost -U dsa_visualizer dsa_visualizer_dev < backup_20241220.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backups/backup_$DATE.sql"
find backups/ -name "backup_*.sql" -mtime +7 -delete # Keep 7 days
```

---

## 📞 Support

Nếu gặp vấn đề với database setup hoặc permissions:

1. **Check logs**: Xem application logs và PostgreSQL logs
2. **Verify environment**: Đảm bảo environment variables đúng  
3. **Test connections**: Sử dụng psql để test database connectivity
4. **Check permissions**: Verify user roles và permissions trong database
5. **Contact team**: Tạo issue trên GitHub với detailed error information

Happy database management! 🗄️
