import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger/winston/logger';

// Mock membership plans data
const membershipPlans = [
    {
        plan_id: 1,
        name: 'Starter',
        price: 0,
        currency: 'IDR',
        local_rendering_limit: 10,
        device_limit: 1,
        video_quality: 'medium',
        has_ai_subtitle: true,
        has_ai_voiceover: false,
        support_level: 'none',
    },
    {
        plan_id: 2,
        name: 'Growth',
        price: 249000,
        currency: 'IDR',
        local_rendering_limit: 100,
        device_limit: 1,
        video_quality: 'high',
        has_ai_subtitle: true,
        has_ai_voiceover: false,
        support_level: 'standard',
    },
    {
        plan_id: 3,
        name: 'Pro',
        price: 499000,
        currency: 'IDR',
        local_rendering_limit: 500,
        device_limit: 3,
        video_quality: 'ultra',
        has_ai_subtitle: true,
        has_ai_voiceover: true,
        support_level: 'priority',
    },
];

const getPlans = (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'Membership plans retrieved successfully',
            data: membershipPlans,
        });
    } catch (err: any) {
        logger.error(`Get membership plans error. ${err.message}`);
        next(err);
    }
};

const subscribeToPlan = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = req.user as any;
        const { planId } = req.params;
        const { payment_reference, name, phone } = req.body;

        // Find the plan
        const plan = membershipPlans.find((p) => p.plan_id === parseInt(planId));
        if (!plan) {
            res.status(404).json({
                status: 'error',
                message: 'Plan not found',
                data: null,
            });
            return;
        }

        // Mock subscription creation
        const subscriptionData = {
            subscription_id: Math.floor(Math.random() * 10000),
            plan: {
                plan_id: plan.plan_id,
                name: plan.name,
                price: plan.price,
                local_rendering_limit: plan.local_rendering_limit,
            },
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            auto_renew: true,
        };

        res.status(200).json({
            status: 'success',
            message: 'Successfully subscribed to plan',
            data: subscriptionData,
        });
    } catch (err: any) {
        logger.error(`Subscribe to plan error. ${err.message}`);
        next(err);
    }
};

const checkFeatureAccess = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = req.user as any;
        const { feature } = req.params;

        // Mock feature access check
        const hasAccess = user.accountType !== 'free' || feature === 'basic_features';

        const responseData = {
            feature: feature,
            hasAccess: hasAccess,
            reason: hasAccess ? '' : 'Feature not included in current plan',
            plan: user.accountType || 'free',
            usage: {
                local_rendering_used: 0,
                ai_voiceover_used: 0,
                last_reset_date: new Date().toISOString(),
            },
        };

        res.status(200).json({
            status: 'success',
            message: 'Feature access checked',
            data: responseData,
        });
    } catch (err: any) {
        logger.error(`Check feature access error. ${err.message}`);
        next(err);
    }
};

export default {
    getPlans,
    subscribeToPlan,
    checkFeatureAccess,
};
