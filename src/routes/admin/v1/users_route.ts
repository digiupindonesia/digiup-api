import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import adminAuth from '@middlewares/auth/admin_auth';
import ctrlUsers from '@controllers/admin/users_controller';

const router = Router();

// All routes require admin authentication and admin role
router.use(auth('jwt-user'));
router.use(adminAuth);

// List of All Users
router.get('/', ctrlUsers.showAll);

export default router;
