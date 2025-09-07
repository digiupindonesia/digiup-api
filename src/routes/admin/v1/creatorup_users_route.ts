import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import adminAuth from '@middlewares/auth/admin_auth';
import ctrlCreatorUpUsers from '@controllers/admin/creatorup_users_controller';

const router = Router();

// All routes require admin authentication and admin role
router.use(auth('jwt-user'));
router.use(adminAuth);

// Get all users with CreatorUp credentials
router.get('/', ctrlCreatorUpUsers.getAllCreatorUpUsers);

// Get CreatorUp summary statistics
router.get('/summary', ctrlCreatorUpUsers.getCreatorUpSummary);

// Get specific user CreatorUp credentials by DigiUp user ID
router.get('/:userId', ctrlCreatorUpUsers.getCreatorUpUserById);

export default router;
