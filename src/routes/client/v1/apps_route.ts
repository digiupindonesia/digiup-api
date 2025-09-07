import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import appsController from '@controllers/client/apps_controller';

const router = Router();

// Public endpoints (no authentication required)
// Get all apps (public access)
router.get('/', appsController.getAllApps);

// Get app detail (public access)
router.get('/:id', appsController.getAppDetail);

// Authenticated endpoints (require user authentication)
// Get user's apps (including CreatorUp if registered)
router.get('/user/all', auth('jwt-user'), appsController.getUserApps);

// Get user's app detail (including CreatorUp status)
router.get('/user/:id', auth('jwt-user'), appsController.getUserAppDetail);

export default router;
