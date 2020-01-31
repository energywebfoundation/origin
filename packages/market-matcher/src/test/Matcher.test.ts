import { DeviceLogic, ProducingDevice } from '@energyweb/device-registry';
import { Demand, MarketLogic, Supply, PurchasableCertificate } from '@energyweb/market';
import { CertificateLogic } from '@energyweb/origin';
import { UserLogic } from '@energyweb/user-registry';
import {
    Configuration,
    ContractEventHandler,
    EventHandlerManager,
    Unit
} from '@energyweb/utils-general';
import { assert } from 'chai';

import { startMatcher } from '..';
import {
    deploy,
    deployDemand,
    deployCertificate,
    deployDevice,
    deploySupply,
    deployAgreement
} from './TestEnvironment';

describe('Market-matcher e2e tests', async () => {
    const assertMatched = (
        config: Configuration.Entity,
        demand: Demand.Entity,
        certificateId: string,
        requiredEnergy: number,
        done: Mocha.Done
    ) => {
        const marketContractEventHandler = new ContractEventHandler(
            config.blockchainProperties.marketLogicInstance,
            0
        );

        marketContractEventHandler.onEvent('DemandPartiallyFilled', async (event: any) => {
            const { _demandId, _certificateId, _amount } = event.returnValues;

            if (_demandId === demand.id) {
                const certificate = await new PurchasableCertificate.Entity(
                    certificateId,
                    config
                ).sync();

                assert.equal(_certificateId, certificate.id);
                assert.equal(_amount, requiredEnergy);
                assert.equal(certificate.certificate.owner, demand.demandOwner);

                done();
            } else {
                done('Non-matching demandId');
            }
        });

        const eventHandlerManager = new EventHandlerManager(1000, config);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.start();
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

            await certificate.publishForSale(
                demand.offChainProperties.maxPriceInCentsPerMwh / 100,
                demand.offChainProperties.currency
            );

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

            await certificate.publishForSale(
                demand.offChainProperties.maxPriceInCentsPerMwh / 100,
                demand.offChainProperties.currency
            );

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
        }).timeout(60000);
    });

    describe('Agreement -> Certificate matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;
        const priceInCents = 150;
        const currency = 'USD';

        let config: Configuration.Entity<MarketLogic, DeviceLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let device: ProducingDevice.Entity;
        let certificate: PurchasableCertificate.Entity;
        let supply: Supply.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            device = await deployDevice(config);
            certificate = await deployCertificate(config, device.id, requiredEnergy);

            supply = await deploySupply(config, device.id, requiredEnergy, priceInCents, currency);
            demand = await deployDemand(config, requiredEnergy, priceInCents, currency);

            await deployAgreement(config, demand.id, supply.id, priceInCents, currency);

            await certificate.publishForSale(priceInCents, currency);

            await startMatcher(matcherConfig);
        });

        it('demand should be matched with existing certificate', done => {
            assertMatched(config, demand, certificate.id, requiredEnergy, done);
        }).timeout(60000);
    });
});
