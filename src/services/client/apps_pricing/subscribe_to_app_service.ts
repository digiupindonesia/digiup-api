import { Request, Response, NextFunction } from 'express';
import { createAppSubscription } from '../../../dao/apps/app_pricing_dao';
import http_msg from '../../../utils/http_messages/http_msg';

const subscribeToAppService = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = req.user as any;
        const { appId, planId } = req.body;

        if (!user) {
            res.status(401).json(http_msg.http401('User not authenticated'));
            return;
        }

        if (!appId || !planId) {
            res.status(400).json(http_msg.http400('App ID and Plan ID are required'));
            return;
        }

        // Check if user already has active subscription
        // This would need to be implemented in DAO

        const subscription = await createAppSubscription(user.id, appId, planId);

        res.status(201).json(
            http_msg.http201({
                message: 'Successfully subscribed to app',
                subscription: subscription,
            }),
        );
    } catch (error) {
        console.error('Error in subscribeToAppService:', error);
        res.status(500).json(http_msg.http500('Internal server error'));
    }
};

export default subscribeToAppService;
