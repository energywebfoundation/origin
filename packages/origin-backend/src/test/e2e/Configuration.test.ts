import axios, { AxiosResponse } from 'axios';
import 'mocha';
import dotenv from 'dotenv';
import { assert } from 'chai';
import * as fs from 'fs';

import { INestApplication } from '@nestjs/common';
import { startAPI } from '../..';
import { STATUS_CODES } from '../../enums/StatusCodes';
import { StorageErrors } from '../../enums/StorageErrors';
import { IOriginConfiguration } from '@energyweb/origin-backend-core';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Configuration API tests', async () => {
    dotenv.config({
        path: '.env.test'
    });
    let apiServer: INestApplication;

    const BASE_API_URL = `http://localhost:${process.env.BACKEND_PORT}/api`;

    const marketContractLookup = '0x665b25e0edc2d9b5dee75c5f652f92f5b58be12b';
    const standard = 'I-REC';
    const country = {
        name: 'Test Country',
        regions: {
            'North East': ['Random NE Region']
        }
    };
    const currency = 'USD';
    const currency2 = 'EUR';

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

    describe('Configuration', () => {
        it('fails with a 404 when configuration not set', async () => {
            let failed = false;

            try {
                await axios.get(`${BASE_API_URL}/Configuration`);
            } catch (e) {
                if (e.response.status === 404) {
                    failed = true;
                } else {
                    throw e;
                }
            }

            assert.isTrue(failed);
        });

        it('updates configuration', async () => {
            const configuration: IOriginConfiguration = {
                marketContractLookup,
                currencies: [currency, currency2],
                countryName: country.name,
                regions: JSON.stringify(country.regions),
                complianceStandard: standard
            };

            await axios.put(`${BASE_API_URL}/Configuration`, configuration);

            const getResult: AxiosResponse = await axios.get(`${BASE_API_URL}/Configuration`);

            assert.deepOwnInclude(getResult.data, configuration);
        });
    });
});
