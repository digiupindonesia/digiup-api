import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import appsController from '@controllers/admin/apps_controller';

const router = Router();

// All routes require admin authentication
router.use(auth('jwt-user'));

// Create new app
router.post('/', appsController.createApp);

// Get all apps
router.get('/', appsController.getAllApps);

// Update app
router.put('/:id', appsController.updateApp);

// Delete app
router.delete('/:id', appsController.deleteApp);

export default router;
