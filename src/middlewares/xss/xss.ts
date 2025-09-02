import { NextFunction, Request, Response } from 'express';
import { inHTMLData } from 'xss-filters';

/* istanbul ignore next */
const clean = <T>(data: T | string = ''): T => {
    let isObject = false;
    if (typeof data === 'object') {
        data = JSON.stringify(data);
        isObject = true;
    }

    data = inHTMLData(data as string).trim();
    if (isObject) data = JSON.parse(data);

    return data as T;
};

const middleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Clean body
        if (req.body) {
            req.body = clean(req.body);
        }
        
        // Clean query - create new object instead of modifying readonly property
        if (req.query && Object.keys(req.query).length > 0) {
            const cleanedQuery: any = {};
            for (const [key, value] of Object.entries(req.query)) {
                cleanedQuery[key] = clean(value as string);
            }
            Object.defineProperty(req, 'query', {
                value: cleanedQuery,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        
        // Clean params - create new object instead of modifying readonly property
        if (req.params && Object.keys(req.params).length > 0) {
            const cleanedParams: any = {};
            for (const [key, value] of Object.entries(req.params)) {
                cleanedParams[key] = clean(value as string);
            }
            Object.defineProperty(req, 'params', {
                value: cleanedParams,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        
        next();
    };
};

export default middleware;
