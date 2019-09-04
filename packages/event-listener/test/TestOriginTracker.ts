import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';

import { startAPI } from '@energyweb/utils-testbackend/dist/js/src/api';

import { SCAN_INTERVAL } from '../src/index';
import { EmailServiceProvider } from '../src/services/email.service';
import { OriginEventTracker } from '../src/services/event/OriginEventTracker';
import { deployDemo } from './helpers/deployDemo';
import { TestEmailAdapter } from './helpers/TestAdapter';

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Origin Tracker Tests', async () => {
    dotenv.config({
        path: '.env.dev'
    });

    let apiServer;
    let originContract;

    before(async () => {
        ganacheServer = await startGanache();
        apiServer = await startAPI();
        const resultDeploy1 = await deployDemo();
        originContract = resultDeploy1.deployResult.originContractLookup;
    });

    after(async () => {
        apiServer.close();
        await ganacheServer.ganacheServer.close();
    });

    it('an email is sent from OriginEventTracker', async () => {
        const web3 = new Web3(process.env.WEB3);

        const emailAdapter = new TestEmailAdapter();
        const emailService = new EmailServiceProvider(emailAdapter, 'from@energyweb.org');

        const tracker: OriginEventTracker = new OriginEventTracker(
            originContract,
            web3,
            emailService
        );

        await tracker.start();

        await sleep(SCAN_INTERVAL);

        assert.equal(emailService.sentCounter, 1);

        tracker.stop();
    });
});
