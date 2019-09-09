import { assert } from 'chai';
import Web3 from 'web3';

import { SCAN_INTERVAL } from '../src/index';
import { EmailServiceProvider } from '../src/services/email.service';
import {
    IOriginEventListener,
    OriginEventListener
} from '../src/services/listeners/origin.listener';
import { Demo } from './helpers/deployDemo';
import { TestEmailAdapter } from './helpers/TestAdapter';
import EmailTypes from '../src/services/email/EmailTypes';

const APPROX_EMAIL_SENDING_TIME = 3000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Origin Listener Tests', async () => {
    process.env.UI_BASE_URL = 'http://localhost:3000';
    process.env.API_BASE_URL = 'http://localhost:3030';
    process.env.WEB3 = 'http://localhost:8545';
    const deployKey = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';

    let demo;

    before(async () => {
        demo = new Demo(process.env.WEB3, deployKey);
        await demo.deploy();
    });

    it('an email is sent when a certificate is created', async () => {
        const web3 = new Web3(process.env.WEB3);
        const emailService = new EmailServiceProvider(new TestEmailAdapter(), 'from@energyweb.org');

        assert.equal(emailService.sentEmails.length, 0);

        const NOTIFICATION_INTERVAL = SCAN_INTERVAL;

        const listener: IOriginEventListener = new OriginEventListener(
            demo.originContractLookup,
            web3,
            emailService,
            NOTIFICATION_INTERVAL
        );

        await listener.start();

        await demo.deploySmartMeterRead(1e7);

        await sleep(APPROX_EMAIL_SENDING_TIME + NOTIFICATION_INTERVAL);

        assert.equal(emailService.sentEmails.length, 1);
        assert.isTrue(emailService.sentEmails[0].subject.includes(EmailTypes.CERTS_APPROVED));

        listener.stop();
    });

    it('an email is sent when a demand is matched', async () => {
        const web3 = new Web3(process.env.WEB3);
        const emailService = new EmailServiceProvider(new TestEmailAdapter(), 'from@energyweb.org');

        assert.equal(emailService.sentEmails.length, 0);

        const NOTIFICATION_INTERVAL = SCAN_INTERVAL;

        const listener: IOriginEventListener = new OriginEventListener(
            demo.originContractLookup,
            web3,
            emailService,
            NOTIFICATION_INTERVAL
        );

        await listener.start();

        await demo.deploySmartMeterRead(2e7);

        await sleep(APPROX_EMAIL_SENDING_TIME + NOTIFICATION_INTERVAL);

        assert.equal(emailService.sentEmails.length, 1);
        assert.isTrue(emailService.sentEmails[0].subject.includes(EmailTypes.CERTS_APPROVED));

        listener.stop();
    });
});
