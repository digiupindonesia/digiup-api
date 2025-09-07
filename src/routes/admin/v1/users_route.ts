import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import ctrlUsers from '@controllers/admin/users_controller';

const router = Router();

// All routes require admin authentication
router.use(auth('jwt-user'));

// List of All Users
router.get('/', ctrlUsers.showAll);

export default router;
