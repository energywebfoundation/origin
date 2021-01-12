/* eslint-disable @typescript-eslint/no-var-requires */
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

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
