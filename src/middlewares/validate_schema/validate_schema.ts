import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

import logger from '@utils/logger/winston/logger';

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction): void => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            logger.info(`Zod validation error. ${error.message}`);
            
            // More consistent error format
            res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    error: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: error.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code
                    }))
                }
            });
            return;
        } else {
            logger.error(`Validation middleware error: ${error}`);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    error: 'SERVER_ERROR',
                    message: 'Internal Server Error',
                },
            });
            return;
        }
    }
};

export { validate };
