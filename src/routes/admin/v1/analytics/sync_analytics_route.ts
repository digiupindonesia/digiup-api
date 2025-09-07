import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlSyncAnalytics from '@controllers/admin/analytics/sync_analytics_controller';

const router = Router();

// All routes require admin authentication
router.use(auth('jwt-user'));

// Sync Analytics Routes
router.get('/sync', ctrlSyncAnalytics.getSyncAnalytics);
router.get('/sync/user/:userId', ctrlSyncAnalytics.getUserSyncAnalytics);
router.get('/health', ctrlSyncAnalytics.getSystemHealth);

// Maintenance Routes
router.post('/retry-failed-sync', ctrlSyncAnalytics.retryFailedSyncEvents);
router.post('/cleanup-old-data', ctrlSyncAnalytics.cleanupOldData);

export default router;
