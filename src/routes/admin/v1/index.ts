import { Router } from 'express';
import usersRoute from './users_route';
import appsRoute from './apps_route';
import syncAnalyticsRoute from './analytics/sync_analytics_route';
import creatorupUsersRoute from './creatorup_users_route';

const router = Router();

const defaultRoutes = [
    {
        path: '/users',
        route: usersRoute,
    },
    {
        path: '/apps',
        route: appsRoute,
    },
    {
        path: '/analytics',
        route: syncAnalyticsRoute,
    },
    {
        path: '/creatorup-users',
        route: creatorupUsersRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
