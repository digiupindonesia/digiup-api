import httpMsg from '@utils/http_messages/http_msg';
import findAll from '@dao/apps/app_get_all_dao';

const errCode = 'ERROR_APPS_GET_ALL';
const msgError = 'Failed to get all apps';

export default async (category?: string) => {
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

    // Group by category for better presentation
    const categorizedApps = groupAppsByCategory(apps.data || []);

    return httpMsg.http200(categorizedApps);
};

const getAllApps = async (where: object, select: object) => {
    const result = await findAll(where, select);

    /* istanbul ignore if  */
    if (!result.success || !result.data) httpMsg.http422(msgError, errCode);

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
