import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';
import CreatorUpAuthService from './creatorup_auth_service';
import CreatorUpCredentialsService from './creatorup_credentials_service';

const errorCode = 'CREATORUP_LOGIN_ERROR';
const errorMsg = 'Failed to login user to CreatorUp';

export default async (data: any) => {
    try {
        const { userId } = data;

        // Check required data
        if (!checkRequiredData(data)) {
            return httpMsg.http422('User ID is required', errorCode);
        }

        // Initialize services
        const creatorUpAuth = new CreatorUpAuthService();
        const credentialsService = new CreatorUpCredentialsService();

        // Check if user has CreatorUp credentials
        const hasCredentials = await credentialsService.hasCredentials(userId);
        if (!hasCredentials) {
            return httpMsg.http404('User not registered to CreatorUp', 'CREATORUP_NOT_REGISTERED');
        }

        // Get user credentials
        const credentials = await credentialsService.getRawCredentials(userId);
        if (!credentials) {
            return httpMsg.http404(
                'CreatorUp credentials not found',
                'CREATORUP_CREDENTIALS_NOT_FOUND',
            );
        }

        // Login user to CreatorUp
        const loginResult = await creatorUpAuth.loginUser({
            userEmail: credentials.email,
            password: credentials.password,
        });

        if (!loginResult.success) {
            logger.error(`CreatorUp login failed: ${loginResult.message}`);
            return httpMsg.http422(loginResult.message, errorCode);
        }

        logger.info(`User ${userId} successfully logged in to CreatorUp`);

        return httpMsg.http200({
            message: 'User logged in successfully to CreatorUp',
            creatorup_response: loginResult.data,
            token: loginResult.token,
        });
    } catch (error: any) {
        logger.error(`CreatorUp login service error: ${error.message}`);
        return httpMsg.http422(errorMsg, errorCode);
    }
};

const checkRequiredData = (data: any) => {
    return data.userId;
};
