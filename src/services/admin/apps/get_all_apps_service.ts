import httpMsg from '@utils/http_messages/http_msg';
import findAll from '@dao/apps/app_get_all_dao';

const errCode = 'ERROR_APPS_GET_ALL';
const msgError = 'Failed to get all apps';

export default async () => {
    const where = {};

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

    const apps = await getAllApps(where, select);

    return httpMsg.http200(apps.data);
};

const getAllApps = async (where: object, select: object) => {
    const result = await findAll(where, select);

    /* istanbul ignore if  */
    if (!result.success || !result.data) httpMsg.http422(msgError, errCode);

    return { success: result.success, data: result.data, error: result.error };
};
