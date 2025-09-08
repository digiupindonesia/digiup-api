import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import ctrlUserSubscription from '@controllers/client/user_subscription_controller';

const router = Router();

// Get user subscription details (active until dates)
router.get('/', auth('jwt-user'), ctrlUserSubscription.getSubscription);

export default router;
