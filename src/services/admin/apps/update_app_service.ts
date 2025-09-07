import httpMsg from '@utils/http_messages/http_msg';
import updateApp from '@dao/apps/app_update_dao';
import { UpdateAppRequest } from '@models/app.model';

const errCode = 'ERROR_APP_UPDATE';
const msgError = 'Failed to update app';

export default async (id: string, data: UpdateAppRequest) => {
    const where = { id };

    const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined),
    );

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

    const app = await updateExistingApp(where, updateData, select);

    return httpMsg.http200(app.data);
};

const updateExistingApp = async (where: { id: string }, data: any, select: object) => {
    const result = await updateApp(where, data, select);

    /* istanbul ignore if  */
    if (!result.success || !result.data) httpMsg.http422(msgError, errCode);

    return { success: result.success, data: result.data, error: result.error };
};
