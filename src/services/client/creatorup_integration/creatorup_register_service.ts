import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';
import CreatorUpAuthService from './creatorup_auth_service';
import CreatorUpCredentialsService from './creatorup_credentials_service';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const errorCode = 'CREATORUP_REGISTER_ERROR';
const errorMsg = 'Failed to register user to CreatorUp';

export default async (data: any) => {
    try {
        const { userId, username, email, password } = data;

        // Check required data
        if (!checkRequiredData(data)) {
            return httpMsg.http422('Required fields missing', errorCode);
        }

        // Initialize services
        const creatorUpAuth = new CreatorUpAuthService();
        const credentialsService = new CreatorUpCredentialsService();

        // Register user to CreatorUp
        const registerResult = await creatorUpAuth.registerUser({
            username,
            email,
            password,
        });

        if (!registerResult.success) {
            logger.error(`CreatorUp registration failed: ${registerResult.message}`);
            return httpMsg.http422(registerResult.message, errorCode);
        }

        // Save credentials to database
        const saveCredentialsResult = await credentialsService.saveCredentials({
            userId,
            email,
            password,
        });

        if (saveCredentialsResult.httpStatusCode !== 200) {
            logger.error(
                `Failed to save CreatorUp credentials: ${saveCredentialsResult.data?.message}`,
            );
            return httpMsg.http422(
                'Registration successful but failed to save credentials',
                errorCode,
            );
        }

        // Auto-create free tier subscription for CreatorUp
        const subscriptionResult = await createFreeTierSubscription(userId);

        logger.info(`User ${userId} successfully registered to CreatorUp`);

        return httpMsg.http200({
            message: 'User registered successfully to CreatorUp',
            creatorup_response: registerResult.data,
            credentials_saved: true,
            free_subscription_created: subscriptionResult.success,
            subscription_details: subscriptionResult.data,
        });
    } catch (error: any) {
        logger.error(`CreatorUp register service error: ${error.message}`);
        return httpMsg.http422(errorMsg, errorCode);
    }
};

const checkRequiredData = (data: any) => {
    return data.userId && data.username && data.email && data.password;
};

/**
 * Create free tier subscription for CreatorUp app
 */
const createFreeTierSubscription = async (userId: string) => {
    try {
        // Find CreatorUp app
        const creatorUpApp = await prisma.digiupApp.findFirst({
            where: {
                name: {
                    contains: 'creator',
                    mode: 'insensitive',
                },
            },
        });

        if (!creatorUpApp) {
            logger.warn('CreatorUp app not found in database');
            return { success: false, data: null, error: 'CreatorUp app not found' };
        }

        // Find free tier pricing plan
        const freePlan = await prisma.appPricingPlan.findFirst({
            where: {
                appId: creatorUpApp.id,
                name: 'Free',
                isFree: true,
            },
        });

        if (!freePlan) {
            logger.warn('Free tier plan not found for CreatorUp');
            return { success: false, data: null, error: 'Free tier plan not found' };
        }

        // Check if user already has subscription for this app
        const existingSubscription = await prisma.appSubscription.findFirst({
            where: {
                userId: userId,
                appId: creatorUpApp.id,
            },
        });

        if (existingSubscription) {
            logger.info(`User ${userId} already has subscription for CreatorUp`);
            return {
                success: true,
                data: existingSubscription,
                message: 'Subscription already exists',
            };
        }

        // Create free tier subscription (lifetime with monthly reset)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 10); // 10 years (effectively lifetime)

        const subscription = await prisma.appSubscription.create({
            data: {
                id: uuidv4(),
                userId: userId,
                appId: creatorUpApp.id,
                planId: freePlan.id,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                autoRenew: false, // Free tier doesn't auto-renew
            },
            include: {
                app: {
                    select: {
                        name: true,
                        category: true,
                    },
                },
                plan: {
                    select: {
                        name: true,
                        price: true,
                        currency: true,
                        features: true,
                        limits: true,
                    },
                },
            },
        });

        logger.info(`Lifetime free tier subscription created for user ${userId} on CreatorUp`);

        return {
            success: true,
            data: {
                subscriptionId: subscription.id,
                appName: subscription.app.name,
                planName: subscription.plan.name,
                price: subscription.plan.price,
                currency: subscription.plan.currency,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                activeUntil: subscription.endDate,
                features: subscription.plan.features,
                limits: subscription.plan.limits,
            },
            message: 'Lifetime free tier subscription created successfully',
        };
    } catch (error: any) {
        logger.error(`Failed to create free tier subscription: ${error.message}`);
        return { success: false, data: null, error: error.message };
    }
};
