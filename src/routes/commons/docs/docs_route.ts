import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import pkg from '@packagejson';

import specs from '@utils/swagger/postman_to_swagger';

const router = Router();

const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `Doc ${pkg.name}`,
    customfavIcon: '/assets/images/favicons/favicon.ico',
    swaggerOptions: {
        deepLinking: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
    },
};

// API Generated Doc
const doc = async () => {
    router.use('/', swaggerUi.serve);
    router.get('/', swaggerUi.setup(await specs(), options));
};

doc();

export default router;
