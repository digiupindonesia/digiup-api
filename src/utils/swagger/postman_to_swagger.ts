import yaml from 'yamljs';
import path from 'path';

import logger from '@utils/logger/winston/logger';

const openApi = 'docs/openapi/swagger.yml';

export default async () => {
    try {
        // Load Swagger file directly without Postman collection
        const result = await yaml.load(openApi);
        logger.info('Swagger documentation loaded successfully');
        return result;
    } catch (err) {
        logger.error(`Failed to load Swagger documentation: ${err}`);
        return null;
    }
};
