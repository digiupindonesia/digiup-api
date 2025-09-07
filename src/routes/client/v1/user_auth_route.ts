import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlUserAuth from '@controllers/client/users_auth_controller';

import {
    register,
    login,
    forgotPasswordRequest,
    registerConfirmation,
    googleAuthToken,
} from '@schemas/auth_schema';
import { validate } from '@middlewares/validate_schema/validate_schema';

const router = Router();

// User Register (Manual)
router.post('/register', validate(register), ctrlUserAuth.register);
router.get('/register/confirmation', validate(registerConfirmation), ctrlUserAuth.registerConfirm);

// User Login/Logout (Manual)
router.post('/login', validate(login), ctrlUserAuth.login);
router.get('/logout', auth('jwt-user'), ctrlUserAuth.logout);

// User Forgot Password (Manual)
router.post(
    '/forgotpassword/request',
    validate(forgotPasswordRequest),
    ctrlUserAuth.forgotPasswordRequest,
);
router.post('/forgotpassword/reset', ctrlUserAuth.forgotPasswordReset);

// Google OAuth Authentication (New Routes)
router.get('/google', ctrlUserAuth.googleAuthUrl);
router.get('/google/callback', ctrlUserAuth.googleAuthCallback);
router.post('/google/token', validate(googleAuthToken), ctrlUserAuth.googleAuthToken);

export default router;
