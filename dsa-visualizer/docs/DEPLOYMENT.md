# 🚀 Deployment Guide - DSA Visualizer

Hướng dẫn chi tiết về deployment, CI/CD pipeline và environment setup cho DSA Visualizer.

## 📋 Mục lục

- [Deployment Overview](#deployment-overview)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🌍 Deployment Overview

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ - Local setup   │───►│ - Preview env   │───►│ - Live website  │
│ - Hot reload    │    │ - Integration   │    │ - Optimized     │
│ - Debug tools   │    │ - Testing       │    │ - Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Supported Platforms

| Platform | Status | Best For | Cost |
|----------|--------|----------|------|
| **Vercel** | ✅ Recommended | Next.js apps | Free tier available |
| **Netlify** | ✅ Supported | Static sites | Free tier available |
| **AWS** | ⚠️ Advanced | Enterprise | Variable |
| **Google Cloud** | ⚠️ Advanced | Scalability | Variable |
| **DigitalOcean** | ✅ Supported | VPS deployment | $5/month+ |
| **Railway** | ✅ Supported | Full-stack apps | $5/month+ |

## ⚙️ Environment Setup

### Environment Variables

#### Development (.env.local)
```bash
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="DSA Visualizer"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_ENABLE_PROGRESS_TRACKING=false

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=true

# Future Database (when implemented)
# DATABASE_URL=postgresql://localhost:5432/dsa_visualizer_dev
# DATABASE_POOL_SIZE=10

# Authentication (future)
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-dev-secret
```

#### Staging (.env.staging)
```bash
# Staging Configuration
NEXT_PUBLIC_APP_URL=https://staging.dsa-visualizer.com
NEXT_PUBLIC_APP_NAME="DSA Visualizer (Staging)"
NEXT_PUBLIC_APP_VERSION=1.0.0-staging

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_ENABLE_PROGRESS_TRACKING=false

# Staging Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=true
```

#### Production (.env.production)
```bash
# Production Configuration  
NEXT_PUBLIC_APP_URL=https://dsa-visualizer.com
NEXT_PUBLIC_APP_NAME="DSA Visualizer"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_PROGRESS_TRACKING=true

# Production Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=false

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=your-google-analytics-id
NEXT_PUBLIC_GTM_ID=your-google-tag-manager-id

# Error Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=dsa-visualizer

# Performance Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

### Configuration Files

#### next.config.ts
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output configuration
  output: process.env.OUTPUT_MODE || 'standalone',
  
  // Image optimization
  images: {
    domains: ['example.com'], // Add allowed image domains
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features
  experimental: {
    // Enable Turbopack for faster development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Environment-specific settings
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
    
    // Headers for security
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options', 
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
          ],
        },
      ];
    },
  }),

  // Bundle analysis (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'server',
          analyzerPort: 8888,
        })
      );
      return config;
    },
  }),
};

export default nextConfig;
```

## 💻 Local Development

### Setup Commands

```bash
# 1. Clone repository
git clone https://github.com/your-username/dsa-visualizer.git
cd dsa-visualizer/dsa-visualizer

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build", 
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "analyze": "ANALYZE=true npm run build",
    "clean": "rm -rf .next node_modules",
    "fresh": "npm run clean && npm install && npm run dev"
  }
}
```

### Pre-commit Hooks

```bash
# Install husky for git hooks
npm install -D husky lint-staged

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

## 🧪 Staging Deployment

### Vercel Staging Setup

1. **Connect GitHub Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

2. **Configure Preview Deployments**
```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  },
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://dsa-visualizer-staging.vercel.app",
    "NEXT_PUBLIC_DEBUG_MODE": "false"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_VERSION": "$VERCEL_GIT_COMMIT_SHA"
    }
  }
}
```

3. **Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add staging environment variables
   - Configure preview branch: `staging`

### Netlify Staging Setup

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html" 
  status = 200

[context.staging]
  environment = { NEXT_PUBLIC_APP_URL = "https://staging--dsa-visualizer.netlify.app" }

[context.deploy-preview]
  environment = { NEXT_PUBLIC_DEBUG_MODE = "true" }
```

## 🚀 Production Deployment

### Vercel Production Deployment

#### Automatic Deployment (Recommended)
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test --if-present
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint check
        run: npm run lint
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### Manual Deployment
```bash
# Build and deploy
npm run build
vercel --prod

# Or deploy with specific domain
vercel --prod --domains dsa-visualizer.com
```

### Self-hosted Deployment

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  dsa-visualizer:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
      - NODE_ENV=production
    restart: unless-stopped
```

#### VPS Deployment (DigitalOcean/AWS/etc.)

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx
```

2. **Application Deployment**
```bash
# Clone and build
git clone https://github.com/your-username/dsa-visualizer.git
cd dsa-visualizer/dsa-visualizer
npm install
npm run build

# Start with PM2
pm2 start npm --name "dsa-visualizer" -- start
pm2 startup
pm2 save
```

3. **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/dsa-visualizer
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]

env:
  NODE_VERSION: '18'

jobs:
  # Quality checks
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type checking
        run: npm run type-check

      - name: Linting
        run: npm run lint

      - name: Unit tests
        run: npm run test --if-present

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: .next

  # Security scanning
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level=high

      - name: Dependency vulnerability check
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Deploy to staging
  deploy-staging:
    needs: [quality, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    environment: staging
    steps:
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.TEAM_ID }}

  # Deploy to production
  deploy-production:
    needs: [quality, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.TEAM_ID }}

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Branch Protection Rules

```yaml
# GitHub Repository Settings → Branches → Add rule
# Branch name pattern: main
Required status checks:
  ✅ quality
  ✅ security
  
✅ Require branches to be up to date before merging
✅ Require review from code owners  
✅ Dismiss stale reviews when new commits are pushed
✅ Require linear history
✅ Include administrators
```

## 📊 Monitoring & Logging

### Error Monitoring (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment configuration
  environment: process.env.NODE_ENV,
  
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### Performance Monitoring

```typescript
// lib/analytics.ts
export class PerformanceTracker {
  static trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined') {
      // Core Web Vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }

  static trackAlgorithmExecution(algorithm: string, duration: number) {
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'algorithm_execution', {
        algorithm_name: algorithm,
        duration: duration,
        custom_parameter: 'custom_value'
      });
    }
  }
}
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    node_version: process.version,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };

  return Response.json(health);
}
```

### Logging

```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: false
      }
    }
  })
});

export default logger;

// Usage in components
import logger from '@/lib/logger';

export function MyComponent() {
  const handleError = (error: Error) => {
    logger.error({ error: error.message }, 'Component error occurred');
  };
  
  const handleSuccess = (data: any) => {
    logger.info({ data }, 'Operation completed successfully');
  };
}
```

## ⚡ Performance Optimization

### Build Optimization

```typescript
// next.config.ts optimizations
const nextConfig: NextConfig = {
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },
};
```

### CDN Configuration

```javascript
// For static assets hosting
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
  
  images: {
    loader: 'cloudinary', // or 'imgix', 'custom'
    path: 'https://your-cloudinary-domain.com/',
  },
});
```

### Caching Strategy

```typescript
// app/layout.tsx - Set cache headers
export const metadata = {
  other: {
    'Cache-Control': 'public, max-age=31536000, immutable'
  }
};

// For API routes
export async function GET() {
  const data = await fetchData();
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

```bash
# Check Node.js version compatibility
node --version  # Should be >= 18

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Check memory issues during build
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### 2. Environment Variable Issues

```javascript
// Debug environment variables
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  // Add other variables
});

// Check if variables are loaded correctly
if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is not defined');
}
```

#### 3. Performance Issues

```bash
# Analyze bundle size
npm run analyze

# Check for duplicate dependencies
npm ls --depth=0

# Audit for vulnerabilities  
npm audit fix

# Check for unused dependencies
npx depcheck
```

#### 4. SSL/HTTPS Issues

```bash
# For custom domains on Vercel
# 1. Add domain in Vercel dashboard
# 2. Update DNS records
# 3. Verify SSL certificate

# For self-hosted with Let's Encrypt
sudo certbot --nginx -d your-domain.com
sudo systemctl reload nginx
```

### Debugging Production Issues

```typescript
// Enable detailed error pages in production (temporarily)
const nextConfig = {
  experimental: {
    errorOverlay: true
  }
};

// Add error boundary for better error handling
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}

export function MyApp() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  );
}
```

---

## 📞 Deployment Support

### Quick Deploy Checklist
- [ ] Environment variables configured
- [ ] Build passes locally  
- [ ] TypeScript compilation successful
- [ ] No linting errors
- [ ] All tests passing
- [ ] Performance metrics acceptable
- [ ] Security scan completed
- [ ] Domain/DNS configured
- [ ] SSL certificate valid
- [ ] Health check endpoint working

### Emergency Rollback

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Git rollback
git revert HEAD
git push origin main

# PM2 rollback (self-hosted)
pm2 reload dsa-visualizer --update-env
```

### Support Contacts
- **Deployment Issues**: Create GitHub issue với label `deployment`
- **Performance Problems**: Include lighthouse report và bundle analysis
- **Security Concerns**: Contact maintainers privately
- **Infrastructure**: Check platform status pages (Vercel, Netlify, etc.)

Happy deploying! 🚀
