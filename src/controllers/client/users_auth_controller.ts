import { Request, Response, NextFunction } from 'express';
import presenter from '@services/client/user_auth';
import logger from '@utils/logger/winston/logger';
import GoogleOAuthService from '@services/client/user_auth/google_oauth_service';

const login = (req: Request, res: Response, next: NextFunction): void => {
    presenter
        .login(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Login error. ${err.message}`);
            next(err);
        });
};

const logout = (req: Request, res: Response, next: NextFunction): void => {
    presenter
        .logout()
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Logout error. ${err.message}`);
            next(err);
        });
};

const register = (req: Request, res: Response, next: NextFunction): void => {
    presenter
        .register(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Register error. ${err.message}`);
            next(err);
        });
};

const registerConfirm = (req: Request, res: Response, next: NextFunction): void => {
    presenter
        .registerConfirm(req.query)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next*/ {
            logger.error(`Register confirmation error. ${err.message}`);
            next(err);
        });
};

const forgotPasswordRequest = (req: Request, res: Response, next: NextFunction): void => {
    presenter
        .forgotPasswordRequest(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Password reset request error. ${err.message}`);
            next(err);
        });
};

const forgotPasswordReset = (req: Request, res: Response, next: NextFunction): void => {
    presenter
        .forgotPasswordReset(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => {
            logger.error(`Password reset error. ${err.message}`);
            next(err);
        });
};

const googleAuthUrl = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const googleOAuthService = new GoogleOAuthService();
        const authUrl = googleOAuthService.getAuthUrl();
        
        res.status(200).json({
            success: true,
            message: 'Google OAuth URL generated successfully',
            data: {
                authUrl
            }
        });
    } catch (err: any) {
        logger.error(`Google OAuth URL generation error. ${err.message}`);
        next(err);
    }
};

const googleAuthCallback = (req: Request, res: Response, next: NextFunction): void => {
    const googleOAuthService = new GoogleOAuthService();
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        res.status(400).json({
            success: false,
            message: 'Authorization code is required',
            data: null
        });
        return;
    }

    googleOAuthService
        .authenticateWithCode(code)
        .then((result) => {
            if (result.success) {
                // Format response sama dengan login endpoint
                const responseData = {
                    id: result.user!.id,
                    name: result.user!.name,
                    email: result.user!.email,
                    phone: result.user!.phone || null,
                    avatar: result.user!.avatar || result.user!.google_avatar || null,
                    isVerified: result.user!.isRegistered,
                    createdAt: result.user!.createdAt ? result.user!.createdAt.toISOString() : undefined,
                    updatedAt: result.user!.updatedAt ? result.user!.updatedAt.toISOString() : undefined,
                    token: result.token
                };

                res.status(200).json({
                    success: true,
                    message: result.message,
                    content: responseData
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        })
        .catch((err: any) => {
            logger.error(`Google OAuth callback error. ${err.message}`);
            next(err);
        });
};

const googleAuthToken = (req: Request, res: Response, next: NextFunction): void => {
    const googleOAuthService = new GoogleOAuthService();
    const { code, state } = req.body;

    if (!code) {
        res.status(400).json({
            success: false,
            message: 'Authorization code is required',
            data: null
        });
        return;
    }

    googleOAuthService
        .authenticateWithCode(code)
        .then((result) => {
            if (result.success) {
                // Format response sama dengan login endpoint
                const responseData = {
                    id: result.user!.id,
                    name: result.user!.name,
                    email: result.user!.email,
                    phone: result.user!.phone || null,
                    avatar: result.user!.avatar || result.user!.google_avatar || null,
                    isVerified: result.user!.isRegistered,
                    createdAt: result.user!.createdAt ? result.user!.createdAt.toISOString() : undefined,
                    updatedAt: result.user!.updatedAt ? result.user!.updatedAt.toISOString() : undefined,
                    token: result.token
                };

                res.status(200).json({
                    success: true,
                    message: result.message,
                    content: responseData
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        })
        .catch((err: any) => {
            logger.error(`Google OAuth token authentication error. ${err.message}`);
            next(err);
        });
};

export default {
    login,
    logout,
    register,
    registerConfirm,
    forgotPasswordRequest,
    forgotPasswordReset,
    googleAuthUrl,
    googleAuthCallback,
    googleAuthToken,
};
