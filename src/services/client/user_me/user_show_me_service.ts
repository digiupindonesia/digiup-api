import httpMsg from '@utils/http_messages/http_msg';
import servFindOneUser from '@dao/users/user_get_one_dao';
import CreatorUpCredentialsService from '@services/client/creatorup_integration/creatorup_credentials_service';

const errorCod = 'ERROR_USER_FIND_ME';
const errorMsg = 'Failed to show user';

export default async (id: string) => {
    // Check required user data
    if (!checkRequiredDatas(id)) return httpMsg.http422(errorMsg, errorCod);

    // Check existing user and get data
    const user = await getUser({ id, isDeleted: false, isRegistered: true });
    if (!user.success) return httpMsg.http422(user.error || '', errorCod);

    // Check CreatorUp registration status
    const credentialsService = new CreatorUpCredentialsService();
    const isCreatorUpRegistered = await credentialsService.hasCredentials(id);

    // Add CreatorUp status to user data
    const userData = {
        ...user.data,
        creatorup: {
            isRegistered: isCreatorUpRegistered,
            syncStatus: user.data.sync_status || 'pending',
        },
    };

    return httpMsg.http200(userData);
};

const checkRequiredDatas = (id: string) => /* istanbul ignore next */ {
    if (!id) return false;
    return true;
};

const getUser = async (where: object) => {
    const select = {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        accountType: true,
        sync_status: true,
        creatorup_metadata: true,
        createdAt: true,
    };

    // Get user by email
    const result = await servFindOneUser(where, select);
    if (!result.success || !result.data) return { success: false, data: null, error: errorMsg };

    return { success: true, data: result.data, error: null };
};
