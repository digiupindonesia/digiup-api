# Digiup API - Postman Collection

Koleksi Postman lengkap untuk testing API Digiup dengan semua endpoint yang tersedia.

## 📁 Files

- `postman_collection.json` - ✅ **Collection terbaru** (yang sudah Anda edit)
- `postman_environment_updated.json` - ✅ **Environment yang sudah diperbaiki**
- `postman_environment_fixed.json` - ✅ **Alternative environment** (jika yang atas masih error)
- `postman_collection_updated.json` - Collection original
- `postman_environment.json` - Environment original

## 🚀 Cara Import ke Postman

### 1. Import Collection
```
Postman → Import → Choose Files → pilih "postman_collection.json"
```

### 2. Import Environment
**Coba pertama:**
```
Postman → Import → Choose Files → pilih "postman_environment_updated.json"
```

**Jika gagal, coba:**
```
Postman → Import → Choose Files → pilih "postman_environment_fixed.json"
```

### 3. Set Active Environment
```
Di Postman: Dropdown Environment → pilih "Digiup API Environment"
```

## 🛠️ Troubleshooting Import Error

### Penyebab umum import environment gagal:

1. **Field "type" dan "description"** - Postman versi lama tidak support
2. **ID conflict** - Environment dengan ID sama sudah ada
3. **Format JSON** - Ada karakter atau format yang invalid

### Solusi:

1. ✅ Gunakan `postman_environment_fixed.json` (format yang lebih simple)
2. ✅ Hapus environment lama dengan nama sama di Postman
3. ✅ Update Postman ke versi terbaru

## 🚀 Cara Import ke Postman

### 1. Import Collection
1. Buka Postman
2. Klik **Import** di pojok kiri atas
3. Pilih file `postman_collection_updated.json`
4. Klik **Import**

### 2. Import Environment
1. Klik **Import** lagi
2. Pilih file `postman_environment_updated.json`
3. Klik **Import**
4. Pilih environment "Digiup API Environment" di dropdown pojok kanan atas

## 📋 Endpoint Categories

### 📋 API Info & Health
- `GET /` - Root endpoint
- `GET /info` - API information
- `GET /logs` - API logs (dev only)
- `GET /docs` - Swagger documentation (dev only)

### 👤 Client - Authentication
- `POST /client/auth/register` - Register user
- `GET /client/auth/register/confirmation` - Confirm registration
- `POST /client/auth/login` - Login user
- `GET /client/auth/logout` - Logout user

### 🔐 Client - Password Recovery
- `POST /client/auth/forgotpassword/request` - Request reset
- `POST /client/auth/forgotpassword/reset` - Reset password

### 👥 Client - User Profile
- `GET /client/user/me` - Get profile
- `PATCH /client/user/me` - Update profile
- `DELETE /client/user/me` - Delete account

### 🔧 Admin - User Management
- `GET /admin/users` - Get all users

### 📧 Development - Templates
- `GET /templates/email` - Email templates (dev only)
- `GET /templates/sms` - SMS templates (dev only)

## 🔧 Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | Base API URL | `http://localhost:3345/api` |
| `auth_token` | JWT token for user auth | (empty, auto-set on login) |
| `admin_token` | JWT token for admin auth | (empty, set manually) |
| `user_email` | Test user email | `johndoe@sample.com` |
| `api_version` | API version | `v1` |

## 🧪 Testing Flow

### 1. Register & Login Flow
1. **Register User** - Creates new account
2. **Register Confirmation** - Confirm with email token
3. **Login** - Authenticates and sets `auth_token` automatically
4. **Get My Profile** - Test authenticated endpoint

### 2. Password Reset Flow
1. **Forgot Password Request** - Send reset email
2. **Forgot Password Reset** - Reset with token

### 3. Profile Management
1. **Get My Profile** - View current profile
2. **Update My Profile** - Modify profile data
3. **Delete My Account** - Remove account

## 🔐 Authentication

Most endpoints require JWT authentication. The token is automatically set when you login successfully. For admin endpoints, you need to manually set the `admin_token` variable.

### Auto-Authentication
- Login request automatically saves JWT token to `auth_token` variable
- All subsequent authenticated requests use this token

## 🛠️ Features

### Auto-Tests
- Response time validation (< 5000ms)
- JSON response validation
- Automatic token extraction on login

### Pre-request Scripts
- Auto-sets Content-Type for POST/PATCH requests

### Variables
- Dynamic email handling
- Token auto-management
- Environment-specific base URLs

## 🌍 Environments

### Development (Local)
- Base URL: `http://localhost:3345/api`
- All development endpoints enabled

### Production
- Update `base_url` to production URL
- Some development endpoints may be disabled

## 📝 Sample Requests

### User Registration
```json
{
    "email": "johndoe@sample.com",
    "name": "John Doe",
    "phone": "081234567890",
    "password": "Johndoe@1234"
}
```

### User Login
```json
{
    "email": "johndoe@sample.com",
    "password": "Johndoe@1234"
}
```

### Profile Update
```json
{
    "name": "John Doe Updated",
    "phone": "081234567891",
    "avatar": "https://example.com/avatar.jpg",
    "accountName": "John's Account",
    "accountLocationState": "Jakarta"
}
```

## ⚠️ Notes

- Pastikan server API sudah running di `localhost:3345`
- Beberapa endpoint hanya tersedia di development mode
- Token authentication diperlukan untuk sebagian besar endpoint
- Email confirmation dan password reset memerlukan konfigurasi email yang valid

## 🐛 Troubleshooting

### Port Issues
Jika API berjalan di port lain, update `base_url` di environment variables.

### Authentication Issues
- Pastikan login berhasil dan token tersimpan
- Check token di environment variables
- Pastikan token belum expired

### Missing Endpoints
Jika ada endpoint yang belum tercakup, bisa ditambahkan manual atau request update collection.
