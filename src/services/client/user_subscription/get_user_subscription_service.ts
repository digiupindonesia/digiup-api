import { PrismaClient } from '@prisma/client';
import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';

const prisma = new PrismaClient();

const errCode = 'ERROR_USER_SUBSCRIPTION';
const msgError = 'Failed to get user subscription';

export default async (userId: string) => {
    try {
        // Get user membership subscription
        const membershipSubscription = await prisma.userSubscription.findFirst({
            where: {
                userId: userId,
                status: 'active',
            },
            include: {
                plan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        currency: true,
                    },
                },
            },
            orderBy: {
                endDate: 'desc',
            },
        });

        // Get user app subscriptions
        const appSubscriptions = await prisma.appSubscription.findMany({
            where: {
                userId: userId,
                status: 'active',
            },
            include: {
                app: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                    },
                },
                plan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        currency: true,
                        billingCycle: true,
                    },
                },
            },
            orderBy: {
                endDate: 'desc',
            },
        });

        // Format response
        const response = {
            membership: membershipSubscription
                ? {
                      id: membershipSubscription.id,
                      planName: membershipSubscription.plan.name,
                      price: membershipSubscription.plan.price,
                      currency: membershipSubscription.plan.currency,
                      status: membershipSubscription.status,
                      startDate: membershipSubscription.startDate,
                      endDate: membershipSubscription.endDate,
                      activeUntil: membershipSubscription.endDate,
                      autoRenew: membershipSubscription.autoRenew,
                      isActive: membershipSubscription.endDate
                          ? new Date() < membershipSubscription.endDate
                          : true,
                  }
                : null,
            apps: appSubscriptions.map((sub) => ({
                id: sub.id,
                appId: sub.appId,
                appName: sub.app.name,
                appCategory: sub.app.category,
                planName: sub.plan.name,
                price: sub.plan.price,
                currency: sub.plan.currency,
                billingCycle: sub.plan.billingCycle,
                status: sub.status,
                startDate: sub.startDate,
                endDate: sub.endDate,
                activeUntil: sub.endDate,
                autoRenew: sub.autoRenew,
                isActive: new Date() < sub.endDate,
            })),
            summary: {
                totalActiveSubscriptions:
                    appSubscriptions.length + (membershipSubscription ? 1 : 0),
                membershipActive:
                    !!membershipSubscription &&
                    (membershipSubscription.endDate
                        ? new Date() < membershipSubscription.endDate
                        : true),
                appsActive: appSubscriptions.filter((sub) => new Date() < sub.endDate).length,
            },
        };

        return httpMsg.http200(response);
    } catch (error: any) {
        logger.error(`Get user subscription error: ${error.message}`);
        return httpMsg.http422(msgError, errCode);
    }
};
