import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlBatch from '@controllers/client/batch_controller';

const router = Router();

// Batch Usage Tracking Routes
router.post('/create', auth('jwt-user'), ctrlBatch.createBatch);
router.get('/usage/monthly', auth('jwt-user'), ctrlBatch.getMonthlyUsage);

export default router;
