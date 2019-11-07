import { AssetLogic, ProducingAsset } from '@energyweb/asset-registry';
import { Demand, MarketLogic, Supply } from '@energyweb/market';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { UserLogic } from '@energyweb/user-registry';
import {
    Configuration,
    ContractEventHandler,
    Currency,
    EventHandlerManager,
    Unit
} from '@energyweb/utils-general';
import { assert } from 'chai';

import { startMatcher } from '..';
import {
    deploy,
    deployDemand,
    deployCertificate,
    deployAsset,
    deploySupply,
    deployAgreement
} from './TestEnvironment';

describe('Market-matcher e2e tests', async () => {
    const assertMatched = (
        config: Configuration.Entity,
        demand: Demand.Entity,
        certificate: Certificate.Entity,
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
                assert.equal(_certificateId, certificate.id);
                assert.equal(_amount, requiredEnergy);

                const updatedCertificate = await certificate.sync();
                assert.equal(updatedCertificate.owner, demand.demandOwner);

                done();
            }
        });

        const eventHandlerManager = new EventHandlerManager(1000, config);
        eventHandlerManager.registerEventHandler(marketContractEventHandler);
        eventHandlerManager.start();
    };

    describe('Certificate -> Demand matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;

        let config: Configuration.Entity<MarketLogic, AssetLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let asset: ProducingAsset.Entity;
        let certificate: Certificate.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            demand = await deployDemand(config, requiredEnergy);
            asset = await deployAsset(config);
            certificate = await deployCertificate(config, asset.id, requiredEnergy);

            await startMatcher(matcherConfig);

            await certificate.publishForSale(
                demand.offChainProperties.maxPricePerMwh / 100,
                demand.offChainProperties.currency
            );
        });

        it('certificate should be matched with existing demand', done => {
            assertMatched(config, demand, certificate, requiredEnergy, done);
        }).timeout(20000);
    });

    describe('Demand -> Certificate matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;
        const price = 150;
        const currency = Currency.USD;

        let config: Configuration.Entity<MarketLogic, AssetLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let asset: ProducingAsset.Entity;
        let certificate: Certificate.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            asset = await deployAsset(config);
            certificate = await deployCertificate(config, asset.id, requiredEnergy);
            await certificate.publishForSale(price / 100, currency);

            await startMatcher(matcherConfig);

            demand = await deployDemand(config, requiredEnergy, price, currency);
        });

        it('demand should be matched with existing certificate', done => {
            assertMatched(config, demand, certificate, requiredEnergy, done);
        }).timeout(60000);
    });

    describe('Agreement -> Certificate matching tests', () => {
        const requiredEnergy = 1 * Unit.MWh;
        const price = 150;
        const currency = Currency.USD;

        let config: Configuration.Entity<MarketLogic, AssetLogic, CertificateLogic, UserLogic>;
        let demand: Demand.Entity;
        let asset: ProducingAsset.Entity;
        let certificate: Certificate.Entity;
        let supply: Supply.Entity;

        before(async () => {
            const configuration = await deploy();
            const { matcherConfig } = configuration;

            config = configuration.config;
            asset = await deployAsset(config);
            certificate = await deployCertificate(config, asset.id, requiredEnergy);

            supply = await deploySupply(config, asset.id, requiredEnergy, price, currency);
            demand = await deployDemand(config, requiredEnergy, price, currency);

            await deployAgreement(config, demand.id, supply.id, price, currency);

            await certificate.publishForSale(price / 100, currency);

            await startMatcher(matcherConfig);
        });

        it('demand should be matched with existing certificate', done => {
            assertMatched(config, demand, certificate, requiredEnergy, done);
        }).timeout(60000);
    });
});
