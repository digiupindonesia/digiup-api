import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '@utils/logger/winston/logger';
import EventQueueService from '@services/queue/event_queue_service';
import creatorUpIntegrationService from '@services/client/creatorup_integration/creatorup_integration_service';

const prisma = new PrismaClient();

// Get comprehensive sync analytics
const getSyncAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { period = '30d', startDate, endDate } = req.query;

        // Calculate date range
        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                },
            };
        } else {
            const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            dateFilter = {
                createdAt: {
                    gte: startDate,
                },
            };
        }

        // Get user sync statistics
        const totalUsers = await prisma.user.count();
        const syncedUsers = await prisma.user.count({
            where: { sync_status: 'synced' },
        });
        const pendingUsers = await prisma.user.count({
            where: { sync_status: 'pending' },
        });
        const errorUsers = await prisma.user.count({
            where: { sync_status: 'error' },
        });

        // Get sync events statistics
        const totalSyncEvents = await prisma.syncEvent.count({ where: dateFilter });
        const completedSyncEvents = await prisma.syncEvent.count({
            where: { ...dateFilter, status: 'completed' },
        });
        const failedSyncEvents = await prisma.syncEvent.count({
            where: { ...dateFilter, status: 'failed' },
        });
        const pendingSyncEvents = await prisma.syncEvent.count({
            where: { ...dateFilter, status: 'pending' },
        });

        // Get webhook statistics
        const totalWebhooks = await prisma.webhookLog.count({ where: dateFilter });
        const processedWebhooks = await prisma.webhookLog.count({
            where: { ...dateFilter, status: 'processed' },
        });
        const failedWebhooks = await prisma.webhookLog.count({
            where: { ...dateFilter, status: 'failed' },
        });

        // Get usage statistics
        const totalUsage = await prisma.creatorUpUsage.count({ where: dateFilter });
        const monthlyUsage = await prisma.creatorUpUsage.groupBy({
            by: ['monthYear'],
            where: dateFilter,
            _count: { id: true },
            _sum: { usageAmount: true },
            orderBy: { monthYear: 'desc' },
            take: 12,
        });

        // Get usage by type
        const usageByType = await prisma.creatorUpUsage.groupBy({
            by: ['usageType'],
            where: dateFilter,
            _count: { id: true },
            _sum: { usageAmount: true },
        });

        // Get queue statistics
        const queueStats = await new EventQueueService().getQueueStatistics();

        // Get integration service statistics
        const integrationStats = await creatorUpIntegrationService.getSyncStatistics();

        // Get recent sync events
        const recentSyncEvents = await prisma.syncEvent.findMany({
            where: dateFilter,
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                eventType: true,
                status: true,
                userId: true,
                createdAt: true,
                processedAt: true,
                errorMessage: true,
            },
        });

        // Get recent webhook logs
        const recentWebhooks = await prisma.webhookLog.findMany({
            where: dateFilter,
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                source: true,
                eventType: true,
                status: true,
                createdAt: true,
                processedAt: true,
                errorMessage: true,
            },
        });

        const responseData = {
            period: {
                start: dateFilter.createdAt?.gte || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: dateFilter.createdAt?.lte || new Date(),
            },
            user_sync: {
                total_users: totalUsers,
                synced_users: syncedUsers,
                pending_users: pendingUsers,
                error_users: errorUsers,
                sync_percentage: totalUsers > 0 ? Math.round((syncedUsers / totalUsers) * 100) : 0,
            },
            sync_events: {
                total: totalSyncEvents,
                completed: completedSyncEvents,
                failed: failedSyncEvents,
                pending: pendingSyncEvents,
                success_rate:
                    totalSyncEvents > 0
                        ? Math.round((completedSyncEvents / totalSyncEvents) * 100)
                        : 0,
            },
            webhooks: {
                total: totalWebhooks,
                processed: processedWebhooks,
                failed: failedWebhooks,
                success_rate:
                    totalWebhooks > 0 ? Math.round((processedWebhooks / totalWebhooks) * 100) : 0,
            },
            usage: {
                total_records: totalUsage,
                monthly_breakdown: monthlyUsage,
                usage_by_type: usageByType,
            },
            queue: queueStats,
            integration: integrationStats,
            recent_activity: {
                sync_events: recentSyncEvents,
                webhooks: recentWebhooks,
            },
        };

        res.status(200).json({
            status: 'success',
            message: 'Sync analytics retrieved successfully',
            data: responseData,
        });
    } catch (err: any) {
        logger.error(`Sync analytics error. ${err.message}`);
        next(err);
    }
};

// Get user-specific sync analytics
const getUserSyncAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { userId } = req.params;

        // Get user sync status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                sync_status: true,
                creatorup_synced_at: true,
                last_creatorup_access: true,
                creatorup_user_id: true,
                creatorup_metadata: true,
            },
        });

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        // Get user's sync events
        const syncEvents = await prisma.syncEvent.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // Get user's usage statistics
        const usageStats = await prisma.creatorUpUsage.aggregate({
            where: { userId: userId },
            _count: { id: true },
            _sum: { usageAmount: true },
        });

        const monthlyUsage = await prisma.creatorUpUsage.groupBy({
            by: ['monthYear'],
            where: { userId: userId },
            _count: { id: true },
            _sum: { usageAmount: true },
            orderBy: { monthYear: 'desc' },
            take: 12,
        });

        const usageByType = await prisma.creatorUpUsage.groupBy({
            by: ['usageType'],
            where: { userId: userId },
            _count: { id: true },
            _sum: { usageAmount: true },
        });

        // Get user's webhook logs
        const webhookLogs = await prisma.webhookLog.findMany({
            where: {
                payload: {
                    path: ['digiup_user_id'],
                    equals: userId,
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        const responseData = {
            user: user,
            sync_events: syncEvents,
            usage_statistics: {
                total_usage: usageStats._count.id,
                total_amount: usageStats._sum.usageAmount,
                monthly_breakdown: monthlyUsage,
                usage_by_type: usageByType,
            },
            webhook_logs: webhookLogs,
        };

        res.status(200).json({
            status: 'success',
            message: 'User sync analytics retrieved successfully',
            data: responseData,
        });
    } catch (err: any) {
        logger.error(`User sync analytics error. ${err.message}`);
        next(err);
    }
};

// Get system health status
const getSystemHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check database connection
        const dbHealth = await prisma.$queryRaw`SELECT 1 as health`;

        // Check Redis connection
        const redisHealth = await new EventQueueService().getQueueStatistics();

        // Check CreatorUp API health
        const creatorUpHealth = await creatorUpIntegrationService.healthCheck();

        // Get recent error rates
        const recentErrors = await prisma.syncEvent.count({
            where: {
                status: 'failed',
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
            },
        });

        const recentWebhookErrors = await prisma.webhookLog.count({
            where: {
                status: 'failed',
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
            },
        });

        const responseData = {
            database: {
                status: dbHealth ? 'healthy' : 'unhealthy',
                connection: 'active',
            },
            redis: {
                status: redisHealth ? 'healthy' : 'unhealthy',
                queue_stats: redisHealth,
            },
            creatorup_api: {
                status: creatorUpHealth ? 'healthy' : 'unhealthy',
                reachable: creatorUpHealth,
            },
            error_rates: {
                sync_errors_24h: recentErrors,
                webhook_errors_24h: recentWebhookErrors,
            },
            overall_status: dbHealth && redisHealth && creatorUpHealth ? 'healthy' : 'degraded',
        };

        res.status(200).json({
            status: 'success',
            message: 'System health retrieved successfully',
            data: responseData,
        });
    } catch (err: any) {
        logger.error(`System health error. ${err.message}`);
        next(err);
    }
};

// Retry failed sync events
const retryFailedSyncEvents = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await creatorUpIntegrationService.retryFailedSyncEvents();

        res.status(200).json({
            status: 'success',
            message: 'Failed sync events retry initiated',
            data: result,
        });
    } catch (err: any) {
        logger.error(`Retry failed sync events error. ${err.message}`);
        next(err);
    }
};

// Clean up old data
const cleanupOldData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Clean up old sync events (older than 30 days)
        const deletedSyncEvents = await prisma.syncEvent.deleteMany({
            where: {
                createdAt: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                status: { in: ['completed', 'failed'] },
            },
        });

        // Clean up old webhook logs (older than 7 days)
        const deletedWebhooks = await prisma.webhookLog.deleteMany({
            where: {
                createdAt: {
                    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                status: { in: ['processed', 'failed'] },
            },
        });

        // Clean up queue old jobs
        await new EventQueueService().cleanupOldJobs();

        const responseData = {
            deleted_sync_events: deletedSyncEvents.count,
            deleted_webhooks: deletedWebhooks.count,
            cleanup_timestamp: new Date().toISOString(),
        };

        res.status(200).json({
            status: 'success',
            message: 'Old data cleanup completed',
            data: responseData,
        });
    } catch (err: any) {
        logger.error(`Cleanup old data error. ${err.message}`);
        next(err);
    }
};

export default {
    getSyncAnalytics,
    getUserSyncAnalytics,
    getSystemHealth,
    retryFailedSyncEvents,
    cleanupOldData,
};
