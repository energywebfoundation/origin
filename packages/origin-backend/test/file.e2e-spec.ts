import { LoggedInUser, Role } from '@energyweb/origin-backend-core';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import crypto from 'crypto';
import { expect } from 'chai';

import { FileService } from '../src/pods/file/file.service';
import { OrganizationService } from '../src/pods/organization/organization.service';
import { UserService } from '../src/pods/user';
import { bootstrapTestInstance, registerAndLogin } from './origin-backend';

describe('User e2e tests', () => {
    let app: INestApplication;
    let fileService: FileService;
    let organizationService: OrganizationService;
    let userService: UserService;
    let accessToken: string;
    let user: LoggedInUser;

    const blob = crypto.randomBytes(16);

    before(async () => {
        ({ app, fileService, organizationService, userService } = await bootstrapTestInstance());

        await app.init();

        ({ accessToken, user } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationAdmin
        ]));
    });

    after(async () => {
        await app.close();
    });

    it('should allow authenticated user to upload pdf file', async () => {
        let fileId: string;

        await request(app.getHttpServer())
            .post('/file')
            .attach('files', blob, { filename: 'blob.pdf', contentType: 'application/pdf' })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201)
            .expect((res) => {
                [fileId] = res.body as string[];
            });

        const file = await fileService.get(user, fileId);

        expect(file.data.toString('hex')).to.be.equal(blob.toString('hex'));
    });

    it('should allow to download a file', async () => {
        const mimeType = 'application/pdf';
        const fileId = await fileService.store(user, [
            { originalname: 'blob.pdf', buffer: blob, mimetype: mimeType }
        ]);

        await request(app.getHttpServer())
            .get(`/file/${fileId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect((res) => {
                expect(res.header['content-type']).to.be.equal(mimeType);
                expect(res.body.toString('hex')).to.be.equal(blob.toString('hex'));
            });
    });
});
