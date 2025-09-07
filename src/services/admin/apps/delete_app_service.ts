import httpMsg from '@utils/http_messages/http_msg';
import deleteApp from '@dao/apps/app_delete_dao';

const errCode = 'ERROR_APP_DELETE';
const msgError = 'Failed to delete app';

export default async (id: string) => {
    const where = { id };

    const select = {
        id: true,
        name: true,
    };

    const app = await deleteExistingApp(where, select);

    return httpMsg.http200({ message: 'App deleted successfully', app: app.data });
};

const deleteExistingApp = async (where: { id: string }, select: object) => {
    const result = await deleteApp(where, select);

    /* istanbul ignore if  */
    if (!result.success || !result.data) httpMsg.http422(msgError, errCode);

    return { success: result.success, data: result.data, error: result.error };
};
