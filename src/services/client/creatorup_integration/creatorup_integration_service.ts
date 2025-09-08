import axios, { AxiosResponse } from 'axios';
import logger from '@utils/logger/winston/logger';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

class CreatorUpIntegrationService {
    private creatorUpApiUrl: string;
    private digiUpApiUrl: string;
    private webhookSecret: string;

    constructor() {
        this.creatorUpApiUrl = process.env.CREATORUP_API_URL || 'https://api.creatorup.com';
        this.digiUpApiUrl = process.env.DIGIUP_API_URL || 'https://api.digiup.com';
        this.webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
    }

    // Sync user data to CreatorUp
    async syncUserToCreatorUp(userData: any, digiupToken: string): Promise<any> {
        try {
            logger.info(`Syncing user to CreatorUp: ${userData.digiup_user_id}`);

            const response: AxiosResponse = await axios.post(
                `${this.creatorUpApiUrl}/api/v1/digiup/sync-user`,
                userData,
                {
                    headers: {
                        Authorization: `Bearer ${digiupToken}`,
                        'Content-Type': 'application/json',
                        'X-DigiUp-Source': 'digiup-api',
                        'X-Request-ID': crypto.randomUUID(),
                    },
                    timeout: 10000,
                },
            );

            logger.info(`User sync successful: ${userData.digiup_user_id}`);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to sync user to CreatorUp:', {
                userId: userData.digiup_user_id,
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }

    // Send usage update to DigiUp
    async sendUsageUpdateToDigiUp(usageData: any): Promise<any> {
        try {
            logger.info(`Sending usage update to DigiUp: ${usageData.digiup_user_id}`);

            const response: AxiosResponse = await axios.post(
                `${this.digiUpApiUrl}/api/v1/creatorup/webhook/usage-update`,
                usageData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Signature': this.generateWebhookSignature(usageData),
                        'X-CreatorUp-Source': 'creatorup-api',
                        'X-Request-ID': crypto.randomUUID(),
                    },
                    timeout: 10000,
                },
            );

            logger.info(`Usage update sent successfully: ${usageData.digiup_user_id}`);
            return response.data;
        } catch (error: any) {
            logger.error('Failed to send usage update to DigiUp:', {
                userId: usageData.digiup_user_id,
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }

    // Send subscription update to DigiUp
    async sendSubscriptionUpdateToDigiUp(subscriptionData: any): Promise<any> {
        try {
            logger.info(
                `Sending subscription update to DigiUp: ${subscriptionData.digiup_user_id}`,
            );

            const response: AxiosResponse = await axios.post(
                `${this.digiUpApiUrl}/api/v1/creatorup/webhook/subscription-update`,
                subscriptionData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Signature': this.generateWebhookSignature(subscriptionData),
                        'X-CreatorUp-Source': 'creatorup-api',
                        'X-Request-ID': crypto.randomUUID(),
                    },
                    timeout: 10000,
                },
            );

            logger.info(
                `Subscription update sent successfully: ${subscriptionData.digiup_user_id}`,
            );
            return response.data;
        } catch (error: any) {
            logger.error('Failed to send subscription update to DigiUp:', {
                userId: subscriptionData.digiup_user_id,
                error: error.message,
                response: error.response?.data,
            });
            throw error;
        }
    }

    // Verify user access in CreatorUp
    async verifyUserAccess(digiupToken: string): Promise<any> {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.creatorUpApiUrl}/api/v1/digiup/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${digiupToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                },
            );

            return response.data;
        } catch (error: any) {
            logger.error('Failed to verify user access in CreatorUp:', error.message);
            throw error;
        }
    }

    // Get user profile from CreatorUp
    async getUserProfile(digiupToken: string): Promise<any> {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.creatorUpApiUrl}/api/v1/digiup/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${digiupToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                },
            );

            return response.data;
        } catch (error: any) {
            logger.error('Failed to get user profile from CreatorUp:', error.message);
            throw error;
        }
    }

    // Check feature access in CreatorUp
    async checkFeatureAccess(digiupToken: string, feature: string): Promise<any> {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.creatorUpApiUrl}/api/v1/membership/feature/${feature}/access`,
                {
                    headers: {
                        Authorization: `Bearer ${digiupToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                },
            );

            return response.data;
        } catch (error: any) {
            logger.error(`Failed to check feature access for ${feature}:`, error.message);
            throw error;
        }
    }

    // Generate webhook signature for security
    generateWebhookSignature(data: any): string {
        const payload = JSON.stringify(data);
        return crypto.createHmac('sha256', this.webhookSecret).update(payload).digest('hex');
    }

    // Verify webhook signature
    verifyWebhookSignature(payload: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(payload)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex'),
        );
    }

    // Health check for CreatorUp API
    async healthCheck(): Promise<boolean> {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.creatorUpApiUrl}/api/v1/health`,
                { timeout: 5000 },
            );

            return response.status === 200;
        } catch (error: any) {
            logger.error('CreatorUp API health check failed:', error.message);
            return false;
        }
    }

    // Get sync statistics
    async getSyncStatistics(): Promise<any> {
        try {
            const totalUsers = await prisma.user.count();
            const syncedUsers = await prisma.user.count({
                where: { sync_status: 'synced' },
            });

            const totalSyncEvents = await prisma.syncEvent.count();
            const successfulSyncEvents = await prisma.syncEvent.count({
                where: { status: 'completed' },
            });

            const totalWebhooks = await prisma.webhookLog.count();
            const successfulWebhooks = await prisma.webhookLog.count({
                where: { status: 'processed' },
            });

            const totalUsage = await prisma.creatorUpUsage.count();

            return {
                users: {
                    total: totalUsers,
                    synced: syncedUsers,
                    sync_percentage:
                        totalUsers > 0 ? Math.round((syncedUsers / totalUsers) * 100) : 0,
                },
                sync_events: {
                    total: totalSyncEvents,
                    successful: successfulSyncEvents,
                    success_rate:
                        totalSyncEvents > 0
                            ? Math.round((successfulSyncEvents / totalSyncEvents) * 100)
                            : 0,
                },
                webhooks: {
                    total: totalWebhooks,
                    successful: successfulWebhooks,
                    success_rate:
                        totalWebhooks > 0
                            ? Math.round((successfulWebhooks / totalWebhooks) * 100)
                            : 0,
                },
                usage: {
                    total_records: totalUsage,
                },
            };
        } catch (error: any) {
            logger.error('Failed to get sync statistics:', error.message);
            throw error;
        }
    }

    // Retry failed sync events
    async retryFailedSyncEvents(): Promise<any> {
        try {
            const failedEvents = await prisma.syncEvent.findMany({
                where: {
                    status: 'failed',
                    retryCount: { lt: 3 },
                },
                orderBy: { createdAt: 'asc' },
                take: 10,
            });

            const results = [];

            for (const event of failedEvents) {
                try {
                    // Retry logic based on event type
                    switch (event.eventType) {
                        case 'user_sync': {
                            // Retry user sync
                            const user = await prisma.user.findUnique({
                                where: { id: event.userId || undefined },
                            });

                            if (user) {
                                // Implement retry logic here
                                await prisma.syncEvent.update({
                                    where: { id: event.id },
                                    data: {
                                        retryCount: event.retryCount + 1,
                                        status: 'processing',
                                    },
                                });

                                results.push({
                                    event_id: event.id,
                                    status: 'retrying',
                                    retry_count: event.retryCount + 1,
                                });
                            }
                            break;
                        }

                        default:
                            logger.warn(`Unknown event type for retry: ${event.eventType}`);
                    }
                } catch (retryError: any) {
                    await prisma.syncEvent.update({
                        where: { id: event.id },
                        data: {
                            retryCount: event.retryCount + 1,
                            errorMessage: retryError.message,
                        },
                    });

                    results.push({
                        event_id: event.id,
                        status: 'failed',
                        error: retryError.message,
                    });
                }
            }

            return {
                retried_events: results.length,
                results: results,
            };
        } catch (error: any) {
            logger.error('Failed to retry sync events:', error.message);
            throw error;
        }
    }
}

export default new CreatorUpIntegrationService();
