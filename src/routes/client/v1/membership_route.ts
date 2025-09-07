import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlMembership from '@controllers/client/membership_controller';

const router = Router();

// Membership Routes
router.get('/plans', ctrlMembership.getPlans);
router.post('/subscribe/:planId', auth('jwt-user'), ctrlMembership.subscribeToPlan);
router.get('/feature/:feature/access', auth('jwt-user'), ctrlMembership.checkFeatureAccess);

export default router;
