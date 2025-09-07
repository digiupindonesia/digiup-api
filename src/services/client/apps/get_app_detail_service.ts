import httpMsg from '@utils/http_messages/http_msg';
import findOne from '@dao/apps/app_get_one_dao';

const errCode = 'ERROR_APP_GET_DETAIL';
const msgError = 'Failed to get app detail';

export default async (id: string) => {
    const where = {
        id,
        isActive: true,
        status: 'active',
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

        tags: true,
        isEarlyAccess: true,
        createdAt: true,
    };

    const app = await getAppDetail(where, select);

    if (!app.data) {
        return httpMsg.http404('App not found');
    }

    return httpMsg.http200(app.data);
};

const getAppDetail = async (where: object, select: object) => {
    const result = await findOne(where, select);

    /* istanbul ignore if  */
    if (!result.success) httpMsg.http422(msgError, errCode);

    return { success: result.success, data: result.data, error: result.error };
};
