import axios from 'axios';
import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';

import { startAPI } from '@energyweb/utils-testbackend/dist/js/src/api';
import { deployDemo } from './helpers/deployDemo';

import { EventServiceProvider } from '../src/services/event.service';

import ganache from 'ganache-cli';

let ganacheServer;

const startGanache = async () => {
    return new Promise(resolve => {
        ganacheServer = ganache.server({
            mnemonic: 'chalk park staff buzz chair purchase wise oak receive avoid avoid home',
            gasLimit: 8000000,
            default_balance_ether: 1000000,
            total_accounts: 20
        });

        ganacheServer.listen(8545, (err, blockchain) => {
            resolve({
                blockchain,
                ganacheServer
            });
        });
    });
};

describe('Event Service Tests', async () => {
    dotenv.config({
        path: '.env.dev'
    });

    let apiServer;
    let originContract1;
    let originContract2;

    before(async () => {
        ganacheServer = await startGanache();
        apiServer = await startAPI();
        const resultDeploy1 = await deployDemo();
        originContract1 = resultDeploy1.deployResult.originContractLookup;

        const resultDeploy2 = await deployDemo();
        originContract2 = resultDeploy2.deployResult.originContractLookup;
    });

    after(async () => {
        apiServer.close();
        await ganacheServer.ganacheServer.close();
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

        assert.equal(eventService.trackers.length, 2);
        eventService.stop();
    });
});
