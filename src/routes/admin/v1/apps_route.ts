import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import adminAuth from '@middlewares/auth/admin_auth';
import appsController from '@controllers/admin/apps_controller';

const router = Router();

// All routes require admin authentication and admin role
router.use(auth('jwt-user'));
router.use(adminAuth);

// Create new app
router.post('/', appsController.createApp);

// Get all apps
router.get('/', appsController.getAllApps);

// Update app
router.put('/:id', appsController.updateApp);

// Delete app
router.delete('/:id', appsController.deleteApp);

export default router;
