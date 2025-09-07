import { Router } from 'express';
import {
    getAppPricingPlansController,
    subscribeToAppController,
    getMySubscriptionsController,
} from '@controllers/client/apps_pricing_controller';
import auth from '@middlewares/auth/authenticate';

const router = Router();

// Get pricing plans for a specific app (public)
router.get('/apps/:appId/pricing', getAppPricingPlansController);

// Subscribe to an app with a specific plan (protected)
router.post('/apps/:appId/subscribe/:planId', auth('jwt-user'), subscribeToAppController);

// Get my subscriptions (protected)
router.get('/subscriptions', auth('jwt-user'), getMySubscriptionsController);

export default router;
