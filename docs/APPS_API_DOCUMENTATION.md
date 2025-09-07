# 📱 DigiUp Apps API Documentation

## Overview

API ini menyediakan endpoint untuk mengelola aplikasi yang tersedia di platform DigiUp. Terdapat dua level akses:

- **Client API**: Untuk menampilkan aplikasi kepada user (tidak memerlukan autentikasi)
- **Admin API**: Untuk mengelola aplikasi (memerlukan autentikasi admin)

## Base URL

```
http://localhost:3345/api
```

## Authentication

Admin endpoints memerlukan JWT token yang didapat dari login. Tambahkan header:

```
Authorization: Bearer <your-jwt-token>
```

## 📱 Client Endpoints

### 1. Get All Apps

**GET** `/v1/client/apps`

Mengambil semua aplikasi yang aktif, dikelompokkan berdasarkan kategori.

**Query Parameters:**
- `category` (optional): Filter berdasarkan kategori
  - Values: `Creation`, `Automation`, `Analytics`, `Collaboration`

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "content": {
    "Creation": [
      {
        "id": "uuid-1",
        "name": "Creatorup",
        "description": "Auto Konten Generator",
        "logo": "https://example.com/logo.png",
        "category": "Creation",
        "status": "active",
        "isEarlyAccess": true,
        "features": ["AI Content Generation", "Template Library"],
        "pricing": {
          "type": "freemium",
          "plans": [
            {
              "name": "Basic",
              "price": 0,
              "features": ["10 generations/month"]
            }
          ]
        },
        "tags": ["AI", "Content", "Generator"],
        "sortOrder": 1,
        "createdAt": "2025-09-06T10:00:00.000Z"
      }
    ],
    "Automation": [...],
    "Analytics": [...],
    "Collaboration": [...]
  }
}
```

### 2. Get App Detail

**GET** `/v1/client/apps/{id}`

Mengambil detail aplikasi berdasarkan ID.

**Path Parameters:**
- `id`: UUID aplikasi

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "content": {
    "id": "uuid-1",
    "name": "Creatorup",
    "description": "Auto Konten Generator untuk membuat konten kreatif dengan mudah menggunakan AI",
    "logo": "https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=C",
    "category": "Creation",
    "status": "active",
    "appUrl": "https://creatorup.app",
    "features": [
      "AI Content Generation",
      "Template Library",
      "Multi-format Export",
      "Collaboration Tools"
    ],
    "pricing": {
      "type": "freemium",
      "plans": [
        {
          "name": "Basic",
          "price": 0,
          "features": ["10 generations/month"]
        },
        {
          "name": "Pro",
          "price": 99000,
          "features": ["Unlimited generations", "Premium templates"]
        }
      ]
    },
    "tags": ["AI", "Content", "Generator"],
    "isEarlyAccess": true,
    "sortOrder": 1,
    "createdAt": "2025-09-06T10:00:00.000Z"
  }
}
```

## 🔧 Admin Endpoints

### 1. Create App

**POST** `/v1/admin/apps`

Membuat aplikasi baru.

**Request Body:**
```json
{
  "name": "Creatorup",
  "description": "Auto Konten Generator untuk membuat konten kreatif dengan mudah menggunakan AI",
  "logo": "https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=C",
  "category": "Creation",
  "status": "active",
  "appUrl": "https://creatorup.app",
  "features": [
    "AI Content Generation",
    "Template Library",
    "Multi-format Export",
    "Collaboration Tools"
  ],
  "pricing": {
    "type": "freemium",
    "plans": [
      {
        "name": "Basic",
        "price": 0,
        "features": ["10 generations/month"]
      },
      {
        "name": "Pro",
        "price": 99000,
        "features": ["Unlimited generations", "Premium templates"]
      }
    ]
  },
  "tags": ["AI", "Content", "Generator"],
  "isEarlyAccess": true,
  "sortOrder": 1
}
```

**Required Fields:**
- `name`: Nama aplikasi
- `description`: Deskripsi aplikasi
- `category`: Kategori aplikasi

**Optional Fields:**
- `logo`: URL logo
- `status`: Status aplikasi (default: "active")
- `appUrl`: URL aplikasi
- `features`: Array fitur
- `pricing`: Object pricing
- `tags`: Array tag
- `isEarlyAccess`: Boolean early access (default: false)
- `sortOrder`: Urutan tampilan (default: 0)

### 2. Get All Apps (Admin)

**GET** `/v1/admin/apps`

Mengambil semua aplikasi (termasuk yang tidak aktif).

**Response:** Array of apps dengan semua field termasuk `isActive` dan `updatedAt`.

### 3. Update App

**PUT** `/v1/admin/apps/{id}`

Mengupdate aplikasi berdasarkan ID.

**Path Parameters:**
- `id`: UUID aplikasi

**Request Body:** Semua field dari CreateAppRequest + `isActive`

### 4. Delete App

**DELETE** `/v1/admin/apps/{id}`

Menghapus aplikasi berdasarkan ID.

**Path Parameters:**
- `id`: UUID aplikasi

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "content": {
    "message": "App deleted successfully",
    "app": {
      "id": "uuid-1",
      "name": "Creatorup"
    }
  }
}
```

## 📊 Data Models

### DigiupApp

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string (UUID) | Unique identifier | "123e4567-e89b-12d3-a456-426614174000" |
| name | string | Nama aplikasi | "Creatorup" |
| description | string | Deskripsi aplikasi | "Auto Konten Generator..." |
| logo | string (nullable) | URL logo | "https://example.com/logo.png" |
| category | string | Kategori | "Creation", "Automation", "Analytics", "Collaboration" |
| status | string | Status | "active", "inactive", "coming_soon" |
| appUrl | string (nullable) | URL aplikasi | "https://creatorup.app" |
| features | array (nullable) | Daftar fitur | ["AI Content Generation", "Template Library"] |
| pricing | object (nullable) | Info pricing | { "type": "freemium", "plans": [...] } |
| tags | array | Tag aplikasi | ["AI", "Content", "Generator"] |
| isEarlyAccess | boolean | Early access | true |
| sortOrder | integer | Urutan tampilan | 1 |
| isActive | boolean | Status aktif | true |
| createdAt | datetime | Tanggal dibuat | "2025-09-06T10:00:00.000Z" |
| updatedAt | datetime | Tanggal update | "2025-09-06T10:00:00.000Z" |

### Pricing Object

```json
{
  "type": "freemium", // "freemium", "subscription", "one_time"
  "plans": [
    {
      "name": "Basic",
      "price": 0,
      "features": ["10 generations/month"]
    },
    {
      "name": "Pro", 
      "price": 99000,
      "features": ["Unlimited generations", "Premium templates"]
    }
  ]
}
```

## 🚀 Quick Start Examples

### 1. Get All Apps (Client)

```bash
curl -X GET "http://localhost:3345/api/v1/client/apps"
```

### 2. Get Apps by Category

```bash
curl -X GET "http://localhost:3345/api/v1/client/apps?category=Creation"
```

### 3. Get App Detail

```bash
curl -X GET "http://localhost:3345/api/v1/client/apps/123e4567-e89b-12d3-a456-426614174000"
```

### 4. Create App (Admin)

```bash
curl -X POST "http://localhost:3345/api/v1/admin/apps" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New App",
    "description": "Description of new app",
    "category": "Creation",
    "tags": ["New", "App"]
  }'
```

### 5. Update App (Admin)

```bash
curl -X PUT "http://localhost:3345/api/v1/admin/apps/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive",
    "isActive": false
  }'
```

### 6. Delete App (Admin)

```bash
curl -X DELETE "http://localhost:3345/api/v1/admin/apps/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No Authorized",
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "App not found",
  "error": null
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Failed to create app",
  "error": "Validation failed"
}
```

## 📝 Notes

1. **Client endpoints** tidak memerlukan autentikasi dan hanya menampilkan aplikasi yang aktif (`isActive: true` dan `status: "active"`)

2. **Admin endpoints** memerlukan JWT token yang valid

3. **Categories** yang tersedia: Creation, Automation, Analytics, Collaboration

4. **Status** yang tersedia: active, inactive, coming_soon

5. **Pricing types** yang tersedia: freemium, subscription, one_time

6. Aplikasi diurutkan berdasarkan `sortOrder` (ascending) kemudian `createdAt` (descending)

7. Field `features` dan `pricing` disimpan sebagai JSON di database

## 🔗 Related Documentation

- [Swagger UI](http://localhost:3345/api/docs) - Interactive API documentation
- [Authentication API](./GOOGLE_OAUTH.md) - User authentication
- [User Management API](./API_VERSIONING.md) - User management endpoints
