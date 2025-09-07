# Arsitektur DigiUp & CreatorUp - 2 Repository Terpisah

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DigiUp App    │    │  DigiUp API     │    │  CreatorUp API  │
│   (Frontend)    │    │  (Repository 1) │    │  (Repository 2) │
│                 │    │                 │    │                 │
│ - User Register │───▶│ - Auth Service  │    │ - Token Verify  │
│ - Login         │    │ - User Mgmt     │    │ - User Sync     │
│ - Plan Selection│    │ - Plan Mgmt     │    │ - Membership    │
│ - Payment       │    │ - Payment       │    │ - Batch Usage   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   DigiUp DB     │    │  CreatorUp DB   │
                       │                 │    │                 │
                       │ - Users         │    │ - Users (sync)  │
                       │ - Subscriptions │    │ - Batches       │
                       │ - Plans         │    │ - Usage         │
                       └─────────────────┘    └─────────────────┘
```

## 🔄 Flow Integrasi

### 1. User Journey
```
User → DigiUp App → DigiUp API → CreatorUp API
```

### 2. Repository Structure
```
digiup-api/          (Repository 1 - Yang sedang kita kerjakan)
├── src/
│   ├── routes/
│   │   └── client/v1/
│   │       ├── creatorup_route.ts    ← Endpoint untuk CreatorUp
│   │       ├── membership_route.ts   ← Membership management
│   │       └── batch_route.ts        ← Batch tracking
│   └── controllers/
│       └── client/
│           ├── users_auth_controller.ts
│           ├── membership_controller.ts
│           └── batch_controller.ts
└── prisma/
    └── schema.prisma                 ← Database schema

creatorup-api/       (Repository 2 - Terpisah)
├── src/
│   ├── routes/
│   │   └── digiup/
│   │       ├── verify_route.ts       ← Verify DigiUp token
│   │       ├── user_sync_route.ts    ← Sync user data
│   │       └── membership_route.ts   ← Check membership
│   └── controllers/
│       └── digiup/
│           ├── auth_controller.ts
│           └── membership_controller.ts
└── database/
    └── models/                       ← CreatorUp database
```

## 🔗 API Communication

### DigiUp API (Repository 1) - Endpoints yang sudah dibuat:
```bash
# CreatorUp Integration
POST /api/v1/client/creatorup/verify
GET  /api/v1/client/creatorup/profile  
GET  /api/v1/client/creatorup/access

# Membership Management
GET  /api/v1/client/membership/plans
POST /api/v1/client/membership/subscribe/{planId}
GET  /api/v1/client/membership/feature/{feature}/access

# Batch Usage Tracking
POST /api/v1/client/batch/create
GET  /api/v1/client/batch/usage/monthly
```

### CreatorUp API (Repository 2) - Endpoints yang perlu dibuat:
```bash
# DigiUp Integration
POST /api/v1/digiup/verify           ← Call DigiUp API
GET  /api/v1/digiup/user/sync        ← Sync user from DigiUp
GET  /api/v1/digiup/membership/check ← Check membership

# CreatorUp Features
POST /api/v1/batch/create            ← Create batch in CreatorUp
POST /api/v1/video/process           ← Process video
GET  /api/v1/usage/monthly           ← Get usage stats
```

## 🔄 Communication Flow

### 1. User Login di DigiUp
```
User → DigiUp App → POST /api/v1/client/auth/login → DigiUp API
DigiUp API → Return JWT Token + User Data
```

### 2. User Akses CreatorUp
```
User → CreatorUp App → POST /api/v1/digiup/verify → CreatorUp API
CreatorUp API → POST /api/v1/client/creatorup/verify → DigiUp API
DigiUp API → Verify Token → Return User Data
CreatorUp API → Store User Data → Grant Access
```

### 3. User Berlangganan Plan
```
User → DigiUp App → POST /api/v1/client/membership/subscribe/{planId} → DigiUp API
DigiUp API → Create Subscription → Return Subscription Data
```

### 4. User Menggunakan CreatorUp
```
User → CreatorUp App → POST /api/v1/batch/create → CreatorUp API
CreatorUp API → Create Batch → POST /api/v1/client/batch/create → DigiUp API
DigiUp API → Record Usage → Return Success
```

## 🛠️ Implementation Status

### ✅ DigiUp API (Repository 1) - COMPLETED
- [x] CreatorUp integration endpoints
- [x] Membership management endpoints  
- [x] Batch usage tracking endpoints
- [x] Database schema (Prisma)
- [x] Authentication middleware
- [x] API documentation
- [x] Testing (Manual)

### ⏳ CreatorUp API (Repository 2) - PENDING
- [ ] DigiUp integration endpoints
- [ ] User sync functionality
- [ ] Membership verification
- [ ] Batch processing
- [ ] Usage tracking
- [ ] Database integration

## 🔧 Next Steps

### 1. DigiUp API (Repository 1) - Production Ready
```bash
# Database migration
npx prisma migrate dev --name add_membership_and_batch_models

# Deploy to production
npm run build
npm run start:prod
```

### 2. CreatorUp API (Repository 2) - Development Needed
```bash
# Create new repository
git clone <creatorup-repo>
cd creatorup-api

# Implement DigiUp integration
# - Create endpoints to call DigiUp API
# - Implement user sync
# - Add membership verification
# - Build batch processing
```

## 📡 API Calls Between Repositories

### CreatorUp → DigiUp API Calls
```javascript
// CreatorUp API calls DigiUp API
const verifyDigiUpToken = async (token) => {
  const response = await fetch('https://api.digiup.com/api/v1/client/creatorup/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  return response.json();
};

const checkMembership = async (token) => {
  const response = await fetch('https://api.digiup.com/api/v1/client/membership/feature/local_rendering/access', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

const recordBatchUsage = async (token, batchData) => {
  const response = await fetch('https://api.digiup.com/api/v1/client/batch/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batchData)
  });
  return response.json();
};
```

## 🔐 Security & Authentication

### 1. Token Flow
```
DigiUp App → Login → Get JWT Token
CreatorUp App → Receive Token → Verify with DigiUp API
DigiUp API → Validate Token → Return User Data
CreatorUp API → Store User Data → Grant Access
```

### 2. CORS Configuration
```javascript
// DigiUp API CORS
app.use(cors({
  origin: [
    'https://app.digiup.com',
    'https://app.creatorup.com',
    'https://api.creatorup.com'
  ],
  credentials: true
}));
```

## 📊 Database Schema

### DigiUp Database (Repository 1)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  -- ... other fields
);

-- Membership plans
CREATE TABLE membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price INTEGER,
  -- ... other fields
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id INTEGER REFERENCES membership_plans(id),
  -- ... other fields
);

-- Batch usage tracking
CREATE TABLE batch_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  batch_name VARCHAR(255),
  -- ... other fields
);
```

### CreatorUp Database (Repository 2)
```sql
-- Synced users from DigiUp
CREATE TABLE digiup_users (
  id UUID PRIMARY KEY,
  digiup_user_id UUID,  -- Reference to DigiUp user
  email VARCHAR(255),
  name VARCHAR(255),
  -- ... other fields
);

-- CreatorUp batches
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES digiup_users(id),
  name VARCHAR(255),
  status VARCHAR(50),
  -- ... other fields
);

-- Usage tracking
CREATE TABLE usage_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES digiup_users(id),
  usage_type VARCHAR(50),
  usage_amount INTEGER,
  -- ... other fields
);
```

## 🚀 Deployment Strategy

### 1. DigiUp API Deployment
```bash
# Environment variables
DIGIUP_API_URL=https://api.digiup.com
CREATORUP_API_URL=https://api.creatorup.com

# Deploy
docker build -t digiup-api .
docker run -p 3345:3345 digiup-api
```

### 2. CreatorUp API Deployment
```bash
# Environment variables
DIGIUP_API_URL=https://api.digiup.com
CREATORUP_API_URL=https://api.creatorup.com

# Deploy
docker build -t creatorup-api .
docker run -p 3000:3000 creatorup-api
```

## 📝 Summary

**DigiUp API (Repository 1)** - ✅ COMPLETED
- Sudah diimplementasikan dengan lengkap
- Siap untuk production
- Endpoint untuk CreatorUp integration sudah tersedia

**CreatorUp API (Repository 2)** - ⏳ PENDING
- Perlu dibuat repository terpisah
- Perlu implementasi endpoint untuk call DigiUp API
- Perlu implementasi user sync dan membership verification

**Flow Integrasi:**
1. User login di DigiUp → dapat token
2. User akses CreatorUp → CreatorUp verify token dengan DigiUp API
3. CreatorUp sync user data → grant access
4. User menggunakan CreatorUp → record usage di DigiUp API
