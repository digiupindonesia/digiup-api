import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';
import CreatorUpAuthService from './creatorup_auth_service';
import CreatorUpCredentialsService from './creatorup_credentials_service';

const errorCode = 'CREATORUP_REGISTER_ERROR';
const errorMsg = 'Failed to register user to CreatorUp';

export default async (data: any) => {
    try {
        const { userId, username, email, password } = data;

        // Check required data
        if (!checkRequiredData(data)) {
            return httpMsg.http422('Required fields missing', errorCode);
        }

        // Initialize services
        const creatorUpAuth = new CreatorUpAuthService();
        const credentialsService = new CreatorUpCredentialsService();

        // Register user to CreatorUp
        const registerResult = await creatorUpAuth.registerUser({
            username,
            email,
            password,
        });

        if (!registerResult.success) {
            logger.error(`CreatorUp registration failed: ${registerResult.message}`);
            return httpMsg.http422(registerResult.message, errorCode);
        }

        // Save credentials to database
        const saveCredentialsResult = await credentialsService.saveCredentials({
            userId,
            email,
            password,
        });

        if (saveCredentialsResult.httpStatusCode !== 200) {
            logger.error(
                `Failed to save CreatorUp credentials: ${saveCredentialsResult.data?.message}`,
            );
            return httpMsg.http422(
                'Registration successful but failed to save credentials',
                errorCode,
            );
        }

        logger.info(`User ${userId} successfully registered to CreatorUp`);

        return httpMsg.http200({
            message: 'User registered successfully to CreatorUp',
            creatorup_response: registerResult.data,
            credentials_saved: true,
        });
    } catch (error: any) {
        logger.error(`CreatorUp register service error: ${error.message}`);
        return httpMsg.http422(errorMsg, errorCode);
    }
};

const checkRequiredData = (data: any) => {
    return data.userId && data.username && data.email && data.password;
};
