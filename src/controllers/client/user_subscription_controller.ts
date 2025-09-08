import { Request, Response, NextFunction } from 'express';
import getUserSubscription from '@services/client/user_subscription/get_user_subscription_service';
import logger from '@utils/logger/winston/logger';

const getSubscription = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;
    
    getUserSubscription(user.id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Get user subscription error: ${err.message}`);
            next(err);
        });
};

export default {
    getSubscription,
};
