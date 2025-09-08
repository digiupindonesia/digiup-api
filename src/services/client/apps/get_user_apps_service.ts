import httpMsg from '@utils/http_messages/http_msg';
import findAll from '@dao/apps/app_get_all_dao';
import CreatorUpCredentialsService from '@services/client/creatorup_integration/creatorup_credentials_service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const errCode = 'ERROR_USER_APPS_GET_ALL';
const msgError = 'Failed to get user apps';

export default async (userId: string, category?: string) => {
    try {
        // Get all active apps
        const where: any = {
            isActive: true,
            status: 'active',
        };

        if (category) {
            where.category = category;
        }

        const select = {
            id: true,
            name: true,
            description: true,
            logo: true,
            category: true,
            status: true,
            appUrl: true,
            features: true,
            tags: true,
            isEarlyAccess: true,
            sortOrder: true,
            createdAt: true,
        };

        const apps = await getAllApps(where, select);
        if (!apps.success) {
            return httpMsg.http422(msgError, errCode);
        }

        // Get user app subscriptions
        const userSubscriptions = await prisma.appSubscription.findMany({
            where: {
                userId: userId,
                status: 'active',
            },
            include: {
                plan: {
                    select: {
                        name: true,
                        price: true,
                        currency: true,
                        billingCycle: true,
                    },
                },
            },
        });

        // Create subscription map for quick lookup
        const subscriptionMap = new Map();
        userSubscriptions.forEach((sub) => {
            subscriptionMap.set(sub.appId, {
                id: sub.id,
                planName: sub.plan.name,
                price: sub.plan.price,
                currency: sub.plan.currency,
                billingCycle: sub.plan.billingCycle,
                startDate: sub.startDate,
                endDate: sub.endDate,
                activeUntil: sub.endDate,
                autoRenew: sub.autoRenew,
                isActive: new Date() < sub.endDate,
            });
        });

        // Check CreatorUp registration status
        const credentialsService = new CreatorUpCredentialsService();
        const isCreatorUpRegistered = await credentialsService.hasCredentials(userId);

        // Process apps and add user-specific data
        const userApps = (apps.data || []).map((app: any) => {
            // Check if this is a CreatorUp app from database
            const isCreatorUpApp =
                app.name.toLowerCase().includes('creator') ||
                app.name.toLowerCase().includes('creatorup');

            // Get subscription data for this app
            const subscription = subscriptionMap.get(app.id);

            if (isCreatorUpApp) {
                return {
                    ...app,
                    isUserOwned: isCreatorUpRegistered,
                    userStatus: isCreatorUpRegistered ? 'registered' : 'not_registered',
                    subscription: subscription || null,
                    activeUntil: subscription?.activeUntil || null,
                };
            }

            return {
                ...app,
                isUserOwned: !!subscription,
                userStatus: subscription ? 'subscribed' : 'available',
                subscription: subscription || null,
                activeUntil: subscription?.activeUntil || null,
            };
        });

        // Group by category for better presentation
        const categorizedApps = groupAppsByCategory(userApps);

        return httpMsg.http200(categorizedApps);
    } catch (error: any) {
        return httpMsg.http422(msgError, errCode);
    }
};

const getAllApps = async (where: object, select: object) => {
    const result = await findAll(where, select);
    return { success: result.success, data: result.data, error: result.error };
};

const groupAppsByCategory = (apps: any[]) => {
    if (!apps || !Array.isArray(apps)) {
        return {
            Creation: [],
            Automation: [],
            Analytics: [],
            Collaboration: [],
        };
    }

    const categories = ['Creation', 'Automation', 'Analytics', 'Collaboration'];
    const grouped: any = {};

    categories.forEach((category) => {
        grouped[category] = apps.filter(
            (app) => app.category && app.category.toLowerCase() === category.toLowerCase(),
        );
    });

    return grouped;
};
