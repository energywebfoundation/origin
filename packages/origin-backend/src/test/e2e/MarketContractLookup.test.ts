import axios, { AxiosResponse } from 'axios';
import 'mocha';
import dotenv from 'dotenv';
import { assert } from 'chai';
import * as fs from 'fs';
import * as http from 'http';

import { startAPI } from '../..';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors }  from '../../enums/StorageErrors';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('MarketContractLookup API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: http.Server;

    const BASE_API_URL = `http://localhost:${process.env.PORT}/api`;

    const marketContractLookup = '0x665b25e0edc2d9b5dee75c5f652f92f5b58be12b';
    const marketContractLookup2 = '0x123b25e0edc2d9b5dee75c5f652f92f5b58be12b';

    beforeEach(async () => {
        apiServer = await startAPI();
    });

    afterEach(async () => {
        await apiServer.close();
        await sleep(100);

        try {
            fs.unlinkSync('db.sqlite');
        } catch (err) {
            return;
        }
    });

    describe('GET', () => {
        it('gets empty array when no contract addresses were set', async () => {
            const getResult: AxiosResponse = await axios.get(`${BASE_API_URL}/MarketContractLookup`);

            assert.isEmpty(getResult.data);
            assert.deepEqual(getResult.data, []);
        });

        it('returns all contract addresses', async () => {
            await axios.post(`${BASE_API_URL}/MarketContractLookup`, { value: marketContractLookup });
            await axios.post(`${BASE_API_URL}/MarketContractLookup`, { value: marketContractLookup2 });

            const getResult: AxiosResponse = await axios.get(`${BASE_API_URL}/MarketContractLookup`);

            assert.deepEqual(
                getResult.data,
                [marketContractLookup, marketContractLookup2]
            );
        });
    });

    describe('POST', () => {
        it('creates a MarketContractLookup', async () => {
            const postResult = await axios.post(
                `${BASE_API_URL}/MarketContractLookup`, { value: marketContractLookup }
            );
    
            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, `MarketContractLookup ${marketContractLookup} created`);
        });

        it('succeeds creating the same MarketContractLookup', async () => {
            await axios.post(`${BASE_API_URL}/MarketContractLookup`, { value: marketContractLookup });
            const postResult = await axios.post(
                `${BASE_API_URL}/MarketContractLookup`, { value: marketContractLookup }
            );
    
            assert.equal(postResult.status, STATUS_CODES.SUCCESS);
            assert.equal(postResult.data.message, StorageErrors.ALREADY_EXISTS);
        });

    });

    describe('DELETE', () => {
        it('deletes a marketContractLookup', async () => {
            await axios.post(
                `${BASE_API_URL}/MarketContractLookup`, { value: marketContractLookup }
            );
    
            const deleteResult = await axios.delete(
                `${BASE_API_URL}/MarketContractLookup`, { data: { value: marketContractLookup } }
            );
            assert.equal(deleteResult.status, STATUS_CODES.NO_CONTENT);
    
            let failed: boolean = false;
    
            try {
                await axios.delete(`${BASE_API_URL}/MarketContractLookup`, { data: { value: marketContractLookup } });
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);
                assert.equal(data.error, StorageErrors.NON_EXISTENT);
                failed = true;
            }
    
            assert.isTrue(failed);
        });
    });

});
