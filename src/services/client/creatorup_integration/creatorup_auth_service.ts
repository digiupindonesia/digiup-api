import axios from 'axios';
import logger from '@utils/logger/winston/logger';

const CREATORUP_BASE_URL = 'https://api.staging.creatorup.id/api/v1';

interface CreatorUpRegisterPayload {
    username: string;
    email: string;
    password: string;
}

interface CreatorUpLoginPayload {
    userEmail: string;
    password: string;
}

interface CreatorUpResponse {
    success: boolean;
    message: string;
    data?: any;
    token?: string;
}

export class CreatorUpAuthService {
    /**
     * Register user to CreatorUp
     */
    async registerUser(payload: CreatorUpRegisterPayload): Promise<CreatorUpResponse> {
        try {
            const response = await axios.post(`${CREATORUP_BASE_URL}/auth/register`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 seconds timeout
            });

            logger.info(`CreatorUp register successful for user: ${payload.email}`);

            return {
                success: true,
                message: 'User registered successfully to CreatorUp',
                data: response.data,
                token: response.data?.token || response.data?.access_token,
            };
        } catch (error: any) {
            logger.error(
                `CreatorUp register failed for user: ${payload.email}. Error: ${error.message}`,
            );

            if (error.response) {
                // API responded with error status
                return {
                    success: false,
                    message: error.response.data?.message || 'Registration failed',
                    data: error.response.data,
                };
            } else if (error.request) {
                // Request was made but no response received
                return {
                    success: false,
                    message: 'Unable to connect to CreatorUp API',
                    data: null,
                };
            } else {
                // Something else happened
                return {
                    success: false,
                    message: 'Registration request failed',
                    data: null,
                };
            }
        }
    }

    /**
     * Login user to CreatorUp
     */
    async loginUser(payload: CreatorUpLoginPayload): Promise<CreatorUpResponse> {
        try {
            const response = await axios.post(`${CREATORUP_BASE_URL}/auth/login`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 seconds timeout
            });

            logger.info(`CreatorUp login successful for user: ${payload.userEmail}`);

            return {
                success: true,
                message: 'User logged in successfully to CreatorUp',
                data: response.data,
                token: response.data?.token || response.data?.access_token,
            };
        } catch (error: any) {
            logger.error(
                `CreatorUp login failed for user: ${payload.userEmail}. Error: ${error.message}`,
            );

            if (error.response) {
                // API responded with error status
                return {
                    success: false,
                    message: error.response.data?.message || 'Login failed',
                    data: error.response.data,
                };
            } else if (error.request) {
                // Request was made but no response received
                return {
                    success: false,
                    message: 'Unable to connect to CreatorUp API',
                    data: null,
                };
            } else {
                // Something else happened
                return {
                    success: false,
                    message: 'Login request failed',
                    data: null,
                };
            }
        }
    }
}

export default CreatorUpAuthService;
