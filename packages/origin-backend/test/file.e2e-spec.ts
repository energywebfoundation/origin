import { Role } from '@energyweb/origin-backend-core';
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

    before(async () => {
        ({ app, fileService, organizationService, userService } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await app.close();
    });

    it('should allow authenticated user to upload pdf file', async () => {
        const { accessToken } = await registerAndLogin(app, userService, organizationService, [
            Role.OrganizationAdmin
        ]);

        const blob = crypto.randomBytes(16);
        let fileId: string;

        await request(app.getHttpServer())
            .post('/file')
            .attach('files', blob, { filename: 'blob.pdf', contentType: 'application/pdf' })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201)
            .expect((res) => {
                [fileId] = res.body as string[];
            });

        const file = await fileService.get(fileId);

        expect(file.data.toString('hex')).to.be.equal(blob.toString('hex'));
    });
});
