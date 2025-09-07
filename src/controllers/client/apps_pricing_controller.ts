import { Request, Response, NextFunction } from 'express';
import {
    getAppPricingPlansService,
    subscribeToAppService,
    getMySubscriptionsService,
} from '@services/client/apps_pricing';

export const getAppPricingPlansController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await getAppPricingPlansService(req, res, next);
};

export const subscribeToAppController = async (req: Request, res: Response, next: NextFunction) => {
    await subscribeToAppService(req, res, next);
};

export const getMySubscriptionsController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await getMySubscriptionsService(req, res, next);
};
