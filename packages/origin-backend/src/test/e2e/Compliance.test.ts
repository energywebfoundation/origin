import axios, { AxiosResponse } from 'axios';
import 'mocha';
import dotenv from 'dotenv';
import { assert } from 'chai';
import * as fs from 'fs';
import * as http from 'http';

import { INestApplication, LoggerService } from '@nestjs/common';
import { startAPI } from '../..';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockLogger: LoggerService = {
    error: () => {},
    log: () => {},
    warn: () => {},
    debug: () => {},
    verbose: () => {}
};

const startServer = () => startAPI(mockLogger);

describe('Compliance API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: INestApplication;

    const BASE_API_URL = `http://localhost:${process.env.BACKEND_PORT}/api`;

    const standard = 'I-REC';
    const standard2 = 'TIGR';

    beforeEach(async () => {
        apiServer = await startServer();
    });

    afterEach(async () => {
        await apiServer.close();
        await sleep(100);

        try {
            fs.unlinkSync('db.sqlite');
        } catch (err) {}
    });

    describe('GET', () => {
        it('fails when no compliance was set', async () => {
            let failed = false;

            try {
                await axios.get(`${BASE_API_URL}/Compliance`);
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);

                assert.equal(data.message, StorageErrors.NON_EXISTENT);
                failed = true;
            }
            assert.isTrue(failed);
        });

        it('returns the compliance', async () => {
            await axios.post(`${BASE_API_URL}/Compliance`, { value: standard });

            const getResult = await axios.get(`${BASE_API_URL}/Compliance`);

            assert.deepEqual(getResult.data, standard);
        });
    });

    describe('POST', () => {
        it('creates a Compliance', async () => {
            const postResult = await axios.post(`${BASE_API_URL}/Compliance`, { value: standard });

            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, `Compliance ${standard} created`);
        });

        it('succeeds creating the same Compliance', async () => {
            await axios.post(`${BASE_API_URL}/Compliance`, { value: standard });
            const postResult = await axios.post(`${BASE_API_URL}/Compliance`, { value: standard });

            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, StorageErrors.ALREADY_EXISTS);
        });

        it('overrides the old compliance creating the same Compliance', async () => {
            await axios.post(`${BASE_API_URL}/Compliance`, { value: standard });
            await axios.post(`${BASE_API_URL}/Compliance`, { value: standard2 });

            const getResult = await axios.get(`${BASE_API_URL}/Compliance`);

            assert.deepEqual(getResult.data, standard2);
        });
    });

    describe('DELETE', () => {
        it('deletes a compliance', async () => {
            await axios.post(`${BASE_API_URL}/Compliance`, { value: standard });

            const deleteResult = await axios.delete(`${BASE_API_URL}/Compliance`);
            assert.equal(deleteResult.status, STATUS_CODES.SUCCESS);

            let failed = false;

            try {
                await axios.delete(`${BASE_API_URL}/Compliance`);
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);
                assert.equal(data.message, StorageErrors.NON_EXISTENT);
                failed = true;
            }

            assert.isTrue(failed);
        });
    });
});
