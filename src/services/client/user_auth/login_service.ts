import constError from '@constants/error_constant';
import httpMsg from '@utils/http_messages/http_msg';
import servFindOneUser from '@dao/users/user_get_one_dao';
import servCheckPassword from '@functions/check_password';
import servGenerateToken from '@functions/generate_token_access';

export default async (data: any) => {
    let userLogged = {};

    // Check required user data
    if (!checkRequiredDatas(data))
        return httpMsg.http422(constError.LOGIN_MSG.requiredFields, constError.ERROR_CODE.login);

    // Check existing user and get data
    const user = await getUser({
        email: data.email,
        isDeleted: false,
        isRegistered: true,
    });
    if (!user.success)
        return httpMsg.http401Custom(
            constError.LOGIN_MSG.userNotFound,
            constError.ERROR_CODE.login,
        );
    console.log('masuk sini');

    // Check password
    const checkedPassword = await checkPassword(data.password, user.data.password);
    if (!checkedPassword)
        return httpMsg.http401Custom(
            constError.LOGIN_MSG.invalidPassword,
            constError.ERROR_CODE.login,
        );

    // Generate token access
    const generatedToken = await generateToken(user.data);
    if (!generatedToken.success) return httpMsg.http401(constError.ERROR_CODE.login);

    // User data - format sesuai requirement
    userLogged = {
        id: user.data.id,
        name: user.data.name,
        email: user.data.email,
        phone: user.data.phone,
        avatar: user.data.avatar,
        isVerified: user.data.isRegistered, // isVerified menggunakan isRegistered
        createdAt: user.data.createdAt ? user.data.createdAt.toISOString() : undefined,
        updatedAt: user.data.updatedAt ? user.data.updatedAt.toISOString() : undefined,
        token: generatedToken.data,
    };

    // Success HTTP return
    return httpMsg.http200(userLogged);
};

const checkRequiredDatas = (datas: any) => /* istanbul ignore next */ {
    if (!datas.email) return false;
    if (!datas.password) return false;

    return true;
};

const getUser = async (where: object) => {
    const select = {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        password: true,
        isRegistered: true,
        createdAt: true,
        updatedAt: true,
    };

    // Get user by email
    const result = await servFindOneUser(where, select);

    // Check user status
    if (!result.success || !result.data)
        return { success: false, data: null, error: constError.LOGIN_MSG.userNotFound };
    if (!result.data.password)
        return { success: false, data: null, error: constError.LOGIN_MSG.userNotFound }; // Need to have a password

    return { success: true, data: result.data, error: null };
};

const checkPassword = async (plainPassword: string, hashPassword: string) => {
    const result = await servCheckPassword(plainPassword, hashPassword);
    if (!result.success) return false;

    return true;
};

const generateToken = async (datas: any) => {
    const tokenData = {
        id: datas.id,
        name: datas.name,
        email: datas.email,
        avatar: datas.avatar,
    };

    const result = await servGenerateToken(tokenData);

    /* istanbul ignore if */
    if (!result.success) return { success: false, data: null };

    return { success: true, data: result.data };
};
