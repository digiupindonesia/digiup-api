import httpMsg from '@utils/http_messages/http_msg';
import createApp from '@dao/apps/app_create_dao';
import { CreateAppRequest } from '@models/app.model';

const errCode = 'ERROR_APP_CREATE';
const msgError = 'Failed to create app';

export default async (data: CreateAppRequest) => {
    const appData = {
        name: data.name,
        description: data.description,
        logo: data.logo || null,
        category: data.category,
        status: data.status || 'active',
        appUrl: data.appUrl || null,
        features: data.features || null,
        tags: data.tags || [],
        isEarlyAccess: data.isEarlyAccess || false,
        sortOrder: data.sortOrder || 0,
    };

    const select = {
        id: true,
        name: true,
        description: true,
        logo: true,
        category: true,
        status: true,
        appUrl: true,
        features: true,
        pricingPlans: true,
        tags: true,
        isEarlyAccess: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
    };

    const app = await createNewApp(appData, select);

    return httpMsg.http200(app.data);
};

const createNewApp = async (data: any, select: object) => {
    const result = await createApp(data, select);

    /* istanbul ignore if  */
    if (!result.success || !result.data) httpMsg.http422(msgError, errCode);

    return { success: result.success, data: result.data, error: result.error };
};
