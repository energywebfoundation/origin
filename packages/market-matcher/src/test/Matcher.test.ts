import { DeviceLogic, ProducingDevice } from '@energyweb/device-registry';
import { Demand, MarketLogic, PurchasableCertificate } from '@energyweb/market';
import { CertificateLogic } from '@energyweb/origin';
import { UserLogic } from '@energyweb/user-registry';
import { Configuration, Unit } from '@energyweb/utils-general';
import { assert } from 'chai';

import { startMatcher } from '..';
import { deploy, deployDemand, deployCertificate, deployDevice } from './TestEnvironment';

describe('Market-matcher e2e tests', async () => {
    const assertMatched = (
        config: Configuration.Entity,
        demand: Demand.Entity,
        certificateId: string,
        requiredEnergy: number,
        done: Mocha.Done
    ) => {
        const interval = setInterval(async () => {
            const syncedDemand = await demand.sync();

            if (syncedDemand.demandPartiallyFilledEvents.length > 0) {
                for (const event of syncedDemand.demandPartiallyFilledEvents) {
                    if (event.certificateId === certificateId) {
                        const certificate = await new PurchasableCertificate.Entity(
                            certificateId,
                            config
                        ).sync();

                        assert.equal(event.energy, requiredEnergy);
                        assert.equal(certificate.certificate.owner, demand.owner);

                        clearInterval(interval);
                        done();
                    }
                }
            }
        }, 3000);
    };

    describe('Certificate -> Demand matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;

        let config: Configuration.Entity<MarketLogic, DeviceLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let device: ProducingDevice.Entity;
        let certificate: PurchasableCertificate.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            demand = await deployDemand(config, requiredEnergy);
            device = await deployDevice(config);
            certificate = await deployCertificate(config, device.id, requiredEnergy);

            await certificate.publishForSale(demand.maxPriceInCentsPerMwh, demand.currency);

            await startMatcher(matcherConfig);
        });

        it('certificate should be matched with existing demand', done => {
            assertMatched(config, demand, certificate.id, requiredEnergy, done);
        }).timeout(20000);
    });

    describe('Certificate -> Demand splitting + matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;
        const certificateEnergy = 2 * requiredEnergy;

        let config: Configuration.Entity<MarketLogic, DeviceLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let device: ProducingDevice.Entity;
        let certificate: PurchasableCertificate.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            demand = await deployDemand(config, requiredEnergy);
            device = await deployDevice(config);
            certificate = await deployCertificate(config, device.id, certificateEnergy);

            await certificate.publishForSale(demand.maxPriceInCentsPerMwh, demand.currency);

            await startMatcher(matcherConfig);
        });

        it('certificate should be matched with existing demand', done => {
            // here we expecting that initial certificate #0 will be split into #1 and #2
            // #1 is expected to be matched with the demand
            const expectedMatchedCertificateId = '1';
            assertMatched(config, demand, expectedMatchedCertificateId, requiredEnergy, done);
        }).timeout(20000);
    });

    describe('Demand -> Certificate matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;
        const priceInCents = 150;
        const currency = 'USD';

        let config: Configuration.Entity<MarketLogic, DeviceLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let device: ProducingDevice.Entity;
        let certificate: PurchasableCertificate.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            device = await deployDevice(config);
            certificate = await deployCertificate(config, device.id, requiredEnergy);
            await certificate.publishForSale(priceInCents, currency);

            await startMatcher(matcherConfig);

            demand = await deployDemand(config, requiredEnergy, priceInCents, currency);
        });

        it('demand should be matched with existing certificate', done => {
            assertMatched(config, demand, certificate.id, requiredEnergy, done);
        }).timeout(20000);
    });
});
