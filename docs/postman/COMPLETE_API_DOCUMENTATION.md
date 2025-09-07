# DigiUp API - Complete Collection Documentation

Dokumentasi lengkap untuk Postman Collection DigiUp API yang mencakup semua endpoint.

## 📁 **Struktur Collection**

### 1. **Auth OAuth**
Endpoint untuk autentikasi manual dan Google OAuth

- **Login Manual** - `POST /api/v1/auth/login`
- **Register Manual** - `POST /api/v1/auth/register`
- **Google OAuth URL** - `GET /api/v1/auth/google/url`
- **Google OAuth Callback** - `GET /api/v1/auth/google/callback`
- **Google OAuth Token** - `POST /api/v1/auth/google/token`
- **Logout** - `GET /api/v1/auth/logout`
- **Forgot Password Request** - `POST /api/v1/auth/forgot-password`

### 2. **Auth CreatorUp**
Endpoint untuk integrasi CreatorUp

- **Register to CreatorUp** - `POST /api/v1/creatorup/auth/register`
- **Login to CreatorUp** - `POST /api/v1/creatorup/auth/login`
- **Save CreatorUp Credentials** - `POST /api/v1/creatorup/auth/credentials`
- **Get CreatorUp Credentials** - `GET /api/v1/creatorup/auth/credentials`
- **Check CreatorUp Registration Status** - `GET /api/v1/creatorup/auth/status`

### 3. **Apps - User**
Endpoint apps untuk user

- **Get All Apps (Public)** - `GET /api/v1/apps`
- **Get App Detail (Public)** - `GET /api/v1/apps/:id`
- **Get User's Apps (Authenticated)** - `GET /api/v1/apps/user/all`
- **Get User's App Detail (Authenticated)** - `GET /api/v1/apps/user/:id`
- **Get User Profile** - `GET /api/v1/user/me`
- **Update User Profile** - `PATCH /api/v1/user/me`

### 4. **Apps - Admin**
Endpoint apps dan users untuk admin

- **Get All Apps (Admin)** - `GET /api/v1/admin/apps`
- **Create App** - `POST /api/v1/admin/apps`
- **Update App** - `PUT /api/v1/admin/apps/:id`
- **Delete App** - `DELETE /api/v1/admin/apps/:id`
- **Get All Users** - `GET /api/v1/admin/users`

## 🔧 **Environment Variables**

### **API Configuration**
- `base_url` - Base URL API (default: `http://localhost:3345`)

### **Authentication Tokens**
- `digiup_token` - Token user dari login DigiUp
- `admin_token` - Token admin untuk endpoint admin

### **User Credentials**
- `user_email` - Email user untuk login
- `user_password` - Password user untuk login
- `new_user_email` - Email untuk register user baru
- `new_user_name` - Nama untuk register user baru
- `new_user_phone` - Phone untuk register user baru
- `new_user_password` - Password untuk register user baru

### **CreatorUp Credentials**
- `creatorup_email` - Email untuk CreatorUp
- `creatorup_password` - Password untuk CreatorUp
- `creatorup_username` - Username untuk CreatorUp

### **App Testing**
- `app_id` - ID app untuk testing (contoh: `creatorup-app`)
- `app_category` - Kategori app (Creation, Automation, Analytics, Collaboration)

### **Google OAuth**
- `google_auth_code` - Authorization code dari Google OAuth

### **Update Data**
- `updated_name` - Nama baru untuk update profile
- `updated_phone` - Phone baru untuk update profile
- `updated_avatar` - Avatar baru untuk update profile

### **Admin App Management**
- `new_app_name` - Nama app baru
- `new_app_description` - Deskripsi app baru
- `new_app_logo` - Logo app baru
- `new_app_category` - Kategori app baru
- `new_app_url` - URL app baru

## 🚀 **Testing Flow**

### **1. Authentication Flow**
1. **Login Manual** → Copy token ke `digiup_token`
2. **Test authenticated endpoints**
3. **Logout** → Clear session

### **2. Google OAuth Flow**
1. **Get Google OAuth URL** → Buka URL di browser
2. **Complete OAuth** → Copy code dari callback
3. **Set code** ke `google_auth_code`
4. **Use Google OAuth Token** → Get token dan user data

### **3. CreatorUp Integration Flow**
1. **Login to DigiUp** → Get `digiup_token`
2. **Check CreatorUp Status** → `isRegistered: false`
3. **Register to CreatorUp** → Register ke platform CreatorUp
4. **Check CreatorUp Status** → `isRegistered: true`
5. **Login to CreatorUp** → Get CreatorUp token
6. **Get User Apps** → Lihat CreatorUp di list apps

### **4. User Apps Flow**
1. **Get All Apps (Public)** → List semua apps
2. **Login as User** → Get token
3. **Get User's Apps** → List apps dengan status user
4. **Get User's App Detail** → Detail app dengan ownership info
5. **Get User Profile** → Profile dengan CreatorUp status

### **5. Admin Flow**
1. **Login as Admin** → Get `admin_token`
2. **Get All Apps (Admin)** → List semua apps termasuk inactive
3. **Create App** → Buat app baru
4. **Update App** → Edit app
5. **Delete App** → Hapus app
6. **Get All Users** → List semua users

## 📊 **Response Examples**

### **Login Response**
```json
{
  "success": true,
  "message": "Login successful",
  "content": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@digiup.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### **User Apps Response**
```json
{
  "success": true,
  "message": "User apps retrieved successfully",
  "content": {
    "Creation": [
      {
        "id": "creatorup-app",
        "name": "CreatorUp",
        "isUserOwned": true,
        "userStatus": "registered"
      }
    ]
  }
}
```

### **CreatorUp Status Response**
```json
{
  "success": true,
  "message": "Registration status checked",
  "content": {
    "isRegistered": true,
    "userId": "user_id",
    "email": "user@digiup.com"
  }
}
```

## 🔐 **Authentication Requirements**

### **Public Endpoints (No Auth)**
- Get All Apps (Public)
- Get App Detail (Public)
- Login Manual
- Register Manual
- Google OAuth endpoints

### **User Authentication Required**
- Get User's Apps
- Get User's App Detail
- User Profile endpoints
- CreatorUp endpoints
- Logout

### **Admin Authentication Required**
- Admin Apps management
- Get All Users
- Create/Update/Delete Apps

## �� **Troubleshooting**

### **401 Unauthorized**
- Pastikan token sudah di-set di environment
- Cek apakah token masih valid
- Pastikan menggunakan token yang benar (user vs admin)

### **404 Not Found**
- Cek base_url di environment
- Pastikan server berjalan
- Cek endpoint path

### **422 Validation Error**
- Cek payload sesuai schema
- Pastikan required fields terisi
- Cek format data (email, phone, etc.)

## 📋 **Setup Instructions**

1. **Import Collection** → `DigiUp_API_Complete_Collection.json`
2. **Import Environment** → `DigiUp_API_Environment.json`
3. **Select Environment** → Pilih "DigiUp API - Complete Environment"
4. **Update base_url** → Sesuaikan dengan server Anda
5. **Start Testing** → Mulai dari Auth OAuth atau langsung ke endpoint lain

## 🎯 **Tips Testing**

- **Use Variables** → Semua parameter menggunakan environment variables
- **Follow Flow** → Ikuti urutan testing yang disarankan
- **Copy Tokens** → Selalu copy token dari response ke environment
- **Check Responses** → Perhatikan status code dan response format
- **Test Different Scenarios** → Test dengan user yang sudah/belum register CreatorUp

---

**Collection Version:** 2.0.0  
**Last Updated:** September 2024  
**Total Endpoints:** 20+  
**Categories:** 4 (Auth OAuth, Auth CreatorUp, Apps User, Apps Admin)
