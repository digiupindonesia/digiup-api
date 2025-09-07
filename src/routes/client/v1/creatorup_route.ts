import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlUserAuth from '@controllers/client/users_auth_controller';
import * as ctrlSync from '@controllers/client/sync/creatorup_sync_controller';
import ctrlCreatorUpAuth from '@controllers/client/creatorup_auth_controller';
import { creatorupRegister, creatorupSaveCredentials } from '@schemas/auth_schema';
import { validate } from '@middlewares/validate_schema/validate_schema';

const router = Router();

// Existing CreatorUp Integration Routes
router.post('/verify', auth('jwt-user'), ctrlUserAuth.verifyToken);
router.get('/profile', auth('jwt-user'), ctrlUserAuth.getProfile);
router.get('/access', auth('jwt-user'), ctrlUserAuth.checkAccess);

// New Real-time Sync Endpoints
router.post('/sync/user', auth('jwt-user'), ctrlSync.syncUserToCreatorUp);
router.post('/sync/usage', auth('jwt-user'), ctrlSync.syncUsageToDigiUp);
router.get('/sync/status', auth('jwt-user'), ctrlSync.getSyncStatus);

// Webhook endpoints for CreatorUp to notify DigiUp
router.post('/webhook/usage-update', ctrlSync.handleCreatorUpWebhook);
router.post('/webhook/subscription-update', ctrlSync.handleCreatorUpWebhook);

// CreatorUp Authentication Routes

// Register to CreatorUp
router.post(
    '/auth/register',
    auth('jwt-user'),
    validate(creatorupRegister),
    ctrlCreatorUpAuth.register,
);

// Login to CreatorUp
router.post('/auth/login', auth('jwt-user'), ctrlCreatorUpAuth.login);

// Save CreatorUp credentials
router.post(
    '/auth/credentials',
    auth('jwt-user'),
    validate(creatorupSaveCredentials),
    ctrlCreatorUpAuth.saveCredentials,
);

// Get CreatorUp credentials
router.get('/auth/credentials', auth('jwt-user'), ctrlCreatorUpAuth.getCredentials);

// Check registration status
router.get('/auth/status', auth('jwt-user'), ctrlCreatorUpAuth.checkRegistrationStatus);

export default router;
