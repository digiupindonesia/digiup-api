import { Request, Response, NextFunction } from 'express';
import getAllAppsService from '@services/client/apps/get_all_apps_service';
import getAppDetailService from '@services/client/apps/get_app_detail_service';
import getUserAppsService from '@services/client/apps/get_user_apps_service';
import getUserAppDetailService from '@services/client/apps/get_user_app_detail_service';
import logger from '@utils/logger/winston/logger';

// Public endpoints (no authentication required)
const getAllApps = (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;
    getAllAppsService(category as string)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error getting all apps. ${err.message}`);
            next(err);
        });
};

const getAppDetail = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    getAppDetailService(id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error getting app detail. ${err.message}`);
            next(err);
        });
};

// Authenticated endpoints (require user authentication)
const getUserApps = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { category } = req.query;

    getUserAppsService(user.id, category as string)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error getting user apps. ${err.message}`);
            next(err);
        });
};

const getUserAppDetail = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const { id } = req.params;

    getUserAppDetailService(id, user.id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error getting user app detail. ${err.message}`);
            next(err);
        });
};

export default {
    // Public endpoints
    getAllApps,
    getAppDetail,

    // Authenticated endpoints
    getUserApps,
    getUserAppDetail,
};
