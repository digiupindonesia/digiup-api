import { Request, Response, NextFunction } from 'express';
import createAppService from '@services/admin/apps/create_app_service';
import getAllAppsService from '@services/admin/apps/get_all_apps_service';
import updateAppService from '@services/admin/apps/update_app_service';
import deleteAppService from '@services/admin/apps/delete_app_service';
import logger from '@utils/logger/winston/logger';

const createApp = (req: Request, res: Response, next: NextFunction) => {
    createAppService(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error creating app. ${err.message}`);
            next(err);
        });
};

const getAllApps = (req: Request, res: Response, next: NextFunction) => {
    getAllAppsService()
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error getting all apps. ${err.message}`);
            next(err);
        });
};

const updateApp = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    updateAppService(id, req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error updating app. ${err.message}`);
            next(err);
        });
};

const deleteApp = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    deleteAppService(id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Error deleting app. ${err.message}`);
            next(err);
        });
};

export default {
    createApp,
    getAllApps,
    updateApp,
    deleteApp,
};
