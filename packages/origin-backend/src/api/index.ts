import 'reflect-metadata';
import express, { Express } from 'express';

import { AppRoutes, IRoute } from './routes';

const api: Express = express();

AppRoutes.forEach((route: IRoute) => {
    (api as any)[route.method](route.path, ...route.actions);
});

export default api;
