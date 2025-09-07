import { Request, Response, NextFunction } from 'express';
import { getAppPricingPlans } from '../../../dao/apps/app_pricing_dao';
import http_msg from '../../../utils/http_messages/http_msg';

const getAppPricingPlansService = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { appId } = req.params;

        if (!appId) {
            res.status(400).json(http_msg.http400('App ID is required'));
            return;
        }

        const pricingPlans = await getAppPricingPlans(appId);

        res.status(200).json(
            http_msg.http200({
                message: 'Pricing plans retrieved successfully',
                plans: pricingPlans,
            }),
        );
    } catch (error) {
        console.error('Error in getAppPricingPlansService:', error);
        res.status(500).json(http_msg.http500('Internal server error'));
    }
};

export default getAppPricingPlansService;
