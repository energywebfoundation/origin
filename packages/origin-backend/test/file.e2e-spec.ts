import { LoggedInUser, Role } from '@energyweb/origin-backend-core';
import { HttpStatus, INestApplication } from '@nestjs/common';
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
        let file2Id: string;

        await request(app.getHttpServer())
            .post('/file')
            .attach('files', blob, { filename: 'blob.pdf', contentType: 'application/pdf' })
            .attach('files', blob, { filename: 'blob2.pdf', contentType: 'application/pdf' })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                [fileId, file2Id] = res.body as string[];
            });

        const file1 = await fileService.get(fileId, user);
        expect(file1.data.toString('hex')).to.be.equal(blob.toString('hex'));
        expect(file1.isPublic).to.be.equal(false);

        const file2 = await fileService.get(file2Id, user);
        expect(file2.data.toString('hex')).to.be.equal(blob.toString('hex'));
        expect(file2.isPublic).to.be.equal(false);
    });

    it('should allow to download a file', async () => {
        const mimeType = 'application/pdf; charset=utf-8';
        const file = { originalname: 'blob.pdf', buffer: blob, mimetype: mimeType };
        const fileId = await fileService.store(user, [file]);

        await request(app.getHttpServer())
            .get(`/file/${fileId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const parsedFile = Buffer.from(JSON.parse(res.body.toString()).data.data);

                expect(res.header['content-type']).to.be.equal(mimeType);
                expect(parsedFile.toString('hex')).to.be.equal(blob.toString('hex'));
            });
    });

    it('should allow to download a file anonymously', async () => {
        const mimeType = 'application/pdf; charset=utf-8';
        const file = { originalname: 'blob.pdf', buffer: blob, mimetype: mimeType };
        const fileId = await fileService.store(user, [file], true);

        await request(app.getHttpServer())
            .get(`/file/public/${fileId}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                const parsedFile = Buffer.from(JSON.parse(res.body.toString()).data.data);

                expect(res.header['content-type']).to.be.equal(mimeType);
                expect(parsedFile.toString('hex')).to.be.equal(blob.toString('hex'));
            });
    });

    it('should allow authenticated user to upload pdf file as public', async () => {
        let fileId: string;
        let file2Id: string;

        await request(app.getHttpServer())
            .post('/file/public')
            .attach('files', blob, { filename: 'blob.pdf', contentType: 'application/pdf' })
            .attach('files', blob, { filename: 'blob2.pdf', contentType: 'application/pdf' })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                [fileId, file2Id] = res.body as string[];
            });

        const file1 = await fileService.get(fileId, user);
        expect(file1.data.toString('hex')).to.be.equal(blob.toString('hex'));
        expect(file1.isPublic).to.be.equal(true);

        const file2 = await fileService.get(file2Id, user);
        expect(file2.data.toString('hex')).to.be.equal(blob.toString('hex'));
        expect(file2.isPublic).to.be.equal(true);
    });
});
