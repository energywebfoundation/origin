import { assert } from 'chai';
import Web3 from 'web3';

import { EmailServiceProvider, IEmail } from '../../services/email.service';
import { IOriginEventListener, OriginEventListener } from '../../listeners/origin.listener';
import { OriginEventsStore } from '../../stores/OriginEventsStore';
import { Demo } from '../deployDemo';
import { TestEmailAdapter } from '../TestAdapter';
import NotificationTypes from '../../notification/NotificationTypes';

const SCAN_INTERVAL = 3000;
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

function notificationSent(emailService: any, notification: NotificationTypes) {
    return emailService.sentEmails.some((email: IEmail) => email.subject.includes(notification));
}

describe('Origin Listener Tests', async () => {
    process.env.UI_BASE_URL = 'http://localhost:3000';
    process.env.API_BASE_URL = 'http://localhost:3035';
    process.env.WEB3 = 'http://localhost:8550';
    const deployKey = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';

    let demo: any;
    let listener: IOriginEventListener;
    let emailService: any;
    let store: any;

    before(async () => {
        demo = new Demo(process.env.WEB3, deployKey);
        await demo.deploy();
    });

    beforeEach(async () => {
        const web3 = new Web3(process.env.WEB3);
        emailService = new EmailServiceProvider(new TestEmailAdapter(), 'from@energyweb.org');
        store = new OriginEventsStore();

        listener = new OriginEventListener(
            demo.originContractLookup,
            web3,
            emailService,
            store,
            SCAN_INTERVAL
        );
    });

    afterEach(async () => {
        listener.stop();
    });

    it('an email is sent when a certificate is created', async () => {
        await listener.start();

        await demo.deploySmartMeterRead(1e7);

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length > 0,
            () => {
                assert.equal(emailService.sentEmails.length, 1);
                assert.isTrue(notificationSent(emailService, NotificationTypes.CERTS_APPROVED));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a supply is found for a demand', async () => {
        await demo.deployDemand();

        await listener.start();

        await demo.deploySmartMeterRead(2e7);
        await demo.publishForSale(0);

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length > 1,
            () => {
                assert.equal(emailService.sentEmails.length, 2);
                assert.isTrue(notificationSent(emailService, NotificationTypes.CERTS_APPROVED));
                assert.isTrue(
                    notificationSent(emailService, NotificationTypes.FOUND_MATCHING_SUPPLY)
                );
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a demand has been partially filled', async () => {
        const demand = await demo.deployDemand();

        await listener.start();

        await demo.deploySmartMeterRead(3e7);
        await demo.publishForSale(1);

        await demo.fillDemand(demand.id, '1');

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length > 2,
            () => {
                assert.equal(emailService.sentEmails.length, 3);

                assert.isTrue(notificationSent(emailService, NotificationTypes.CERTS_APPROVED));
                assert.isTrue(
                    notificationSent(emailService, NotificationTypes.FOUND_MATCHING_SUPPLY)
                );
                assert.isTrue(
                    notificationSent(emailService, NotificationTypes.DEMAND_PARTIALLY_FILLED)
                );
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });
});
