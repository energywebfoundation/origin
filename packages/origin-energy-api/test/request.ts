/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import supertest from 'supertest';
import { UserStatus } from '@energyweb/origin-backend-core';

const use = require('superagent-use');
const captureError = require('supertest-capture-error');

export const request = (app: INestApplication): supertest.SuperTest<supertest.Test> =>
    use(supertest(app.getHttpServer())).use(
        captureError((error: any, req: any) => {
            // eslint-disable-next-line no-param-reassign
            error.message += ` at ${req.url}\n Response Body:\n${req.res.text}`;
            // eslint-disable-next-line no-param-reassign
            error.stack = '';
        })
    );

const authenticatedUser = { id: 1, organization: { id: '1000' }, status: UserStatus.Active };

export const authGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = authenticatedUser;

        return true;
    }
};
