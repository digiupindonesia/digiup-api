import { PrismaClient } from '@prisma/client';
import httpMsg from '@utils/http_messages/http_msg';
import logger from '@utils/logger/winston/logger';

const prisma = new PrismaClient();

interface CreatorUpCredentials {
    email: string;
    password: string;
}

interface SaveCredentialsPayload {
    userId: string;
    email: string;
    password: string;
}

export class CreatorUpCredentialsService {
    /**
     * Save CreatorUp credentials for user
     */
    async saveCredentials(payload: SaveCredentialsPayload): Promise<any> {
        try {
            const { userId, email, password } = payload;

            // Update user with CreatorUp credentials
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    creatorup_metadata: {
                        email: email,
                        password: password, // Note: In production, this should be encrypted
                        registered_at: new Date().toISOString(),
                    },
                    sync_status: 'registered',
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    creatorup_metadata: true,
                    sync_status: true,
                },
            });

            logger.info(`CreatorUp credentials saved for user: ${userId}`);

            return httpMsg.http200({
                message: 'CreatorUp credentials saved successfully',
                user: updatedUser,
            });
        } catch (error: any) {
            logger.error(
                `Failed to save CreatorUp credentials for user: ${payload.userId}. Error: ${error.message}`,
            );
            return httpMsg.http422(
                'Failed to save CreatorUp credentials',
                'CREATORUP_CREDENTIALS_SAVE_ERROR',
            );
        }
    }

    /**
     * Get CreatorUp credentials for user
     */
    async getCredentials(userId: string): Promise<any> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    creatorup_metadata: true,
                    sync_status: true,
                },
            });

            if (!user) {
                return httpMsg.http404('User not found', 'USER_NOT_FOUND');
            }

            if (!user.creatorup_metadata) {
                return httpMsg.http404(
                    'CreatorUp credentials not found',
                    'CREATORUP_CREDENTIALS_NOT_FOUND',
                );
            }

            const credentials = user.creatorup_metadata as any;

            return httpMsg.http200({
                message: 'CreatorUp credentials retrieved successfully',
                credentials: {
                    email: credentials.email,
                    registered_at: credentials.registered_at,
                },
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    sync_status: user.sync_status,
                },
            });
        } catch (error: any) {
            logger.error(
                `Failed to get CreatorUp credentials for user: ${userId}. Error: ${error.message}`,
            );
            return httpMsg.http422(
                'Failed to get CreatorUp credentials',
                'CREATORUP_CREDENTIALS_GET_ERROR',
            );
        }
    }

    /**
     * Check if user has CreatorUp credentials
     */
    async hasCredentials(userId: string): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    creatorup_metadata: true,
                    sync_status: true,
                },
            });

            return !!(user?.creatorup_metadata && user.sync_status === 'registered');
        } catch (error: any) {
            logger.error(
                `Failed to check CreatorUp credentials for user: ${userId}. Error: ${error.message}`,
            );
            return false;
        }
    }

    /**
     * Get raw credentials for API calls (internal use only)
     */
    async getRawCredentials(userId: string): Promise<CreatorUpCredentials | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    creatorup_metadata: true,
                },
            });

            if (!user?.creatorup_metadata) {
                return null;
            }

            const metadata = user.creatorup_metadata as any;
            return {
                email: metadata.email,
                password: metadata.password,
            };
        } catch (error: any) {
            logger.error(
                `Failed to get raw CreatorUp credentials for user: ${userId}. Error: ${error.message}`,
            );
            return null;
        }
    }
}

export default CreatorUpCredentialsService;
