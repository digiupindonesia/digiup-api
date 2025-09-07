# DigiUp API - CreatorUp Integration

## Overview
Dokumentasi ini menjelaskan endpoint-endpoint DigiUp API yang digunakan untuk integrasi dengan CreatorUp. Ketika user login di DigiUp, mereka dapat mengakses CreatorUp menggunakan token dari DigiUp.

## Base URL
```
https://api.digiup.com/api/v1
```

## Authentication
Semua endpoint CreatorUp integration memerlukan Bearer token dari DigiUp:
```
Authorization: Bearer <digiup_token>
```

## Endpoints

### 1. Token Verification
Verifikasi token DigiUp untuk akses CreatorUp.

**Endpoint:** `POST /creatorup/verify`

**Headers:**
```
Authorization: Bearer <digiup_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token verified successfully",
  "data": {
    "user": {
      "digiup_user_id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+6281234567890",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "subscription": {
      "plan": "Pro",
      "status": "active",
      "end_date": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

### 2. User Profile Sync
Mengambil profil user untuk sinkronisasi dengan CreatorUp.

**Endpoint:** `GET /creatorup/profile`

**Headers:**
```
Authorization: Bearer <digiup_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "digiup_user_id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_active": true,
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Access Check
Memeriksa apakah user memiliki akses ke CreatorUp.

**Endpoint:** `GET /creatorup/access`

**Headers:**
```
Authorization: Bearer <digiup_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Access granted",
  "data": {
    "hasAccess": true,
    "subscription": {
      "plan": "Pro",
      "status": "active",
      "end_date": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

## Membership Endpoints

### 1. Get Membership Plans
Mengambil daftar membership plans yang tersedia.

**Endpoint:** `GET /membership/plans`

**Response:**
```json
{
  "status": "success",
  "message": "Membership plans retrieved successfully",
  "data": [
    {
      "plan_id": 1,
      "name": "Starter",
      "price": 0,
      "currency": "IDR",
      "local_rendering_limit": 10,
      "device_limit": 1,
      "video_quality": "medium",
      "has_ai_subtitle": true,
      "has_ai_voiceover": false,
      "support_level": "none"
    },
    {
      "plan_id": 2,
      "name": "Growth",
      "price": 249000,
      "currency": "IDR",
      "local_rendering_limit": 100,
      "device_limit": 1,
      "video_quality": "high",
      "has_ai_subtitle": true,
      "has_ai_voiceover": false,
      "support_level": "standard"
    },
    {
      "plan_id": 3,
      "name": "Pro",
      "price": 499000,
      "currency": "IDR",
      "local_rendering_limit": 500,
      "device_limit": 3,
      "video_quality": "ultra",
      "has_ai_subtitle": true,
      "has_ai_voiceover": true,
      "support_level": "priority"
    }
  ]
}
```

### 2. Subscribe to Plan
Berlangganan ke membership plan tertentu.

**Endpoint:** `POST /membership/subscribe/{planId}`

**Headers:**
```
Authorization: Bearer <digiup_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "payment_reference": "PAY123456789",
  "name": "John Doe",
  "phone": "+6281234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully subscribed to plan",
  "data": {
    "subscription_id": 123,
    "plan": {
      "plan_id": 2,
      "name": "Growth",
      "price": 249000,
      "local_rendering_limit": 100
    },
    "status": "active",
    "start_date": "2024-01-15T00:00:00.000Z",
    "end_date": "2024-02-14T23:59:59.999Z",
    "auto_renew": true
  }
}
```

### 3. Check Feature Access
Memeriksa akses user ke fitur tertentu.

**Endpoint:** `GET /membership/feature/{feature}/access`

**Headers:**
```
Authorization: Bearer <digiup_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Feature access checked",
  "data": {
    "feature": "local_rendering",
    "hasAccess": true,
    "reason": "",
    "plan": "Growth",
    "usage": {
      "local_rendering_used": 25,
      "ai_voiceover_used": 0,
      "last_reset_date": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Batch Usage Tracking Endpoints

### 1. Create Batch
Membuat batch baru untuk tracking usage.

**Endpoint:** `POST /batch/create`

**Headers:**
```
Authorization: Bearer <digiup_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "my-video-batch-001",
  "type": "video",
  "description": "Video processing batch for social media"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Batch created successfully",
  "data": {
    "batch_id": 456,
    "name": "my-video-batch-001",
    "type": "video",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Monthly Usage
Mengambil statistik penggunaan bulanan.

**Endpoint:** `GET /batch/usage/monthly`

**Headers:**
```
Authorization: Bearer <digiup_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Monthly usage retrieved successfully",
  "data": {
    "month_year": "2024-01",
    "total_batches": 15,
    "usage_by_type": {
      "local_rendering": 12,
      "ai_voiceover": 3
    },
    "all_usage": [
      {
        "batch_name": "my-video-batch-001",
        "batch_type": "video",
        "usage_type": "local_rendering",
        "usage_amount": 1,
        "completed_at": "2024-01-15T10:35:00.000Z",
        "metadata": {
          "video_count": 5,
          "processing_time": "2 minutes"
        }
      }
    ]
  }
}
```

## Error Responses

### Authentication Error
```json
{
  "status": "error",
  "message": "Invalid token",
  "data": null
}
```

### Not Found Error
```json
{
  "status": "error",
  "message": "Plan not found",
  "data": null
}
```

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## Testing

### cURL Examples

#### 1. Verify Token
```bash
curl -X POST "https://api.digiup.com/api/v1/creatorup/verify" \
  -H "Authorization: Bearer YOUR_DIGIUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_DIGIUP_TOKEN"}'
```

#### 2. Get User Profile
```bash
curl -X GET "https://api.digiup.com/api/v1/creatorup/profile" \
  -H "Authorization: Bearer YOUR_DIGIUP_TOKEN"
```

#### 3. Get Membership Plans
```bash
curl -X GET "https://api.digiup.com/api/v1/membership/plans"
```

#### 4. Subscribe to Plan
```bash
curl -X POST "https://api.digiup.com/api/v1/membership/subscribe/2" \
  -H "Authorization: Bearer YOUR_DIGIUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_reference": "PAY123456789",
    "name": "John Doe",
    "phone": "+6281234567890"
  }'
```

#### 5. Create Batch
```bash
curl -X POST "https://api.digiup.com/api/v1/batch/create" \
  -H "Authorization: Bearer YOUR_DIGIUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-video-batch-001",
    "type": "video",
    "description": "Video processing batch"
  }'
```

## Implementation Notes

1. **Token Validation**: Semua endpoint menggunakan middleware `auth('jwt-user')` untuk validasi token
2. **User Context**: User data tersedia di `req.user` setelah authentication
3. **Response Format**: Semua response mengikuti format standar dengan `status`, `message`, dan `data`
4. **Error Handling**: Error handling menggunakan middleware error handler yang sudah ada
5. **Logging**: Semua operasi di-log menggunakan Winston logger

## Database Schema

### New Models Added:
- `MembershipPlan`: Menyimpan data membership plans
- `UserSubscription`: Menyimpan data subscription user
- `BatchUsage`: Menyimpan data penggunaan batch

### Relations:
- User → UserSubscription (one-to-many)
- User → BatchUsage (one-to-many)
- MembershipPlan → UserSubscription (one-to-many)
