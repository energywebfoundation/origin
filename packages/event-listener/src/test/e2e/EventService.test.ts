import axios from 'axios';
import { assert } from 'chai';
import Web3 from 'web3';
import dotenv from 'dotenv';

import { Demo } from '../deployDemo';

import { EventServiceProvider } from '../../services/event.service';

describe('Event Service Tests', async () => {
    dotenv.config({
        path: '.env.test'
    });

    let demo: Demo;

    before(async () => {
        demo = new Demo(process.env.WEB3, process.env.DEPLOY_KEY);
        await demo.deploy();
    });

    it('gets an instance of marketContractLookup', async () => {
        const response = await axios.get(`${process.env.BACKEND_URL}/MarketContractLookup`);
        assert.equal(response.data.length, 1);
        assert.equal(typeof response.data[0], 'string');
    });

    it('initializes event service', async () => {
        const eventService = new EventServiceProvider(
            process.env.BACKEND_URL,
            new Web3(process.env.WEB3)
        );

        await eventService.start();

        assert.equal(eventService.listeners.length, 1);
        eventService.stop();
    });
});
