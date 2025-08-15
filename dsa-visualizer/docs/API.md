# 📡 API Documentation - DSA Visualizer

Tài liệu API chi tiết cho DSA Visualizer project (future implementation).

## 📋 Mục lục

- [API Overview](#api-overview)
- [Authentication](#authentication)  
- [User Management](#user-management)
- [Progress Tracking](#progress-tracking)
- [Analytics](#analytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)

## 🌍 API Overview

### Base URLs
```
Development: http://localhost:3000/api
Staging: https://staging.dsa-visualizer.com/api
Production: https://api.dsa-visualizer.com
```

### API Versioning
```
Current Version: v1
Endpoint Format: /api/v1/{resource}
```

### Response Format
All API responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}
```

### Example Success Response
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "student1",
    "displayName": "Học viên A"
  },
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Example Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z", 
    "requestId": "req_abc123"
  }
}
```

## 🔐 Authentication

### Authentication Methods

#### 1. Session-based Authentication
```typescript
// Login endpoint
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "student"
    },
    "session": {
      "token": "session_token_here",
      "expiresAt": "2024-12-21T10:30:00Z"
    }
  }
}
```

#### 2. JWT Authentication (Future)
```typescript
// Headers required for authenticated requests
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### 3. API Key Authentication (Future)
```typescript
// Headers for API key access
X-API-Key: your_api_key_here
Content-Type: application/json
```

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "password123",
  "rememberMe": false
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <refresh_token>
```

#### Password Reset
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 👥 User Management

### User Object
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: 'admin' | 'instructor' | 'student';
  preferences: {
    theme: 'light' | 'dark';
    language: 'vi' | 'en';
    defaultSpeed: number;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
```

### User Endpoints

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "student1",
    "displayName": "Học viên A",
    "role": "student",
    "preferences": {
      "theme": "dark",
      "language": "vi",
      "defaultSpeed": 500,
      "notifications": true
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLoginAt": "2024-12-20T09:30:00Z"
  }
}
```

#### Update User Profile
```http
PATCH /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Tên mới",
  "preferences": {
    "theme": "light",
    "defaultSpeed": 300
  }
}
```

#### Get User by ID (Admin/Instructor only)
```http
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

#### List Users (Admin/Instructor only)
```http
GET /api/v1/users?page=1&limit=20&role=student&search=query
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "username": "student1",
      "displayName": "Học viên A",
      "role": "student"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

## 📊 Progress Tracking

### Progress Object
```typescript
interface AlgorithmProgress {
  id: string;
  userId: string;
  algorithmSlug: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  attempts: number;
  bestTimeMs?: number;
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LearningSession {
  id: string;
  userId: string;
  algorithmSlug: string;
  sessionData: {
    steps: number;
    timeSpent: number;
    errorsCount: number;
    hintsUsed: number;
  };
  completed: boolean;
  createdAt: string;
}
```

### Progress Endpoints

#### Get User Progress
```http
GET /api/v1/users/{userId}/progress
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "progress_123",
      "algorithmSlug": "bubble-sort",
      "status": "completed",
      "attempts": 3,
      "bestTimeMs": 45000,
      "lastAttemptAt": "2024-12-19T15:30:00Z"
    },
    {
      "id": "progress_124",
      "algorithmSlug": "binary-search",
      "status": "in_progress", 
      "attempts": 1,
      "lastAttemptAt": "2024-12-20T09:00:00Z"
    }
  ]
}
```

#### Start Learning Session
```http
POST /api/v1/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "algorithmSlug": "bubble-sort",
  "initialData": [64, 34, 25, 12, 22, 11, 90]
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "algorithmSlug": "bubble-sort", 
    "startedAt": "2024-12-20T10:00:00Z"
  }
}
```

#### Update Learning Session
```http
PATCH /api/v1/sessions/{sessionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionData": {
    "steps": 15,
    "timeSpent": 120000,
    "errorsCount": 2,
    "hintsUsed": 1
  },
  "completed": false
}
```

#### Complete Learning Session  
```http
POST /api/v1/sessions/{sessionId}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionData": {
    "steps": 25,
    "timeSpent": 180000,
    "errorsCount": 3,
    "hintsUsed": 2
  },
  "success": true
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "progressUpdated": true,
    "newStatus": "completed",
    "achievements": ["first_sort_completion"]
  }
}
```

#### Get Progress Statistics
```http
GET /api/v1/users/{userId}/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalAlgorithms": 24,
    "completedAlgorithms": 8,
    "inProgressAlgorithms": 3,
    "totalTimeSpent": 7200000,
    "averageAttempts": 2.3,
    "strengths": ["sorting", "searching"],
    "weaknesses": ["graph-algorithms"],
    "achievements": [
      {
        "type": "first_sort",
        "earnedAt": "2024-12-15T10:00:00Z"
      }
    ]
  }
}
```

## 📈 Analytics

### Analytics Endpoints

#### Track Event
```http
POST /api/v1/analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventType": "algorithm_start",
  "eventData": {
    "algorithmSlug": "bubble-sort",
    "difficulty": "beginner",
    "dataSize": 10
  }
}
```

#### Get User Analytics (Self)
```http
GET /api/v1/analytics/users/me?period=30d
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "period": "30d",
    "totalSessions": 45,
    "totalTimeSpent": 18000000,
    "algorithmsLearned": 12,
    "dailyActivity": [
      {
        "date": "2024-12-20",
        "sessions": 3,
        "timeSpent": 3600000
      }
    ],
    "algorithmProgress": {
      "sorting": 85,
      "searching": 70,
      "graphs": 30
    }
  }
}
```

#### Get Classroom Analytics (Instructor/Admin)
```http
GET /api/v1/analytics/classroom?classId=class_123&period=7d
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "classId": "class_123", 
    "period": "7d",
    "totalStudents": 30,
    "activeStudents": 25,
    "averageProgress": 65,
    "topPerformers": [
      {
        "userId": "user_123",
        "username": "student1",
        "progress": 95
      }
    ],
    "strugglingStudents": [
      {
        "userId": "user_456", 
        "username": "student2",
        "progress": 25
      }
    ],
    "popularAlgorithms": [
      {
        "slug": "bubble-sort",
        "completions": 28
      }
    ]
  }
}
```

## ❌ Error Handling

### Error Codes
```typescript
enum ErrorCodes {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Resource
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}
```

### HTTP Status Codes
```typescript
// Success
200 OK - Request successful
201 Created - Resource created
202 Accepted - Request accepted (async processing)
204 No Content - Success with no response body

// Client Errors  
400 Bad Request - Invalid request data
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
409 Conflict - Resource conflict
422 Unprocessable Entity - Validation failed
429 Too Many Requests - Rate limit exceeded

// Server Errors
500 Internal Server Error - Server error
502 Bad Gateway - Gateway error  
503 Service Unavailable - Service temporarily down
504 Gateway Timeout - Gateway timeout
```

### Error Response Examples

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  },
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

#### Authorization Error
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to access this resource"
  },
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

## ⚡ Rate Limiting

### Rate Limit Rules
```typescript
interface RateLimitRule {
  endpoint: string;
  method: string;
  limit: number;
  window: string;
  scope: 'ip' | 'user' | 'apikey';
}

const rateLimits: RateLimitRule[] = [
  // Authentication endpoints
  {
    endpoint: '/api/v1/auth/login',
    method: 'POST',
    limit: 5,
    window: '15m',
    scope: 'ip'
  },
  
  // General API endpoints
  {
    endpoint: '/api/v1/*',
    method: '*',
    limit: 1000,
    window: '1h', 
    scope: 'user'
  },

  // Analytics endpoints
  {
    endpoint: '/api/v1/analytics/*',
    method: 'POST',
    limit: 100,
    window: '1h',
    scope: 'user'
  }
];
```

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
X-RateLimit-Window: 3600
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 1000,
      "window": 3600,
      "resetAt": "2024-12-20T12:00:00Z"
    }
  }
}
```

## 🎣 Webhooks

### Webhook Events
```typescript
type WebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'progress.completed'
  | 'session.started'
  | 'session.completed'
  | 'achievement.earned';

interface WebhookPayload {
  event: WebhookEvent;
  data: any;
  timestamp: string;
  webhookId: string;
}
```

### Webhook Endpoints

#### Create Webhook
```http
POST /api/v1/webhooks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/dsa-visualizer",
  "events": ["progress.completed", "achievement.earned"],
  "secret": "your_webhook_secret"
}
```

#### List Webhooks
```http
GET /api/v1/webhooks
Authorization: Bearer <admin_token>
```

#### Update Webhook
```http
PATCH /api/v1/webhooks/{webhookId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "events": ["user.created", "progress.completed"]
}
```

### Webhook Payload Examples

#### Progress Completed
```json
{
  "event": "progress.completed",
  "data": {
    "userId": "user_123",
    "algorithmSlug": "bubble-sort",
    "status": "completed",
    "attempts": 3,
    "timeSpent": 180000,
    "completedAt": "2024-12-20T10:30:00Z"
  },
  "timestamp": "2024-12-20T10:30:00Z",
  "webhookId": "webhook_123"
}
```

#### Achievement Earned
```json
{
  "event": "achievement.earned",
  "data": {
    "userId": "user_123", 
    "achievementType": "speed_master",
    "achievementData": {
      "algorithm": "bubble-sort",
      "timeMs": 30000,
      "threshold": 45000
    },
    "earnedAt": "2024-12-20T10:30:00Z"
  },
  "timestamp": "2024-12-20T10:30:00Z",
  "webhookId": "webhook_123"
}
```

---

## 🔧 Development Tools

### API Testing với Postman/Insomnia

#### Collection Setup
```json
{
  "info": {
    "name": "DSA Visualizer API",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "auth_token", 
      "value": ""
    }
  ]
}
```

#### Environment Variables
```json
{
  "development": {
    "base_url": "http://localhost:3000/api/v1",
    "auth_token": "dev_token_here"
  },
  "staging": {
    "base_url": "https://staging.dsa-visualizer.com/api/v1",
    "auth_token": "staging_token_here"  
  },
  "production": {
    "base_url": "https://api.dsa-visualizer.com/v1",
    "auth_token": "prod_token_here"
  }
}
```

### OpenAPI/Swagger Specification
```yaml
# api-docs.yaml
openapi: 3.0.0
info:
  title: DSA Visualizer API
  version: 1.0.0
  description: API cho DSA Visualizer platform
servers:
  - url: https://api.dsa-visualizer.com/v1
    description: Production server
  - url: https://staging.dsa-visualizer.com/api/v1  
    description: Staging server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  /users/me:
    get:
      summary: Get current user
      security:
        - BearerAuth: []
      responses:
        200:
          description: User information
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

---

**Happy API development! 🚀**

Để biết thêm chi tiết về implementation, vui lòng check:
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Technical implementation details
- [DATABASE.md](DATABASE.md) - Database schema và setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment và environment configuration
