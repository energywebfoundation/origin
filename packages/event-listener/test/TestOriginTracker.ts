import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';

import { SCAN_INTERVAL } from '../src/index';
import { EmailServiceProvider } from '../src/services/email.service';
import { OriginEventTracker } from '../src/services/event/OriginEventTracker';
import { deployDemo } from './helpers/deployDemo';
import { TestEmailAdapter } from './helpers/TestAdapter';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Origin Tracker Tests', async () => {
    dotenv.config({
        path: '.env.dev'
    });

    let originContract;

    before(async () => {
        const resultDeploy1 = await deployDemo();
        originContract = resultDeploy1.deployResult.originContractLookup;
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
