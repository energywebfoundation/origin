import axios, { AxiosResponse } from 'axios';
import 'mocha';
import dotenv from 'dotenv';
import { assert } from 'chai';
import * as fs from 'fs';

import { INestApplication } from '@nestjs/common';
import { startAPI } from '../..';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Country API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: INestApplication;

    const BASE_API_URL = `http://localhost:${process.env.PORT}/api`;

    const country = {
        name: 'Test Country',
        regions: {
            'North East': ['Random NE Region']
        }
    };
    const country2 = {
        name: 'Invading Country',
        regions: ['Region 1']
    };

    beforeEach(async () => {
        apiServer = await startAPI();
    });

    afterEach(async () => {
        await apiServer.close();
        await sleep(100);

        try {
            fs.unlinkSync('db.sqlite');
        } catch (err) {}
    });

    describe('GET', () => {
        it('fails when no country was set', async () => {
            let failed = false;

            try {
                await axios.get(`${BASE_API_URL}/Country`);
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);
                assert.equal(data.message, StorageErrors.NON_EXISTENT);
                failed = true;
            }
            assert.isTrue(failed);
        });

        it('returns the country', async () => {
            await axios.post(`${BASE_API_URL}/Country`, { value: country });

            const getResult = await axios.get(`${BASE_API_URL}/Country`);

            assert.deepEqual(getResult.data, country);
        });
    });

    describe('POST', () => {
        it('creates a Country', async () => {
            const postResult = await axios.post(`${BASE_API_URL}/Country`, { value: country });

            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, `Country ${country.name} created`);
        });

        it('succeeds creating the same Country', async () => {
            await axios.post(`${BASE_API_URL}/Country`, { value: country });
            const postResult = await axios.post(`${BASE_API_URL}/Country`, { value: country });

            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, StorageErrors.ALREADY_EXISTS);
        });

        it('overrides the old country', async () => {
            await axios.post(`${BASE_API_URL}/Country`, { value: country });
            await axios.post(`${BASE_API_URL}/Country`, { value: country2 });

            const getResult = await axios.get(`${BASE_API_URL}/Country`);

            assert.deepEqual(getResult.data, country2);
        });
    });

    describe('DELETE', () => {
        it('deletes a country', async () => {
            await axios.post(`${BASE_API_URL}/Country`, { value: country });

            const deleteResult = await axios.delete(`${BASE_API_URL}/Country`);
            assert.equal(deleteResult.status, STATUS_CODES.SUCCESS);

            let failed = false;

            try {
                await axios.delete(`${BASE_API_URL}/Country`);
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
