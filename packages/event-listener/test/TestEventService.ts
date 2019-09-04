import axios from 'axios';
import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';

import { deployDemo } from './helpers/deployDemo';

import { EventServiceProvider } from '../src/services/event.service';

describe('Event Service Tests', async () => {
    dotenv.config({
        path: '.env.dev'
    });

    let originContract1;
    let originContract2;

    before(async () => {
        const resultDeploy1 = await deployDemo();
        originContract1 = resultDeploy1.deployResult.originContractLookup;

        const resultDeploy2 = await deployDemo();
        originContract2 = resultDeploy2.deployResult.originContractLookup;
    });

    it('gets an instance of OriginContractLookupMarketLookupMapping', async () => {
        const response = await axios.get(
            `${process.env.API_BASE_URL}/OriginContractLookupMarketLookupMapping/${originContract1}`
        );
        assert.isNotNull(response.data.marketContractLookup);
    });

    it('initializes event service', async () => {
        const eventService = new EventServiceProvider(
            process.env.API_BASE_URL,
            new Web3(process.env.WEB3)
        );

        await eventService.start();

        assert.equal(eventService.listeners.length, 2);
        eventService.stop();
    });
});
