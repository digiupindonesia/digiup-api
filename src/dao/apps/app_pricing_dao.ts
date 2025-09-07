import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAppPricingPlans = async (appId: string, select: object = {}) => {
    return await prisma.appPricingPlan.findMany({
        where: {
            appId: appId,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            billingCycle: true,
            isFree: true,
            features: true,
            limits: true,
            sortOrder: true,
            ...select,
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });
};

export const getAppPricingPlanById = async (planId: string, select: object = {}) => {
    return await prisma.appPricingPlan.findUnique({
        where: {
            id: planId,
        },
        select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            billingCycle: true,
            isFree: true,
            features: true,
            limits: true,
            sortOrder: true,
            app: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    logo: true,
                },
            },
            ...select,
        },
    });
};

export const createAppSubscription = async (
    userId: string,
    appId: string,
    planId: string,
    paymentReference?: string,
) => {
    const plan = await prisma.appPricingPlan.findUnique({
        where: { id: planId },
    });

    if (!plan) {
        throw new Error('Pricing plan not found');
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    let endDate = new Date();

    if (plan.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.billingCycle === 'one_time') {
        endDate.setFullYear(endDate.getFullYear() + 100); // 100 years for one-time payment
    }

    return await prisma.appSubscription.create({
        data: {
            userId,
            appId,
            planId,
            endDate,
            paymentReference,
        },
        include: {
            plan: true,
            app: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });
};

export const getUserAppSubscription = async (userId: string, appId: string) => {
    return await prisma.appSubscription.findFirst({
        where: {
            userId,
            appId,
            status: 'active',
            endDate: {
                gte: new Date(),
            },
        },
        include: {
            plan: true,
            app: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });
};

export const getUserAllSubscriptions = async (userId: string) => {
    return await prisma.appSubscription.findMany({
        where: {
            userId,
            status: 'active',
            endDate: {
                gte: new Date(),
            },
        },
        include: {
            plan: true,
            app: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    category: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
