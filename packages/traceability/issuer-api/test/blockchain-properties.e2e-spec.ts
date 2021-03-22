/* eslint-disable no-unused-expressions */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { bootstrapTestInstance, TestUser } from './issuer-api';
import { BlockchainPropertiesDTO } from '../src/pods/blockchain/blockchain-properties.dto';

describe('BlockchainProperties tests', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    before(async () => {
        ({ databaseService, app } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('should be able to get blockchain properties', async () => {
        await request(app.getHttpServer())
            .get('/blockchain-properties')
            .set({ 'test-user': TestUser.OrganizationDeviceManager })
            .expect(HttpStatus.OK)
            .expect((res) => {
                const { netId, registry, issuer, rpcNode }: BlockchainPropertiesDTO = res.body;

                expect(netId).to.be.above(0);
                expect(registry).to.not.be.empty;
                expect(issuer).to.not.be.empty;
                expect(rpcNode).to.not.be.empty;
            });
    });
});
