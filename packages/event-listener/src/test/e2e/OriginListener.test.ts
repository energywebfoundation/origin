import { assert } from 'chai';
import dotenv from 'dotenv';
import Web3 from 'web3';

import { Unit } from '@energyweb/utils-general';
import { DeviceStatus, OrganizationStatus } from '@energyweb/origin-backend-core';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { EmailServiceProvider, IEmail } from '../../services/email.service';
import { IOriginEventListener, OriginEventListener } from '../../listeners/origin.listener';
import { OriginEventsStore } from '../../stores/OriginEventsStore';
import { Demo } from '../deployDemo';
import { TestEmailAdapter } from '../TestAdapter';
import EmailTypes from '../../email/EmailTypes';
import { IEventListenerConfig } from '../../config/IEventListenerConfig';
import { initOriginConfig } from '../../config/origin.config';

const SCAN_INTERVAL = 500;
const APPROX_EMAIL_SENDING_TIME = 10000;

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

    const offChainDataSource = new OffChainDataSourceMock();

    before(async () => {
        demo = new Demo(
            process.env.WEB3,
            process.env.DEPLOY_KEY,
            offChainDataSource,
            process.env.EVENT_LISTENER_PRIV_KEY
        );
        await demo.deploy();
    });

    beforeEach(async () => {
        emailService = new EmailServiceProvider(new TestEmailAdapter(), 'from@energyweb.org');
        store = new OriginEventsStore();

        const listenerConfig: IEventListenerConfig = {
            web3Url: process.env.WEB3,
            offChainDataSource,
            accountPrivKey: process.env.EVENT_LISTENER_PRIV_KEY,
            scanInterval: SCAN_INTERVAL,
            notificationInterval: SCAN_INTERVAL
        };

        const web3 = new Web3(listenerConfig.web3Url || 'http://localhost:8550');
        const conf = await initOriginConfig(demo.marketContractLookup, web3, listenerConfig);

        listener = new OriginEventListener(
            conf,
            listenerConfig,
            demo.marketContractLookup,
            emailService,
            store
        );
    });

    afterEach(async () => {
        listener.stop();
    });

    it('an email is sent when a demand has been fulfilled', async () => {
        const demand = await demo.deployDemand();

        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);
        const certificateId = demo.latestDeployedSmReadIndex.toString();

        await waitForConditionAndAssert(
            async () => demo.isForSale(certificateId),
            async () => assert.isTrue(await demo.isForSale(certificateId)),
            SCAN_INTERVAL
        );

        await demo.fillDemand(demand.id, demo.latestDeployedSmReadIndex.toString());

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.DEMAND_FULFILLED),
            () => {
                assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED));
                assert.isTrue(notificationSent(emailService, EmailTypes.FOUND_MATCHING_SUPPLY));
                assert.isTrue(notificationSent(emailService, EmailTypes.DEMAND_PARTIALLY_FILLED));
                assert.isTrue(notificationSent(emailService, EmailTypes.DEMAND_FULFILLED));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME * 2
        );
    });

    it('a certificate is published for sale when autoPublish enabled', async () => {
        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);
        const certificateId = demo.latestDeployedSmReadIndex.toString();

        await waitForConditionAndAssert(
            async () => demo.isForSale(certificateId),
            async () => assert.isTrue(await demo.isForSale(certificateId)),
            SCAN_INTERVAL
        );
    });

    it('an email is sent when a certificate is created', async () => {
        await listener.start();

        currentSmRead += 1 * Unit.MWh;
        await demo.deploySmartMeterRead(currentSmRead);

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.CERTS_APPROVED),
            () => assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED)),
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
            async () => assert.isTrue(await demo.isForSale(certificateId)),
            SCAN_INTERVAL
        );

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.FOUND_MATCHING_SUPPLY),
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
            async () => assert.isTrue(await demo.isForSale(certificateId)),
            SCAN_INTERVAL
        );

        await demo.fillDemand(demand.id, demo.latestDeployedSmReadIndex.toString());

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.DEMAND_PARTIALLY_FILLED),
            () => {
                assert.isTrue(notificationSent(emailService, EmailTypes.CERTS_APPROVED));
                assert.isTrue(notificationSent(emailService, EmailTypes.FOUND_MATCHING_SUPPLY));
                assert.isTrue(notificationSent(emailService, EmailTypes.DEMAND_PARTIALLY_FILLED));
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a device status is changed', async () => {
        await listener.start();

        const newDeviceId = await demo.deployNewDevice();

        assert.equal(await demo.getDeviceStatus(newDeviceId), DeviceStatus.Submitted);
        assert.isAbove(parseInt(newDeviceId, 10), 0);

        await demo.approveDevice(newDeviceId);
        assert.equal(await demo.getDeviceStatus(newDeviceId), DeviceStatus.Active);

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.DEVICE_STATUS_CHANGED),
            () => assert.isTrue(notificationSent(emailService, EmailTypes.DEVICE_STATUS_CHANGED)),
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when an organization status is changed', async () => {
        await listener.start();

        const newOrganization = await demo.createOrganization();
        assert.equal(newOrganization.status, OrganizationStatus.Submitted);

        const updatedOrganization = await demo.approveOrganization(newOrganization.id);
        assert.equal(updatedOrganization.status, OrganizationStatus.Active);

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.ORGANIZATION_STATUS_CHANGES),
            () =>
                assert.isTrue(
                    notificationSent(emailService, EmailTypes.ORGANIZATION_STATUS_CHANGES)
                ),
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a user is invited to an organization', async () => {
        await listener.start();

        const newOrganization = await demo.createOrganization();
        assert.equal(newOrganization.status, OrganizationStatus.Submitted);

        const updatedOrganization = await demo.approveOrganization(newOrganization.id);
        assert.equal(updatedOrganization.status, OrganizationStatus.Active);

        await demo.inviteAdminToOrganization(newOrganization.id);

        await waitForConditionAndAssert(
            () => notificationSent(emailService, EmailTypes.ORGANIZATION_INVITATION),
            () => assert.isTrue(notificationSent(emailService, EmailTypes.ORGANIZATION_INVITATION)),
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });

    it('an email is sent when a user is removed from an organization', async () => {
        await listener.start();

        const newOrganization = await demo.createOrganization();
        assert.equal(newOrganization.status, OrganizationStatus.Submitted);

        const updatedOrganization = await demo.approveOrganization(newOrganization.id);
        assert.equal(updatedOrganization.status, OrganizationStatus.Active);

        const result = await demo.inviteAdminToOrganization(newOrganization.id);
        await demo.acceptInvitationToOrganization(Number(result.error));

        await demo.removeAdminFromOrganization(newOrganization.id);

        await waitForConditionAndAssert(
            () => emailService.sentEmails.length >= 3,
            () => {
                assert.isTrue(
                    notificationSent(emailService, EmailTypes.ORGANIZATION_STATUS_CHANGES)
                );
                assert.isTrue(notificationSent(emailService, EmailTypes.ORGANIZATION_INVITATION));
                assert.isTrue(
                    notificationSent(emailService, EmailTypes.ORGANIZATION_REMOVED_MEMBER)
                );
            },
            SCAN_INTERVAL + APPROX_EMAIL_SENDING_TIME
        );
    });
});
