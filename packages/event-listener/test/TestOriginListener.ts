import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';

import { SCAN_INTERVAL } from '../src/index';
import { EmailServiceProvider } from '../src/services/email.service';
import { IOriginEventListener, OriginEventListener } from '../src/services/listeners/origin.listener';
import { deployDemo } from './helpers/deployDemo';
import { TestEmailAdapter } from './helpers/TestAdapter';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Origin Listener Tests', async () => {
    dotenv.config({
        path: '.env.dev'
    });

    let originContract;

    before(async () => {
        const resultDeploy1 = await deployDemo();
        originContract = resultDeploy1.deployResult.originContractLookup;
    });

    it('an email is sent from OriginEventListener', async () => {
        const web3 = new Web3(process.env.WEB3);

        const emailAdapter = new TestEmailAdapter();
        const emailService = new EmailServiceProvider(emailAdapter, 'from@energyweb.org');

        const NOTIFICATION_INTERVAL = SCAN_INTERVAL;

        const listener: IOriginEventListener = new OriginEventListener(
            originContract,
            web3,
            emailService,
            NOTIFICATION_INTERVAL
        );

        await listener.start();

        await sleep(NOTIFICATION_INTERVAL + 1000);

        assert.equal(emailService.sentCounter, 1);

        listener.stop();
    });
});
