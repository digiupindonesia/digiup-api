import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import logger from '../../../utils/logger/winston/logger';

const prisma = new PrismaClient();

// Sync user data from DigiUp to CreatorUp
const syncUserToCreatorUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = req.user as any;
        if (!user) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        const { creatorup_user_id } = req.body;

        if (!creatorup_user_id) {
            res.status(400).json({
                status: 'error',
                message: 'CreatorUp user ID is required',
            });
            return;
        }

        // Update user with CreatorUp sync info
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                creatorup_user_id,
                creatorup_synced_at: new Date(),
                sync_status: 'synced',
                creatorup_metadata: {
                    synced_at: new Date(),
                    source: 'digiup',
                },
            },
        });

        // Send webhook to CreatorUp
        try {
            await axios.post(
                `${process.env.CREATORUP_API_URL}/webhooks/digiup/user-sync`,
                {
                    digiup_user_id: user.id,
                    creatorup_user_id,
                    user_data: {
                        email: user.email,
                        name: user.name,
                        account_type: user.accountType,
                    },
                    timestamp: new Date(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CREATORUP_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
        } catch (webhookError: any) {
            logger.error(`Webhook error: ${webhookError.message}`);
        }

        res.status(200).json({
            status: 'success',
            message: 'User synced successfully',
            data: {
                user_id: updatedUser.id,
                creatorup_user_id: updatedUser.creatorup_user_id,
                synced_at: updatedUser.creatorup_synced_at,
            },
        });
    } catch (err: any) {
        logger.error(`User sync error. ${err.message}`);
        next(err);
    }
};

// Sync usage data from CreatorUp to DigiUp
const syncUsageToDigiUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = req.user as any;
        if (!user) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        const { usage_data } = req.body;

        // Validate usage data
        if (!usage_data || !usage_data.batch_name || !usage_data.usage_type) {
            res.status(400).json({
                status: 'error',
                message: 'Invalid usage data provided',
            });
            return;
        }

        // Create usage record
        const usageRecord = await prisma.creatorUpUsage.create({
            data: {
                userId: user.id,
                creatorupUserId: user.creatorup_user_id || user.id,
                batchName: usage_data.batch_name,
                batchType: usage_data.batch_type || 'video',
                usageType: usage_data.usage_type,
                usageAmount: usage_data.usage_amount || 1,
                monthYear: usage_data.month_year || new Date().toISOString().slice(0, 7),
                completedAt: new Date(usage_data.completed_at || new Date()),
                metadata: usage_data.metadata || {},
            },
        });

        // Log sync event
        await prisma.syncEvent.create({
            data: {
                eventType: 'usage_sync',
                userId: user.id,
                status: 'completed',
                payload: usage_data,
                response: { usage_record_id: usageRecord.id },
            },
        });

        res.status(200).json({
            status: 'success',
            message: 'Usage synced successfully',
            data: {
                usage_record_id: usageRecord.id,
                synced_at: usageRecord.syncedAt,
            },
        });
    } catch (err: any) {
        logger.error(`Usage sync error. ${err.message}`);
        next(err);
    }
};

// Get sync status for user
const getSyncStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as any;
        if (!user) {
            res.status(401).json({ status: 'error', message: 'User not authenticated' });
            return;
        }

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                creatorup_user_id: true,
                creatorup_synced_at: true,
                sync_status: true,
                last_creatorup_access: true,
                creatorup_metadata: true,
            },
        });

        if (!userData) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }

        // Get recent sync events
        const recentEvents = await prisma.syncEvent.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: userData,
                recent_events: recentEvents,
            },
        });
    } catch (err: any) {
        logger.error(`Get sync status error. ${err.message}`);
        next(err);
    }
};

// Webhook endpoint for CreatorUp to send data to DigiUp
const handleCreatorUpWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { event_type, user_id, data } = req.body;

        // Log webhook
        await prisma.webhookLog.create({
            data: {
                source: 'creatorup',
                eventType: event_type,
                payload: req.body,

                status: 'received',
            },
        });

        // Process different event types
        switch (event_type) {
            case 'usage_update':
                if (data && data.batch_name && data.usage_type) {
                    await prisma.creatorUpUsage.create({
                        data: {
                            userId: user_id,
                            creatorupUserId: data.creatorup_user_id || user_id,
                            batchName: data.batch_name,
                            batchType: data.batch_type || 'video',
                            usageType: data.usage_type,
                            usageAmount: data.usage_amount || 1,
                            monthYear: data.month_year || new Date().toISOString().slice(0, 7),
                            completedAt: new Date(data.completed_at || new Date()),
                            metadata: data.metadata || {},
                        },
                    });
                }
                break;

            case 'subscription_update':
                // Handle subscription updates
                if (data && user_id) {
                    await prisma.user.update({
                        where: { id: user_id },
                        data: {
                            creatorup_metadata: {
                                ...data,
                                updated_at: new Date(),
                            },
                        },
                    });
                }
                break;
        }

        // Update webhook log
        await prisma.webhookLog.updateMany({
            where: {
                source: 'creatorup',
                eventType: event_type,
                status: 'received',
            },
            data: {
                status: 'completed',
                processedAt: new Date(),
            },
        });

        res.status(200).json({
            status: 'success',
            message: 'Webhook processed successfully',
        });
    } catch (err: any) {
        logger.error(`Webhook error. ${err.message}`);

        // Log failed webhook
        await prisma.webhookLog.create({
            data: {
                source: 'creatorup',
                eventType: req.body.event_type || 'unknown',
                payload: req.body,

                status: 'failed',
                errorMessage: err.message,
            },
        });

        next(err);
    }
};

export { syncUserToCreatorUp, syncUsageToDigiUp, getSyncStatus, handleCreatorUpWebhook };
