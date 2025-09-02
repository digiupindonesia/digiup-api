# Google OAuth Integration

This API supports Google OAuth 2.0 for user authentication, allowing users to sign in and sign up using their Google accounts.

## Setup

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - For development: `http://localhost:3345/api/client/v1/auth/google/callback`
   - For production: `https://yourdomain.com/api/client/v1/auth/google/callback`

### 2. Environment Variables

Add the following variables to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3345/api/client/v1/auth/google/callback
```

## API Endpoints

### 1. Get Google OAuth URL

**GET** `/api/client/v1/auth/google`

Generates a Google OAuth consent URL that users can visit to authorize your application.

**Response:**
```json
{
  "success": true,
  "message": "Google OAuth URL generated successfully",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### 2. Google OAuth Callback

**GET** `/api/client/v1/auth/google/callback?code=authorization_code`

Handles the callback from Google OAuth and exchanges the authorization code for user information.

**Query Parameters:**
- `code` (string, required): Authorization code received from Google

**Response:**
```json
{
  "success": true,
  "message": "Signed in successfully with Google",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "google_signin": true,
      "isRegistered": true
    },
    "token": "jwt_token_here",
    "isNewUser": false
  }
}
```

### 3. Google OAuth with Access Token

**POST** `/api/client/v1/auth/google/token`

Authenticates a user directly using a Google access token (useful for mobile applications).

**Request Body:**
```json
{
  "accessToken": "google_access_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully with Google",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "google_signin": true,
      "isRegistered": true
    },
    "token": "jwt_token_here",
    "isNewUser": true
  }
}
```

## Integration Flow

### Web Application Flow

1. **Frontend**: Call `GET /api/client/v1/auth/google` to get the OAuth URL
2. **Frontend**: Redirect user to the OAuth URL
3. **User**: Authorizes the application on Google
4. **Google**: Redirects back to `/api/client/v1/auth/google/callback?code=...`
5. **Backend**: Processes the callback and returns user data with JWT token
6. **Frontend**: Use the JWT token for authenticated requests

### Mobile Application Flow

1. **Mobile App**: Use Google Sign-In SDK to get an access token
2. **Mobile App**: Send access token to `POST /api/client/v1/auth/google/token`
3. **Backend**: Validates token with Google and returns user data with JWT token
4. **Mobile App**: Use the JWT token for authenticated requests

## Features

- **Automatic Account Creation**: If a user doesn't exist, a new account is created automatically
- **Account Linking**: If a user with the same email exists, their account is updated with Google OAuth information
- **Email Verification**: Google OAuth users are automatically marked as email verified
- **Profile Information**: Stores Google profile information (name, avatar, locale)
- **JWT Integration**: Returns the same JWT token format used by regular authentication

## Database Schema

The following fields are added to the User model for Google OAuth support:

```prisma
model User {
  // ... other fields
  google_signin        Boolean?  @default(false)
  google_given_name    String?   @db.VarChar(255)
  google_family_name   String?   @db.VarChar(255)
  google_locale        String?   @db.VarChar(255)
  google_avatar        String?   @db.VarChar(255)
}
```

## Security Considerations

- Google OAuth users don't have a password field
- JWT tokens have the same expiration time as regular authentication
- Google access tokens are not stored in the database
- All Google OAuth requests are validated against Google's servers
- HTTPS should be used in production for redirect URIs

## Testing

Use the Postman collection to test the Google OAuth endpoints:

1. **Google OAuth URL**: Test URL generation
2. **Google OAuth Callback**: Test with a valid authorization code from Google
3. **Google OAuth Token**: Test with a valid Google access token

## Error Handling

Common errors and their responses:

- **Invalid authorization code**: `400 Bad Request`
- **Missing access token**: `400 Bad Request` with validation error
- **Google API errors**: `400 Bad Request` with descriptive message
- **Database errors**: `500 Internal Server Error`
