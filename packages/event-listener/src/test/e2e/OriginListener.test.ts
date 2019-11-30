import { assert } from 'chai';
import dotenv from 'dotenv';

import { Unit } from '@energyweb/utils-general';

import { OffChainDataClientMock } from '@energyweb/origin-backend-client';
import { EmailServiceProvider, IEmail } from '../../services/email.service';
import { IOriginEventListener, OriginEventListener } from '../../listeners/origin.listener';
import { OriginEventsStore } from '../../stores/OriginEventsStore';
import { Demo } from '../deployDemo';
import { TestEmailAdapter } from '../TestAdapter';
import EmailTypes from '../../email/EmailTypes';

const SCAN_INTERVAL = 1000;
const APPROX_EMAIL_SENDING_TIME = 3000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForConditionAndAssert(
    conditionCheckFunction: () => Promise<boolean> | boolean,
    assertFunction: () => Promise<void> | void,
    timeout: number
): Promise<void> {
    let timePassed = 0;
    const interval = 1000;

    while (timePassed < timeout) {
        if (await conditionCheckFunction()) {
            await assertFunction();

            return;
        }

        await sleep(interval);
        timePassed += interval;
    }

    await assertFunction();
}

function notificationSent(emailService: any, notification: EmailTypes) {
    return emailService.sentEmails.some((email: IEmail) => email.subject.includes(notification));
}

describe('Origin Listener Tests', async () => {
    dotenv.config({
        path: '.env.test'
    });

    let demo: Demo;
    let listener: IOriginEventListener;
    let emailService: EmailServiceProvider;
    let store: OriginEventsStore;

    let currentSmRead = 0;
    const offChainDataClient = new OffChainDataClientMock();

    before(async () => {
        demo = new Demo(
            process.env.WEB3,
            process.env.DEPLOY_KEY,
            process.env.EVENT_LISTENER_PRIV_KEY
        );
        await demo.deploy(offChainDataClient);
    });

    beforeEach(async () => {
        emailService = new EmailServiceProvider(new TestEmailAdapter(), 'from@energyweb.org');
        store = new OriginEventsStore();

        const config = {
            web3Url: process.env.WEB3,
            offChainDataSourceUrl: process.env.BACKEND_URL,
            offChainDataSourceClient: offChainDataClient,
            accountPrivKey: process.env.EVENT_LISTENER_PRIV_KEY,
            scanInterval: SCAN_INTERVAL,
            notificationInterval: SCAN_INTERVAL
        };

        listener = new OriginEventListener(config, demo.marketContractLookup, emailService, store);
    });

    afterEach(async () => {
        listener.stop();
    });

    it('a certificate is published for sale when autoPublish enabled', async () => {
        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);
        const certificateId = demo.latestDeployedSmReadIndex.toString();

        await waitForConditionAndAssert(
            async () => demo.isForSale(certificateId),
            async () => {
                const isForSale = await demo.isForSale(certificateId);
                assert.isTrue(isForSale);
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a certificate is created', async () => {
        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length >= 1,
            () => {
                assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a supply is found for a demand', async () => {
        await demo.deployDemand();

        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);
        const certificateId = demo.latestDeployedSmReadIndex.toString();

        await waitForConditionAndAssert(
            async () => demo.isForSale(certificateId),
            async () => {
                const isForSale = await demo.isForSale(certificateId);
                assert.isTrue(isForSale);
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length >= 2,
            () => {
                assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED));
                assert.isTrue(notificationSent(emailService, EmailTypes.FOUND_MATCHING_SUPPLY));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a demand has been partially filled', async () => {
        const demand = await demo.deployDemand();

        await listener.start();

        currentSmRead += 0.5 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);
        const certificateId = demo.latestDeployedSmReadIndex.toString();

        await waitForConditionAndAssert(
            async () => demo.isForSale(certificateId),
            async () => {
                const isForSale = await demo.isForSale(certificateId);
                assert.isTrue(isForSale);
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );

        await demo.fillDemand(demand.id, demo.latestDeployedSmReadIndex.toString());

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length >= 3,
            () => {
                assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED));
                assert.isTrue(notificationSent(emailService, EmailTypes.FOUND_MATCHING_SUPPLY));
                assert.isTrue(notificationSent(emailService, EmailTypes.DEMAND_PARTIALLY_FILLED));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a demand has been fulfilled', async () => {
        const demand = await demo.deployDemand();

        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);
        const certificateId = demo.latestDeployedSmReadIndex.toString();

        await waitForConditionAndAssert(
            async () => demo.isForSale(certificateId),
            async () => {
                const isForSale = await demo.isForSale(certificateId);
                assert.isTrue(isForSale);
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );

        await demo.fillDemand(demand.id, demo.latestDeployedSmReadIndex.toString());

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length >= 4,
            () => {
                assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED));
                assert.isTrue(notificationSent(emailService, EmailTypes.FOUND_MATCHING_SUPPLY));
                assert.isTrue(notificationSent(emailService, EmailTypes.DEMAND_PARTIALLY_FILLED));
                assert.isTrue(notificationSent(emailService, EmailTypes.DEMAND_FULFILLED));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });
});
