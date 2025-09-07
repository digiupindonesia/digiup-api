import { Router } from 'express';
import userAuthRoute from './user_auth_route';
import userMeRoute from './user_me_route';
import creatorupRoute from './creatorup_route';
import membershipRoute from './membership_route';
import batchRoute from './batch_route';
import appsRoute from './apps_route';
import appsPricingRoute from './apps_pricing_route';

const router = Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: userAuthRoute,
    },
    {
        path: '/user/me',
        route: userMeRoute,
    },
    {
        path: '/creatorup',
        route: creatorupRoute,
    },
    {
        path: '/membership',
        route: membershipRoute,
    },
    {
        path: '/batch',
        route: batchRoute,
    },
    {
        path: '/apps',
        route: appsRoute,
    },
    {
        path: '/apps-pricing',
        route: appsPricingRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
