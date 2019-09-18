import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand, Supply } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Currency, Unit } from '@energyweb/utils-general';
import { Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';

import { MatchableDemand } from '../../MatchableDemand';
import { MatchingErrorReason } from '../../MatchingErrorReason';

interface IMockOptions {
    status?: Demand.DemandStatus;
    energy?: number;
    price?: number;
    currency?: Currency;
    producingAssetAssetType?: string;
}

describe('MatchableDemand tests', () => {
    describe('Certificates', () => {
        const certificateEnergy = 1000;
        const energyPrice = 100 * 1e6;
        const currency = Currency.USD;
        const assetType = 'Solar';

        const createMatchingMocks = (options: IMockOptions) => {
            const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
            demandOffChainProperties.targetWhPerPeriod.returns(certificateEnergy);
            demandOffChainProperties.maxPricePerMwh.returns(energyPrice);
            demandOffChainProperties.currency.returns(currency);
            demandOffChainProperties.assetType.returns([assetType]);

            const demand = Substitute.for<Demand.IDemand>();
            demand.status.returns(options.status || Demand.DemandStatus.ACTIVE);
            demand.offChainProperties.returns(demandOffChainProperties);

            const certificate = Substitute.for<Certificate.ICertificate>();
            certificate.acceptedToken.returns(0x0);
            certificate.offChainSettlementOptions.returns({
                price: options.price || energyPrice,
                currency: options.currency || currency
            });
            certificate.powerInW.returns(options.energy || certificateEnergy);
            certificate.pricePerUnit(Unit.MWh).returns(options.price || energyPrice);

            const producingAssetOffChainProperties = Substitute.for<
                ProducingAsset.IOffChainProperties
            >();
            producingAssetOffChainProperties.assetType.returns(
                options.producingAssetAssetType || assetType
            );

            const producingAsset = Substitute.for<ProducingAsset.IProducingAsset>();
            producingAsset.offChainProperties.returns(producingAssetOffChainProperties);

            return {
                demand,
                certificate,
                producingAsset
            };
        };

        it('should match certificate', () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({});

            const matchableDemand = new MatchableDemand(demand);
            const { result } = matchableDemand.matchesCertificate(certificate, producingAsset);

            assert.isTrue(result);
        });

        it('should not match non active demand', () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                status: Demand.DemandStatus.ARCHIVED
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_ACTIVE_DEMAND);
        });

        it('should not match active demand with exceeding power', () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                energy: certificateEnergy - 1
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NOT_ENOUGH_ENERGY);
        });

        it('should not match demand with lower expected price', () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                price: energyPrice + 1
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.TOO_EXPENSIVE);
        });

        it('should not match demand with difference currency', () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                currency: Currency.EUR
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_CURRENCY);
        });

        it('should not match demand with not compatible asset type', () => {
            const { demand, certificate, producingAsset } = createMatchingMocks({
                producingAssetAssetType: 'Wind'
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = matchableDemand.matchesCertificate(
                certificate,
                producingAsset
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_ASSET_TYPE);
        });
    });
    describe('Supply', () => {
        const supplyEnergy = 1000;
        const energyPrice = 100;
        const currency = Currency.USD;
        const assetType = 'Solar';

        const createMatchingMocks = (options: IMockOptions) => {
            const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
            demandOffChainProperties.targetWhPerPeriod.returns(supplyEnergy);
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

        it('should not match active demand with exceeding power', () => {
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
