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

describe('API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: http.Server;

    const BASE_API_URL = `http://localhost:${process.env.PORT}/api`;

    const marketContractLookup = '0x665b25e0edc2d9b5dee75c5f652f92f5b58be12b';
    const marketContractLookup2 = '0x123b25e0edc2d9b5dee75c5f652f92f5b58be12b';
    const entityOwner = '0x24B207fFf1a1097d3c3D69fcE461544f83c6E774';

    const testHash = '1d5e7af973fe1387493b2b70e611c57fc3f354e6ec963b811cac529d8ed17288';

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
            await axios.post(`${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`);
            await axios.post(`${BASE_API_URL}/MarketContractLookup/${marketContractLookup2}`);

            const getResult: AxiosResponse = await axios.get(`${BASE_API_URL}/MarketContractLookup`);

            assert.deepEqual(
                getResult.data,
                [marketContractLookup, marketContractLookup2]
            );
        });

        it('returns empty array when no entities have been created', async () => {
            const result = await axios.get(`${BASE_API_URL}/Entity`);

            assert.equal(result.status, STATUS_CODES.SUCCESS);
            assert.isEmpty(result.data);
        });

        it('fails to get a single Entity when no entities have been created', async () => {
            let failed: boolean = false;

            try {
                await axios.get(`${BASE_API_URL}/Entity/${testHash}`);
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);
                assert.equal(data.error, StorageErrors.NON_EXISTENT_ENTITY);
                failed = true;
            }

            assert.isTrue(failed);
        });

        it('gets an Entity', async () => {
            await axios.post(`${BASE_API_URL}/Entity/${testHash}`, { entityOwner });
    
            const getResult: AxiosResponse = await axios.get(
                `${BASE_API_URL}/Entity/${testHash}`
            );
    
            assert.equal(getResult.status, STATUS_CODES.SUCCESS);
            assert(getResult.data);
            assert.equal(getResult.data.entityOwner, entityOwner);
        });

        xit('filters an Entity based on a property', async () => {
            await axios.post(`${BASE_API_URL}/Entity/${testHash}`, { entityOwner });
    
            const getResult: AxiosResponse = await axios.get(
                `${BASE_API_URL}/Entity`,
                {
                    params: {
                        filter: {
                            entityOwner
                        }
                    }
                }
            );
    
            assert.equal(getResult.status, STATUS_CODES.SUCCESS);
            assert.isNotEmpty(getResult.data);
            assert.equal(getResult.data[0].entityOwner, entityOwner);
        });

        xit(`returns no Entities that don't match a filter`, async () => {
            await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { entityOwner }
            );
    
            const getResult: AxiosResponse = await axios.get(
                `${BASE_API_URL}/Entity`,
                {
                    params: {
                        filter: {
                            entityOwner: '0x0'
                        }
                    }
                }
            );
    
            assert.equal(getResult.status, STATUS_CODES.SUCCESS);
            assert.isEmpty(getResult.data);
        });

        xit(`returns sorted Entities by property`, async () => {
            await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { startTime: 100 }
            );

            await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { startTime: 200 }
            );
    
            const getResult: AxiosResponse = await axios.get(
                `${BASE_API_URL}/Entity`,
                {
                    params: {
                        sortBy: {
                            property: 'startTime',
                            condition: 'higherFirst'
                        }
                    }
                }
            );
    
            assert.equal(getResult.status, STATUS_CODES.SUCCESS);
            assert.isNotEmpty(getResult.data);

            assert.equal(getResult.data[0].startTime, 200);
            assert.equal(getResult.data[1].startTime, 100);
        });
    });

    describe('POST', () => {
        it('creates a MarketContractLookup', async () => {
            const postResult: AxiosResponse = await axios.post(
                `${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`
            );
    
            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, `MarketContractLookup ${marketContractLookup} created`);
        });

        it('fails creating the same MarketContractLookup', async () => {
            await axios.post(
                `${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`
            );
    
            let failed = false;
    
            try {
                await axios.post(
                    `${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`
                );
            } catch (error) {
                const { status, data } = error.response;

                assert.equal(status, STATUS_CODES.CONFLICT);
                assert.equal(data.error, StorageErrors.ALREADY_EXISTS);
                failed = true;
            }
    
            assert.isTrue(failed);
        });

        it('creates an Entity', async () => {
            const postResult: AxiosResponse = await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { entityOwner }
            );
    
            assert.equal(postResult.status, STATUS_CODES.CREATED);
            assert.equal(postResult.data.message, `Entity ${testHash} created`);
        });
    
        it('returns 200 when creating the same Entity', async () => {
            await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { entityOwner }
            );
    
            const result = await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { entityOwner }
            );

            assert.equal(result.status, STATUS_CODES.SUCCESS);
        });
    });

    describe('DELETE', () => {
        it('deletes a marketContractLookup', async () => {
            await axios.post(
                `${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`
            );
    
            const deleteResult = await axios.delete(
                `${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`
            );
            assert.equal(deleteResult.status, STATUS_CODES.NO_CONTENT);
    
            let failed: boolean = false;
    
            try {
                await axios.delete(`${BASE_API_URL}/MarketContractLookup/${marketContractLookup}`);
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);
                assert.equal(data.error, StorageErrors.NON_EXISTENT_ENTITY);
                failed = true;
            }
    
            assert.isTrue(failed);
        });

        it('deletes a Entity', async () => {
            await axios.post(
                `${BASE_API_URL}/Entity/${testHash}`,
                { entityOwner }
            );
    
            const deleteResult = await axios.delete(
                `${BASE_API_URL}/Entity/${testHash}`
            );
            assert.equal(deleteResult.status, STATUS_CODES.NO_CONTENT);
    
            let failed: boolean = false;
    
            try {
                await axios.get(`${BASE_API_URL}/Entity/${testHash}`);
            } catch (error) {
                const { status, data } = error.response;
                assert.equal(status, STATUS_CODES.NOT_FOUND);
                assert.equal(data.error, StorageErrors.NON_EXISTENT_ENTITY);
                failed = true;
            }
    
            assert.isTrue(failed);
        });
    });

});
