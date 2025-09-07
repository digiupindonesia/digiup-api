import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import logger from '@utils/logger/winston/logger';
import { PrismaClient } from '@prisma/client';
import creatorUpIntegrationService from '@services/client/creatorup_integration/creatorup_integration_service';

const prisma = new PrismaClient();

class EventQueueService {
    private redis: Redis;
    private syncQueue: Queue;
    private worker!: Worker;
    private isInitialized: boolean = false;

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
            lazyConnect: true,
        });

        this.syncQueue = new Queue('digiup-creatorup-sync', {
            connection: this.redis,
            defaultJobOptions: {
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 50 },
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
        });

        this.setupWorker();
        this.isInitialized = true;

        logger.info('EventQueueService initialized successfully');
    }

    // Add user sync event to queue
    async addUserSyncEvent(userData: any): Promise<void> {
        try {
            if (!this.isInitialized) {
                throw new Error('EventQueueService not initialized');
            }

            const job = await this.syncQueue.add('sync-user', userData, {
                delay: 1000, // 1 second delay
                priority: 10, // High priority
                jobId: `user-sync-${userData.digiup_user_id}-${Date.now()}`,
            });

            logger.info(`User sync event added to queue: ${job.id}`);
        } catch (error: any) {
            logger.error('Failed to add user sync event to queue:', error.message);
            throw error;
        }
    }

    // Add usage sync event to queue
    async addUsageSyncEvent(usageData: any): Promise<void> {
        try {
            if (!this.isInitialized) {
                throw new Error('EventQueueService not initialized');
            }

            const job = await this.syncQueue.add('sync-usage', usageData, {
                delay: 500, // 500ms delay
                priority: 5, // Medium priority
                jobId: `usage-sync-${usageData.digiup_user_id}-${Date.now()}`,
            });

            logger.info(`Usage sync event added to queue: ${job.id}`);
        } catch (error: any) {
            logger.error('Failed to add usage sync event to queue:', error.message);
            throw error;
        }
    }

    // Add subscription sync event to queue
    async addSubscriptionSyncEvent(subscriptionData: any): Promise<void> {
        try {
            if (!this.isInitialized) {
                throw new Error('EventQueueService not initialized');
            }

            const job = await this.syncQueue.add('sync-subscription', subscriptionData, {
                delay: 1000, // 1 second delay
                priority: 8, // High priority
                jobId: `subscription-sync-${subscriptionData.digiup_user_id}-${Date.now()}`,
            });

            logger.info(`Subscription sync event added to queue: ${job.id}`);
        } catch (error: any) {
            logger.error('Failed to add subscription sync event to queue:', error.message);
            throw error;
        }
    }

    // Setup queue workers
    private setupWorker(): void {
        this.worker = new Worker(
            'digiup-creatorup-sync',
            async (job: Job) => {
                const { name, data } = job;

                logger.info(`Processing job: ${name} with ID: ${job.id}`);

                try {
                    switch (name) {
                        case 'sync-user':
                            await this.processUserSync(data, job);
                            break;
                        case 'sync-usage':
                            await this.processUsageSync(data, job);
                            break;
                        case 'sync-subscription':
                            await this.processSubscriptionSync(data, job);
                            break;
                        default:
                            logger.warn(`Unknown job type: ${name}`);
                            throw new Error(`Unknown job type: ${name}`);
                    }

                    logger.info(`Job ${job.id} completed successfully`);
                } catch (error: any) {
                    logger.error(`Job ${job.id} failed:`, error.message);
                    throw error;
                }
            },
            {
                connection: this.redis,
                concurrency: 5,
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 50 },
            },
        );

        // Worker event handlers
        this.worker.on('completed', (job: Job) => {
            logger.info(`Job ${job.id} completed successfully`);
        });

        this.worker.on('failed', (job: Job | undefined, err: Error) => {
            logger.error(`Job ${job?.id} failed:`, err.message);
        });

        this.worker.on('error', (err: Error) => {
            logger.error('Worker error:', err.message);
        });

        this.worker.on('ready', () => {
            logger.info('Queue worker is ready');
        });
    }

    // Process user sync
    private async processUserSync(userData: any, job: Job): Promise<void> {
        try {
            // Find or create sync event
            let syncEvent = await prisma.syncEvent.findFirst({
                where: {
                    eventType: 'user_sync',
                    userId: userData.digiup_user_id,
                    status: { in: ['pending', 'processing'] },
                },
            });

            if (!syncEvent) {
                syncEvent = await prisma.syncEvent.create({
                    data: {
                        eventType: 'user_sync',
                        userId: userData.digiup_user_id,
                        status: 'processing',
                        payload: userData,
                    },
                });
            }

            // Update sync event status
            await prisma.syncEvent.update({
                where: { id: syncEvent.id },
                data: { status: 'processing' },
            });

            // Sync user to CreatorUp
            const result = await creatorUpIntegrationService.syncUserToCreatorUp(
                userData,
                userData.digiup_token,
            );

            // Update user sync status
            await prisma.user.update({
                where: { id: userData.digiup_user_id },
                data: {
                    creatorup_synced_at: new Date(),
                    sync_status: 'synced',
                    creatorup_metadata: {
                        last_sync_response: result,
                        sync_timestamp: new Date().toISOString(),
                        job_id: job.id,
                    },
                },
            });

            // Update sync event
            await prisma.syncEvent.update({
                where: { id: syncEvent.id },
                data: {
                    status: 'completed',
                    response: result,
                    processedAt: new Date(),
                },
            });

            logger.info(`User sync completed for: ${userData.digiup_user_id}`);
        } catch (error: any) {
            // Update sync event with error
            await prisma.syncEvent.updateMany({
                where: {
                    eventType: 'user_sync',
                    userId: userData.digiup_user_id,
                    status: 'processing',
                },
                data: {
                    status: 'failed',
                    errorMessage: error.message,
                    response: error.response?.data,
                },
            });

            throw error;
        }
    }

    // Process usage sync
    private async processUsageSync(usageData: any, job: Job): Promise<void> {
        try {
            // Create usage record
            const usageRecord = await prisma.creatorUpUsage.create({
                data: {
                    userId: usageData.digiup_user_id,
                    creatorupUserId: usageData.creatorup_user_id || usageData.digiup_user_id,
                    batchName: usageData.batch_name,
                    batchType: usageData.batch_type || 'video',
                    usageType: usageData.usage_type,
                    usageAmount: usageData.usage_amount || 1,
                    monthYear: usageData.month_year || new Date().toISOString().substring(0, 7),
                    completedAt: new Date(usageData.completed_at || new Date()),
                    metadata: {
                        ...usageData.metadata,
                        job_id: job.id,
                        processed_at: new Date().toISOString(),
                    },
                },
            });

            // Also create batch usage record for consistency
            await prisma.batchUsage.create({
                data: {
                    userId: usageData.digiup_user_id,
                    appId: usageData.app_id || 'creatorup-app-id',
                    batchName: usageData.batch_name,
                    batchType: usageData.batch_type || 'video',
                    usageType: usageData.usage_type,
                    usageAmount: usageData.usage_amount || 1,
                    monthYear: usageData.month_year || new Date().toISOString().substring(0, 7),
                    completedAt: new Date(usageData.completed_at || new Date()),
                    metadata: {
                        ...usageData.metadata,
                        job_id: job.id,
                        processed_at: new Date().toISOString(),
                    },
                },
            });

            logger.info(`Usage sync completed for: ${usageData.digiup_user_id}`);
        } catch (error: any) {
            logger.error(`Usage sync failed for: ${usageData.digiup_user_id}`, error.message);
            throw error;
        }
    }

    // Process subscription sync
    private async processSubscriptionSync(subscriptionData: any, job: Job): Promise<void> {
        try {
            // Update user subscription data
            await prisma.user.update({
                where: { id: subscriptionData.digiup_user_id },
                data: {
                    creatorup_metadata: {
                        subscription_data: subscriptionData,
                        last_subscription_update: new Date().toISOString(),
                        job_id: job.id,
                    },
                },
            });

            logger.info(`Subscription sync completed for: ${subscriptionData.digiup_user_id}`);
        } catch (error: any) {
            logger.error(
                `Subscription sync failed for: ${subscriptionData.digiup_user_id}`,
                error.message,
            );
            throw error;
        }
    }

    // Get queue statistics
    async getQueueStatistics(): Promise<any> {
        try {
            const waiting = await this.syncQueue.getWaiting();
            const active = await this.syncQueue.getActive();
            const completed = await this.syncQueue.getCompleted();
            const failed = await this.syncQueue.getFailed();

            return {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                total: waiting.length + active.length + completed.length + failed.length,
            };
        } catch (error: any) {
            logger.error('Failed to get queue statistics:', error.message);
            throw error;
        }
    }

    // Clean up old jobs
    async cleanupOldJobs(): Promise<void> {
        try {
            await this.syncQueue.clean(24 * 60 * 60 * 1000, 100, 'completed'); // 24 hours
            await this.syncQueue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed'); // 7 days
            logger.info('Old jobs cleaned up successfully');
        } catch (error: any) {
            logger.error('Failed to cleanup old jobs:', error.message);
        }
    }

    // Graceful shutdown
    async shutdown(): Promise<void> {
        try {
            await this.worker.close();
            await this.syncQueue.close();
            await this.redis.quit();
            logger.info('EventQueueService shutdown completed');
        } catch (error: any) {
            logger.error('Error during EventQueueService shutdown:', error.message);
        }
    }
}

export default EventQueueService;
