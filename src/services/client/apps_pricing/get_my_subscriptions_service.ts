import { Request, Response, NextFunction } from 'express';
import { getUserAllSubscriptions } from '../../../dao/apps/app_pricing_dao';
import http_msg from '../../../utils/http_messages/http_msg';

const getMySubscriptionsService = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const user = req.user as any;

        if (!user) {
            res.status(401).json(http_msg.http401('User not authenticated'));
            return;
        }

        const subscriptions = await getUserAllSubscriptions(user.id);

        res.status(200).json(
            http_msg.http200({
                message: 'Subscriptions retrieved successfully',
                subscriptions: subscriptions,
            }),
        );
    } catch (error) {
        console.error('Error in getMySubscriptionsService:', error);
        res.status(500).json(http_msg.http500('Internal server error'));
    }
};

export default getMySubscriptionsService;
