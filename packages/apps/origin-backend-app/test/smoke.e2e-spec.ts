/* eslint-disable import/no-extraneous-dependencies */
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestInstance } from './origin';

describe('Origin Backend App', () => {
    it('should run origin app', async () => {
        const { app, rpc } = await bootstrapTestInstance();
        await app.init();

        await request(app.getHttpServer()).get(`/configuration`).expect(HttpStatus.OK);

        await app.close();
        rpc.close();
    });
});
