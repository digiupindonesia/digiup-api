# DigiUp API Documentation

Dokumentasi lengkap untuk DigiUp API, termasuk integrasi CreatorUp Authentication dan User Apps.

## 📁 Struktur Dokumentasi

### 🚀 **API Documentation**
- **`API_VERSIONING.md`** - Dokumentasi versioning API
- **`APPS_API_DOCUMENTATION.md`** - Dokumentasi API untuk apps
- **`ARCHITECTURE_EXPLANATION.md`** - Penjelasan arsitektur sistem

### 🔧 **Integration Documentation**
- **`CREATORUP_INTEGRATION_API.md`** - Dokumentasi integrasi CreatorUp
- **`GOOGLE_OAUTH_FLOW.md`** - Dokumentasi Google OAuth flow

### 📦 **Postman Collections**
- **`postman/`** - Folder berisi collection Postman untuk testing
  - `CreatorUp_Auth_Postman_Collection.json` - Collection lengkap
  - `CreatorUp_Auth_Postman_Environment.json` - Environment variables
  - `README.md` - Instruksi setup dan penggunaan
  - `POSTMAN_SETUP_INSTRUCTIONS.md` - Panduan lengkap setup
  - `CREATORUP_AUTH_ENDPOINTS.md` - Dokumentasi endpoint CreatorUp
  - `USER_APPS_ENDPOINTS.md` - Dokumentasi endpoint User Apps

### 🔍 **OpenAPI/Swagger**
- **`openapi/`** - Folder berisi file OpenAPI/Swagger
  - `swagger.yml` - File OpenAPI specification
  - `swagger.yml.backup` - Backup file

## 🎯 **Quick Start**

### 1. **API Testing dengan Postman**
1. Download file ZIP: `CreatorUp_Postman_Complete.zip`
2. Import collection dan environment ke Postman
3. Setup environment variables
4. Mulai testing endpoint

### 2. **API Documentation**
1. Baca `ARCHITECTURE_EXPLANATION.md` untuk memahami arsitektur
2. Lihat `APPS_API_DOCUMENTATION.md` untuk endpoint apps
3. Cek `CREATORUP_INTEGRATION_API.md` untuk integrasi CreatorUp

### 3. **Development**
1. Gunakan `API_VERSIONING.md` untuk versioning
2. Ikuti `GOOGLE_OAUTH_FLOW.md` untuk OAuth
3. Test dengan Postman collections

## 🚀 **Endpoint Categories**

### **Authentication**
- User registration dan login
- Google OAuth integration
- CreatorUp authentication

### **Apps Management**
- Public apps listing
- User's apps (authenticated)
- App details dengan user status

### **User Management**
- User profile
- User preferences
- User subscriptions

### **CreatorUp Integration**
- Register ke CreatorUp
- Login ke CreatorUp
- Sync user data
- Webhook handling

## 📊 **API Versions**

- **v1** - Current stable version
- **v2** - Future version (planned)

## 🔧 **Development Setup**

### **Local Development**
```bash
# Install dependencies
npm install

# Setup database
npm run prisma:migrate

# Start development server
npm run start:dev
```

### **Testing**
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:badges
```

## 📞 **Support**

Untuk pertanyaan atau masalah:
1. Cek dokumentasi yang tersedia
2. Lihat Postman collections untuk contoh
3. Cek error logs di server

---

**Last Updated**: September 2024  
**Version**: 1.0.0  
**Maintainer**: DigiUp Development Team
