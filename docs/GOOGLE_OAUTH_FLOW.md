# Google OAuth Flow Documentation

## ❌ COMMON MISTAKE
**DO NOT** use `GOOGLE_CLIENT_SECRET` as the "code" value in request body!

```json
// ❌ WRONG - Don't do this!
{
  "code": "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"  // This is CLIENT_SECRET, not auth code!
}
```

## ✅ CORRECT Google OAuth Flow

### Step 1: Get Google OAuth URL
```bash
GET {{base_url}}/{{version}}/client/auth/google

Response:
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### Step 2: User Authorization
1. Copy the `authUrl` from Step 1
2. Open it in browser 
3. User grants permission
4. Google redirects to: `http://localhost:3345/api/v1/client/auth/google/callback?code=4/0AfJohXlgABC123xyz&state=...`
5. Copy the `code` parameter value

### Step 3: Exchange Code for JWT Token
```bash
POST {{base_url}}/{{version}}/client/auth/google/token
Content-Type: application/json

{
  "code": "4/0AfJohXlgABC123xyz",     // ✅ Auth code from Step 2
  "state": "optional_state_parameter"  // Optional
}
```

### Step 4: Get JWT Token Response
```json
{
  "success": true,
  "message": "Login successful",
  "content": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "user@gmail.com",
      "name": "User Name",
      "google_signin": true
    }
  }
}
```

## 🔑 Key Differences

| Field | Source | Usage | Example |
|-------|--------|-------|---------|
| **`code`** | Google OAuth redirect | Temporary auth code for token exchange | `4/0AfJohXlgABC123xyz` |
| **`GOOGLE_CLIENT_SECRET`** | .env file | Server-side Google API communication | `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` |
| **`access_token`** | Google token response | Access Google APIs on behalf of user | `ya29.a0AfH6SMBq...` |

## ⚠️ Security Notes

1. **`GOOGLE_CLIENT_SECRET`** is server-side only - never expose to client
2. **`code`** is temporary and single-use - expires quickly
3. **`access_token`** should be handled securely
4. Always use HTTPS in production

## 🧪 Testing in Postman

1. Run "Get Google OAuth URL" request
2. Copy `authUrl` and open in browser
3. Complete Google authorization
4. Copy `code` from callback URL
5. Use that `code` in "Login with Google Token" request

**Remember: The `code` changes every time you authorize - it's not a static value!**
