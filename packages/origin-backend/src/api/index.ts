import "reflect-metadata";
import express, { Express, Request, Response } from 'express';

import { AppRoutes, IRoute } from './routes';

const api: Express = express();

AppRoutes.forEach((route: IRoute) => {
    (api as any)[route.method](route.path, (request: Request, response: Response, next: Function) => {
        route.action(request, response)
            .then(() => next)
            .catch(err => next(err));
    });
});

export default api;
