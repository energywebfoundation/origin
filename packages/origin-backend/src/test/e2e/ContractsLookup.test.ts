import axios, { AxiosResponse } from 'axios';
import 'mocha';
import dotenv from 'dotenv';
import { assert } from 'chai';
import * as fs from 'fs';

import { INestApplication } from '@nestjs/common';
import { IContractsLookup } from '@energyweb/origin-backend-core';
import { startAPI } from '../..';
import { STATUS_CODES } from '../../enums/StatusCodes';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('ContractsLookup API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: INestApplication;

    const BASE_API_URL = `http://localhost:${process.env.BACKEND_PORT}/api`;

    const contracts: IContractsLookup = {
        userLogic: '0x665b25e0edc2d9b5dee75c5f652f92f5b58be12b',
        deviceLogic: '0x565b25e0edc2d9b5dee75c5f652f92f5b58be12b',
        registry: '0x465b25e0edc2d9b5dee75c5f652f92f5b58be12b',
        issuer: '0x365b25e0edc2d9b5dee75c5f652f92f5b58be12b'
    };

    beforeEach(async () => {
        apiServer = await startAPI();
    });

    afterEach(async () => {
        await apiServer.close();
        await sleep(100);

        try {
            fs.unlinkSync('db.sqlite');
            // eslint-disable-next-line no-empty
        } catch (err) {}
    });

    describe('GET', () => {
        it('gets empty array when no contract addresses were set', async () => {
            const getResult: AxiosResponse = await axios.get(`${BASE_API_URL}/ContractsLookup`);

            assert.isEmpty(getResult.data);
            assert.deepEqual(getResult.data, '');
        });

        it('returns all contract addresses', async () => {
            await axios.post(`${BASE_API_URL}/ContractsLookup`, contracts);

            const getResult: AxiosResponse = await axios.get(`${BASE_API_URL}/ContractsLookup`);

            assert.deepOwnInclude(getResult.data, contracts);
        });
    });

    describe('POST', () => {
        it('creates a ContractsLookup', async () => {
            const postResult = await axios.post(`${BASE_API_URL}/ContractsLookup`, contracts);

            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(
                postResult.data.message,
                `ContractsLookup ${JSON.stringify(contracts)} created`
            );
        });
    });

    describe('DELETE', () => {
        it('deletes a contractsLookup', async () => {
            await axios.post(`${BASE_API_URL}/ContractsLookup`, contracts);

            const deleteResult = await axios.delete(`${BASE_API_URL}/ContractsLookup`);
            assert.equal(deleteResult.status, STATUS_CODES.SUCCESS);
        });
    });
});
