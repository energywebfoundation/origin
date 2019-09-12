import { ProducingAsset } from '@energyweb/asset-registry';
import { Demand } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Currency } from '@energyweb/utils-general';
import { Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';

import { MatchableDemand, MatchingErrorReason } from '../MatchableDemand';

interface IMockOptions {
    status?: Demand.DemandStatus;
    certificateEnergy?: number;
    certificatePrice?: number;
    certificateCurrency?: Currency;
    producingAssetAssetType?: string;
}

describe('MatchableDemand tests', () => {
    const certificateEnergy = 1000;
    const energyPrice = 100;
    const currency = Currency.USD;
    const assetType = 'Solar';

    const createMatchingMocks = (options: IMockOptions) => {
        const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
        demandOffChainProperties.targetWhPerPeriod.returns(certificateEnergy);
        demandOffChainProperties.maxPricePerMwh.returns(energyPrice * 1e6);
        demandOffChainProperties.currency.returns(currency);
        demandOffChainProperties.assetType.returns([assetType]);

        const demand = Substitute.for<Demand.IDemand>();
        demand.status.returns(options.status || Demand.DemandStatus.ACTIVE);
        demand.offChainProperties.returns(demandOffChainProperties);

        const certificate = Substitute.for<Certificate.ICertificate>();
        certificate.acceptedToken.returns(0x0);
        certificate.offChainSettlementOptions.returns({
            price: options.certificatePrice || energyPrice,
            currency: options.certificateCurrency || currency
        });
        certificate.powerInW.returns(options.certificateEnergy || certificateEnergy);

        const producingAssetOffChainProperties = Substitute.for<
            ProducingAsset.IOffChainProperties
        >();
        producingAssetOffChainProperties.assetType.returns(options.producingAssetAssetType || assetType);

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
        const { result, reason } = matchableDemand.matchesCertificate(certificate, producingAsset);

        assert.isFalse(result);
        assert.equal(reason[0], MatchingErrorReason.NON_ACTIVE_DEMAND);
    });

    it('should not match active demand with exceeding power', () => {
        const { demand, certificate, producingAsset } = createMatchingMocks({
            certificateEnergy: certificateEnergy - 1
        });

        const matchableDemand = new MatchableDemand(demand);
        const { result, reason } = matchableDemand.matchesCertificate(certificate, producingAsset);

        assert.isFalse(result);
        assert.equal(reason[0], MatchingErrorReason.NOT_ENOUGH_ENERGY);
    });

    it('should not match demand with lower expected price', () => {
        const { demand, certificate, producingAsset } = createMatchingMocks({
            certificatePrice: energyPrice * 1e6
        });

        const matchableDemand = new MatchableDemand(demand);
        const { result, reason } = matchableDemand.matchesCertificate(certificate, producingAsset);

        assert.isFalse(result);
        assert.equal(reason[0], MatchingErrorReason.TOO_EXPENSIVE);
    });

    it('should not match demand with difference currency', () => {
        const { demand, certificate, producingAsset } = createMatchingMocks({
            certificateCurrency: Currency.EUR
        });

        const matchableDemand = new MatchableDemand(demand);
        const { result, reason } = matchableDemand.matchesCertificate(certificate, producingAsset);

        assert.isFalse(result);
        assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_CURRENCY);
    });

    it('should not match demand with not compatible asset type', () => {
      const { demand, certificate, producingAsset } = createMatchingMocks({
          producingAssetAssetType: 'Wind'
      });

      const matchableDemand = new MatchableDemand(demand);
      const { result, reason } = matchableDemand.matchesCertificate(certificate, producingAsset);

      assert.isFalse(result);
      assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_ASSET_TYPE);
  });
});
