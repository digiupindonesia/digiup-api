import { Request, Response, NextFunction } from 'express';
import creatorupServices from '@services/client/creatorup_integration';
import logger from '@utils/logger/winston/logger';

const register = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;
    const { username, email, password } = req.body;

    const payload = {
        userId: user.id,
        username,
        email,
        password,
    };

    creatorupServices
        .register(payload)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`CreatorUp register error. ${err.message}`);
            next(err);
        });
};

const login = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;

    const payload = {
        userId: user.id,
    };

    creatorupServices
        .login(payload)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`CreatorUp login error. ${err.message}`);
            next(err);
        });
};

const getCredentials = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;
    const credentialsService = new creatorupServices.credentials();

    credentialsService
        .getCredentials(user.id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Get CreatorUp credentials error. ${err.message}`);
            next(err);
        });
};

const saveCredentials = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;
    const { email, password } = req.body;

    const payload = {
        userId: user.id,
        email,
        password,
    };

    const credentialsService = new creatorupServices.credentials();

    credentialsService
        .saveCredentials(payload)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Save CreatorUp credentials error. ${err.message}`);
            next(err);
        });
};

const checkRegistrationStatus = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;
    const credentialsService = new creatorupServices.credentials();

    credentialsService
        .hasCredentials(user.id)
        .then((hasCredentials: boolean) => {
            res.status(200).json({
                success: true,
                message: 'Registration status checked',
                data: {
                    isRegistered: hasCredentials,
                    userId: user.id,
                    email: user.email,
                },
            });
        })
        .catch((err: any) => {
            logger.error(`Check CreatorUp registration status error. ${err.message}`);
            next(err);
        });
};

export default {
    register,
    login,
    getCredentials,
    saveCredentials,
    checkRegistrationStatus,
};
