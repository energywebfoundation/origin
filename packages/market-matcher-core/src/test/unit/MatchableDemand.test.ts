import 'reflect-metadata';
import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply, PurchasableCertificate } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Currency } from '@energyweb/utils-general';
import { Substitute, Arg } from '@fluffy-spoon/substitute';
import { assert } from 'chai';

import { MatchableDemand } from '../../MatchableDemand';
import { MatchingErrorReason } from '../../MatchingErrorReason';

interface IMockOptions {
    status?: Demand.DemandStatus;
    energy?: number;
    price?: number;
    currency?: Currency;
    producingAssetAssetType?: string;
    address?: string;
    isFilledDemand?: boolean;
    location?: string[];
}

describe('MatchableDemand tests', () => {
    describe('Certificates', () => {
        const missingDemand = 1000;
        const certificateEnergy = 1000;
        const energyPrice = 2;
        const currency = Currency.USD;
        const assetType = 'Solar';
        const location = ['Thailand;Central;Nakhon Pathom'];
        const country = 'Thailand';
        const address =
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140';

        const createMatchingMocks = (options: IMockOptions) => {
            const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
            demandOffChainProperties.energyPerTimeFrame.returns(certificateEnergy);
            demandOffChainProperties.maxPricePerMwh.returns(energyPrice);
            demandOffChainProperties.currency.returns(currency);
            demandOffChainProperties.assetType.returns([assetType]);
            demandOffChainProperties.location.returns(options.location || location);

            const demand = Substitute.for<Demand.IDemand>();
            demand
                .missingEnergyInPeriod(Arg.all())
                .returns(
                    Promise.resolve({ time: 0, value: options.isFilledDemand ? 0 : missingDemand })
                );
            demand.status.returns(options.status || Demand.DemandStatus.ACTIVE);
            demand.offChainProperties.returns(demandOffChainProperties);

            const certificate = Substitute.for<PurchasableCertificate.IPurchasableCertificate>();
            certificate.price.returns(options.price || energyPrice);
            certificate.currency.returns(options.currency || currency);
            certificate.certificate.returns({
                energy: options.energy || certificateEnergy
            } as Certificate.ICertificate);

            const producingAssetOffChainProperties = Substitute.for<
                ProducingAsset.IOffChainProperties
            >();
            producingAssetOffChainProperties.assetType.returns(
                options.producingAssetAssetType || assetType
            );
            producingAssetOffChainProperties.country.returns(country);
            producingAssetOffChainProperties.address.returns(options.address || address);

            const producingAsset = Substitute.for<ProducingAsset.IProducingAsset>();
            producingAsset.offChainProperties.returns(producingAssetOffChainProperties);

            return {
                demand,
                certificate,
                producingAsset
            };
        };

        it('should match certificate', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({});

            const matchableDemand = new MatchableDemand(demand);
            const { result } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isTrue(result);
        });

        it('should not match non active demand', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                status: Demand.DemandStatus.ARCHIVED
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_ACTIVE_DEMAND);
        });

        it('should not match already filled demand', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                isFilledDemand: true
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.PERIOD_ALREADY_FILLED);
        });

        it('should not match demand with lower expected price', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                price: energyPrice + 1
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.TOO_EXPENSIVE);
        });

        it('should not match demand with difference currency', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                currency: Currency.EUR
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_CURRENCY);
        });

        it('should not match demand with not compatible asset type', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                producingAssetAssetType: 'Wind'
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_ASSET_TYPE);
        });

        it('should not match demand with from different location', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                address: 'Warsaw, Poland'
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_LOCATION);
        });

        it('should match demand with certificate when province is in passed region', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                location: ['Thailand;Central']
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isTrue(result);
        });

        it('should not match demand with certificate when province is not included in location', async () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                location: ['Thailand;Central', 'Thailand;Central;Nonthaburi']
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_LOCATION);
        });
    });
    describe('Supply', () => {
        const supplyEnergy = 1000;
        const energyPrice = 100;
        const currency = Currency.USD;
        const assetType = 'Solar';

        const createMatchingMocks = (options: IMockOptions) => {
            const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
            demandOffChainProperties.energyPerTimeFrame.returns(supplyEnergy);
            demandOffChainProperties.maxPricePerMwh.returns(energyPrice * 1e6);
            demandOffChainProperties.currency.returns(currency);
            demandOffChainProperties.assetType.returns([assetType]);

            const demand = Substitute.for<Demand.IDemand>();
            demand.status.returns(options.status || Demand.DemandStatus.ACTIVE);
            demand.offChainProperties.returns(demandOffChainProperties);

            const supplyOffChainProperties = Substitute.for<Supply.ISupplyOffChainProperties>();
            supplyOffChainProperties.availableWh.returns(options.energy || supplyEnergy);
            supplyOffChainProperties.price.returns(
                options.price || (energyPrice * (options.energy || supplyEnergy)) / 1e6
            );

            const supply = Substitute.for<Supply.ISupply>();
            supply.offChainProperties.returns(supplyOffChainProperties);

            return {
                demand,
                supply
            };
        };

        it('should match supply', () => {
            const { demand, supply } = createMatchingMocks({});

            const matchableDemand = new MatchableDemand(demand);
            const { result } = matchableDemand.matchesSupply(supply);

            assert.isTrue(result);
        });

        it('should not match non active demand', () => {
            const { demand, supply } = createMatchingMocks({
                status: Demand.DemandStatus.ARCHIVED
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesSupply(supply);

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_ACTIVE_DEMAND);
        });

        it('should not match active demand with exceeding energy', () => {
            const { demand, supply } = createMatchingMocks({
                energy: supplyEnergy - 1
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesSupply(supply);

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NOT_ENOUGH_ENERGY);
        });

        it('should not match demand with lower expected price', () => {
            const { demand, supply } = createMatchingMocks({
                price: energyPrice * 1e6
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesSupply(supply);

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.TOO_EXPENSIVE);
        });
    });
});
