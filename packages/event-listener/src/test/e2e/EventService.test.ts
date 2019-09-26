import axios from 'axios';
import { assert, should } from 'chai';
import Web3 from 'web3';

import { Demo } from '../deployDemo';

import { EventServiceProvider } from '../../services/event.service';

describe('Event Service Tests', async () => {
    process.env.UI_BASE_URL = 'http://localhost:3000';
    process.env.API_BASE_URL = 'http://localhost:3030';
    process.env.WEB3 = 'http://localhost:8545';
    const deployKey = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';

    let demo: any;

    before(async () => {
        demo = new Demo(process.env.WEB3, deployKey);
        await demo.deploy();
    });

    it('gets an instance of OriginContractLookupMarketLookupMapping', async () => {
        const response = await axios.get(
            `${process.env.API_BASE_URL}/OriginContractLookupMarketLookupMapping/${demo.originContractLookup}`
        );
        should().exist(response.data.marketContractLookup);
    });

    it('initializes event service', async () => {
        const eventService = new EventServiceProvider(
            process.env.API_BASE_URL,
            new Web3(process.env.WEB3)
        );

        await eventService.start();

        assert.equal(eventService.listeners.length, 1);
        eventService.stop();
    });
});
