import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger/winston/logger';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Log semua error untuk debugging
    logger.error(`Error Handler - ${req.method} ${req.path}:`, {
        error: err.message || err,
        stack: err.stack,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
    });

    // Console log untuk development
    if (process.env.NODE_ENV === 'development') {
        console.error('\n=== ERROR HANDLER ===');
        console.error('Method:', req.method);
        console.error('Path:', req.path);
        console.error('Error:', err);
        console.error('Stack:', err.stack);
        console.error('Body:', req.body);
        console.error('========================\n');
    }

    if (err.error === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: {
                code: 400,
                error: 'VALIDATION_ERROR',
                message: err.message,
            },
        });
        return;
    }

    if (err.error === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            error: {
                code: 401,
                error: 'JWT_AUTHENTICATION_ERROR',
                message: 'Unauthorized. Access denied!',
            },
        });
        return;
    }

    if (err.error === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: {
                code: 401,
                error: 'JWT_AUTHENTICATION_ERROR',
                message: 'Jwt token error. Access denied!',
            },
        });
        return;
    }

    if (err.error === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: {
                code: 401,
                error: 'JWT_AUTHENTICATION_ERROR',
                message: 'Jwt token expired. Access denied!',
            },
        });
        return;
    }

    if (err.error === 'NotFound') {
        res.status(404).json({
            success: false,
            error: {
                code: 404,
                error: 'NOT_FOUND',
                message: 'The requested resource could not be found.',
            },
        });
        return;
    }

    if (err.error === 'Unprocessable') {
        res.status(422).json({
            success: false,
            error: {
                code: 422,
                error: 'UNPROCESSABLE_ENTITY',
                message:
                    'Unprocessable Entity error occurs when a request to the API can not be processed.',
            },
        });
        return;
    }

    // Handle Prisma errors
    if (err.code === 'P2002') {
        res.status(409).json({
            success: false,
            error: {
                code: 409,
                error: 'DUPLICATE_ERROR',
                message: 'A record with this information already exists.',
            },
        });
        return;
    }

    // Handle Prisma connection errors
    if (err.code === 'P1001' || err.code === 'P1002') {
        res.status(503).json({
            success: false,
            error: {
                code: 503,
                error: 'DATABASE_CONNECTION_ERROR',
                message: 'Database connection failed.',
            },
        });
        return;
    }

    // default to 500 server error
    res.status(500).json({
        success: false,
        error: {
            code: 500,
            error: 'SERVER_ERROR',
            message: process.env.NODE_ENV === 'development' 
                ? err.message || 'Internal Server Error'
                : 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        },
    });
};

export default errorHandler;
