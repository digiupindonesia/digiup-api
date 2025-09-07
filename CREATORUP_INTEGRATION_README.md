# DigiUp API - CreatorUp Integration Implementation

## 🎯 Overview
Implementasi ini menambahkan endpoint-endpoint di DigiUp API untuk integrasi dengan CreatorUp. Ketika user login di DigiUp, mereka dapat mengakses CreatorUp menggunakan token dari DigiUp.

## 🚀 Fitur yang Diimplementasikan

### 1. CreatorUp Integration Endpoints
- **Token Verification** (`POST /api/v1/creatorup/verify`)
- **User Profile Sync** (`GET /api/v1/creatorup/profile`)
- **Access Check** (`GET /api/v1/creatorup/access`)

### 2. Membership Management
- **Get Plans** (`GET /api/v1/membership/plans`)
- **Subscribe to Plan** (`POST /api/v1/membership/subscribe/{planId}`)
- **Check Feature Access** (`GET /api/v1/membership/feature/{feature}/access`)

### 3. Batch Usage Tracking
- **Create Batch** (`POST /api/v1/batch/create`)
- **Get Monthly Usage** (`GET /api/v1/batch/usage/monthly`)

## 📁 File yang Dibuat/Dimodifikasi

### Routes
- `src/routes/client/v1/creatorup_route.ts` - Route untuk CreatorUp integration
- `src/routes/client/v1/membership_route.ts` - Route untuk membership management
- `src/routes/client/v1/batch_route.ts` - Route untuk batch usage tracking
- `src/routes/client/v1/index.ts` - Updated untuk menambahkan route baru

### Controllers
- `src/controllers/client/users_auth_controller.ts` - Ditambahkan methods untuk CreatorUp integration
- `src/controllers/client/membership_controller.ts` - Controller untuk membership management
- `src/controllers/client/batch_controller.ts` - Controller untuk batch usage tracking

### Database Schema
- `prisma/schema.prisma` - Ditambahkan models:
  - `MembershipPlan`
  - `UserSubscription`
  - `BatchUsage`

### Documentation
- `docs/CREATORUP_INTEGRATION_API.md` - Dokumentasi lengkap API endpoints

## 🔧 Setup dan Instalasi

### 1. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migration (jika DATABASE_URL sudah dikonfigurasi)
npx prisma migrate dev --name add_membership_and_batch_models
```

### 2. Environment Variables
Pastikan file `.env` memiliki konfigurasi yang diperlukan:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/digiup_db"
JWT_SECRET="your_jwt_secret"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

## �� Testing

### Manual Testing dengan cURL

#### 1. Login untuk mendapatkan token
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 2. Verify token untuk CreatorUp
```bash
curl -X POST "http://localhost:3000/api/v1/creatorup/verify" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN"}'
```

#### 3. Get membership plans
```bash
curl -X GET "http://localhost:3000/api/v1/membership/plans"
```

#### 4. Subscribe to plan
```bash
curl -X POST "http://localhost:3000/api/v1/membership/subscribe/2" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_reference": "PAY123456789",
    "name": "John Doe",
    "phone": "+6281234567890"
  }'
```

## 🔄 Flow Integrasi

### 1. User Login di DigiUp
```
User → DigiUp App → POST /auth/login → DigiUp API
DigiUp API → Return token + user data
```

### 2. User Akses CreatorUp
```
User → CreatorUp App → POST /creatorup/verify (with DigiUp token)
DigiUp API → Verify token → Return user data + subscription info
CreatorUp App → Store user data → Grant access
```

### 3. User Berlangganan Plan
```
User → DigiUp App → POST /membership/subscribe/{planId}
DigiUp API → Create subscription → Return subscription data
```

### 4. User Menggunakan Batch
```
User → CreatorUp App → POST /batch/create
DigiUp API → Create batch record → Return batch data
```

## 📊 Database Schema

### MembershipPlan
```sql
CREATE TABLE membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'IDR',
  local_rendering_limit INTEGER DEFAULT 10,
  device_limit INTEGER DEFAULT 1,
  video_quality VARCHAR(50) DEFAULT 'medium',
  has_ai_subtitle BOOLEAN DEFAULT true,
  has_ai_voiceover BOOLEAN DEFAULT false,
  support_level VARCHAR(50) DEFAULT 'none',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### UserSubscription
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES membership_plans(id),
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### BatchUsage
```sql
CREATE TABLE batch_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  batch_name VARCHAR(255) NOT NULL,
  batch_type VARCHAR(50) NOT NULL,
  usage_type VARCHAR(50) NOT NULL,
  usage_amount INTEGER DEFAULT 1,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  completed_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Features

1. **JWT Token Authentication**: Semua endpoint memerlukan valid token
2. **User Context**: User data tersedia di `req.user` setelah authentication
3. **Input Validation**: Menggunakan middleware validation yang sudah ada
4. **Error Handling**: Centralized error handling dengan logging

## 📝 Notes

1. **Mock Data**: Beberapa endpoint menggunakan mock data untuk demo
2. **Database**: Perlu menjalankan migration untuk menambahkan tabel baru
3. **Environment**: Pastikan DATABASE_URL dikonfigurasi dengan benar
4. **Testing**: Gunakan token yang valid dari login endpoint untuk testing

## 🚀 Next Steps

1. **Database Migration**: Jalankan migration untuk menambahkan tabel baru
2. **Real Data**: Implementasi logic untuk data real (bukan mock)
3. **Payment Integration**: Integrasi dengan payment gateway
4. **Usage Tracking**: Implementasi real-time usage tracking
5. **Testing**: Buat unit test dan integration test
6. **Documentation**: Update Swagger documentation

## 📞 Support

Jika ada pertanyaan atau masalah dengan implementasi ini, silakan hubungi tim development.
