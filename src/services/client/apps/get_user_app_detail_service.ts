import httpMsg from '@utils/http_messages/http_msg';
import findOne from '@dao/apps/app_get_one_dao';
import CreatorUpCredentialsService from '@services/client/creatorup_integration/creatorup_credentials_service';

const errCode = 'ERROR_USER_APP_DETAIL';
const msgError = 'Failed to get user app detail';

export default async (appId: string, userId: string) => {
    try {
        // Check if it's CreatorUp app
        if (appId === 'creatorup-app') {
            const credentialsService = new CreatorUpCredentialsService();
            const isCreatorUpRegistered = await credentialsService.hasCredentials(userId);

            const creatorUpApp = {
                id: 'creatorup-app',
                name: 'CreatorUp',
                description:
                    'Platform untuk membuat konten video dengan AI. Dapatkan akses ke fitur-fitur canggih untuk membuat konten video profesional.',
                logo: 'https://creatorup.id/logo.png',
                category: 'Creation',
                status: 'active',
                appUrl: 'https://creatorup.id',
                features: [
                    'AI Video Creation',
                    'Content Templates',
                    'Auto Subtitles',
                    'Voice Over Generation',
                    'Background Music',
                    'Text to Video',
                ],
                tags: ['AI', 'Video', 'Content Creation', 'Automation'],
                isEarlyAccess: false,
                sortOrder: 0,
                createdAt: new Date().toISOString(),
                isUserOwned: isCreatorUpRegistered,
                userStatus: isCreatorUpRegistered ? 'registered' : 'not_registered',
                pricing: {
                    free: {
                        features: ['Basic Templates', 'Limited Exports'],
                        limits: '5 videos per month',
                    },
                    pro: {
                        features: ['All Templates', 'Unlimited Exports', 'AI Voice Over'],
                        limits: 'Unlimited',
                    },
                },
                instructions: isCreatorUpRegistered
                    ? 'Anda sudah terdaftar di CreatorUp. Klik tombol di bawah untuk mengakses platform.'
                    : 'Daftar ke CreatorUp untuk mengakses fitur-fitur canggih pembuatan konten video.',
            };

            return httpMsg.http200(creatorUpApp);
        }

        // Get regular app detail
        const where = {
            id: appId,
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
            sortOrder: true,
            createdAt: true,
        };

        const app = await getAppDetail(where, select);
        if (!app.success || !app.data) {
            return httpMsg.http404('App not found', errCode);
        }

        // Add user ownership status (for now, all regular apps are considered owned)
        const appWithUserStatus = {
            ...app.data,
            isUserOwned: true,
            userStatus: 'owned',
        };

        return httpMsg.http200(appWithUserStatus);
    } catch (error: any) {
        return httpMsg.http422(msgError, errCode);
    }
};

const getAppDetail = async (where: object, select: object) => {
    const result = await findOne(where, select);
    return { success: result.success, data: result.data, error: result.error };
};
