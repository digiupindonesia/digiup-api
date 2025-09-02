# API Versioning Structure

## Overview
This API now uses flexible versioning with environment variables for easy migration between API versions.

## Endpoint Structure
```
{{base_url}}/{{version}}/module/action
```

Example:
- v1: `http://localhost:3345/api/v1/client/auth/login`
- v2: `http://localhost:3345/api/v2/client/auth/login`

## Environment Variables

### .env Configuration
```properties
API_PREFIX='api'
API_VERSION='v1'
BASE_URL='http://localhost:3345/api/v1'
```

### Postman Environment Variables
```json
{
  "base_url": "http://localhost:3345/api",
  "version": "v1"
}
```

## Migration to v2

To migrate to v2, you only need to:

1. **Update .env file:**
   ```properties
   API_VERSION='v2'
   BASE_URL='http://localhost:3345/api/v2'
   ```

2. **Update Postman environment:**
   ```json
   {
     "version": "v2"
   }
   ```

3. **Implement v2 routes** (optional - create new route structure if needed)

## Authentication Endpoints

### Manual Authentication
- `{{base_url}}/{{version}}/client/auth/register` - Register with email/password
- `{{base_url}}/{{version}}/client/auth/login` - Login with email/password
- `{{base_url}}/{{version}}/client/auth/logout` - Logout

### Google OAuth Authentication  
- `{{base_url}}/{{version}}/client/auth/google` - Get Google OAuth URL
- `{{base_url}}/{{version}}/client/auth/google/callback` - Handle Google callback
- `{{base_url}}/{{version}}/client/auth/google/token` - Login/Register with Google

### Password Recovery (Manual only)
- `{{base_url}}/{{version}}/client/auth/forgotpassword/request` - Request reset
- `{{base_url}}/{{version}}/client/auth/forgotpassword/reset` - Reset password

## Postman Collections

1. **Import main collection:** `docs/postman/postman_collection_updated.json`
2. **Choose environment:**
   - v1: `docs/postman/postman_environment_updated.json`
   - v2: `docs/postman/postman_environment_v2.json`

## Benefits

✅ **Flexible Versioning**: Easy migration without changing every endpoint  
✅ **Environment Based**: Different environments can use different versions  
✅ **Backward Compatible**: v1 endpoints still work  
✅ **Future Proof**: Easy to add v3, v4, etc.  
✅ **Centralized Config**: Version managed in one place  
