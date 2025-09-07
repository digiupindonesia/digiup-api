import httpMsg from '@utils/http_messages/http_msg';
import findAll from '@dao/apps/app_get_all_dao';
import CreatorUpCredentialsService from '@services/client/creatorup_integration/creatorup_credentials_service';

const errCode = 'ERROR_USER_APPS_GET_ALL';
const msgError = 'Failed to get user apps';

export default async (userId: string, category?: string) => {
    try {
        // Get all active apps
        const where: any = {
            isActive: true,
            status: 'active',
        };

        if (category) {
            where.category = category;
        }

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

        const apps = await getAllApps(where, select);
        if (!apps.success) {
            return httpMsg.http422(msgError, errCode);
        }

        // Check CreatorUp registration status
        const credentialsService = new CreatorUpCredentialsService();
        const isCreatorUpRegistered = await credentialsService.hasCredentials(userId);

        // Add CreatorUp app if user is registered
        const userApps = [...(apps.data || [])];

        if (isCreatorUpRegistered) {
            // Add CreatorUp app to the list
            const creatorUpApp = {
                id: 'creatorup-app',
                name: 'CreatorUp',
                description: 'Platform untuk membuat konten video dengan AI',
                logo: 'https://creatorup.id/logo.png',
                category: 'Creation',
                status: 'active',
                appUrl: 'https://creatorup.id',
                features: ['AI Video Creation', 'Content Templates', 'Auto Subtitles'],
                tags: ['AI', 'Video', 'Content Creation'],
                isEarlyAccess: false,
                sortOrder: 0,
                createdAt: new Date().toISOString(),
                isUserOwned: true,
                userStatus: 'registered',
            };

            userApps.unshift(creatorUpApp); // Add to beginning
        } else {
            // Add CreatorUp app as available but not owned
            const creatorUpApp = {
                id: 'creatorup-app',
                name: 'CreatorUp',
                description: 'Platform untuk membuat konten video dengan AI',
                logo: 'https://creatorup.id/logo.png',
                category: 'Creation',
                status: 'active',
                appUrl: 'https://creatorup.id',
                features: ['AI Video Creation', 'Content Templates', 'Auto Subtitles'],
                tags: ['AI', 'Video', 'Content Creation'],
                isEarlyAccess: false,
                sortOrder: 0,
                createdAt: new Date().toISOString(),
                isUserOwned: false,
                userStatus: 'not_registered',
            };

            userApps.unshift(creatorUpApp); // Add to beginning
        }

        // Group by category for better presentation
        const categorizedApps = groupAppsByCategory(userApps);

        return httpMsg.http200(categorizedApps);
    } catch (error: any) {
        return httpMsg.http422(msgError, errCode);
    }
};

const getAllApps = async (where: object, select: object) => {
    const result = await findAll(where, select);
    return { success: result.success, data: result.data, error: result.error };
};

const groupAppsByCategory = (apps: any[]) => {
    if (!apps || !Array.isArray(apps)) {
        return {
            Creation: [],
            Automation: [],
            Analytics: [],
            Collaboration: [],
        };
    }

    const categories = ['Creation', 'Automation', 'Analytics', 'Collaboration'];
    const grouped: any = {};

    categories.forEach((category) => {
        grouped[category] = apps.filter((app) => 
            app.category && app.category.toLowerCase() === category.toLowerCase()
        );
    });

    return grouped;
};
