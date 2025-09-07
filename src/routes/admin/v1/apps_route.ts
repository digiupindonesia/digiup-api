import { Router } from 'express';
import appsController from '@controllers/admin/apps_controller';

const router = Router();

// Create new app
router.post('/', appsController.createApp);

// Get all apps
router.get('/', appsController.getAllApps);

// Update app
router.put('/:id', appsController.updateApp);

// Delete app
router.delete('/:id', appsController.deleteApp);

export default router;
