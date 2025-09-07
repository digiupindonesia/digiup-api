import { Request, Response, NextFunction } from 'express';
import httpMsg from '@utils/http_messages/http_msg';

const errorCod = 'ERROR_ADMIN_AUTH';

const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Check if user exists (from previous auth middleware)
        if (!req.user || !req.user.id) {
            const result = httpMsg.http401('User not authenticated');
            res.status(result.httpStatusCode).json(result.data);
            return;
        }

        // Check if user has admin role
        const userRole = req.user.role;
        if (!userRole || (userRole !== 'admin' && userRole !== 'super_admin')) {
            const result = httpMsg.http403('Access denied. Admin role required');
            res.status(result.httpStatusCode).json(result.data);
            return;
        }

        next();
    } catch (error) {
        const result = httpMsg.http500('Internal server error');
        res.status(result.httpStatusCode).json(result.data);
    }
};

export default adminAuth;
