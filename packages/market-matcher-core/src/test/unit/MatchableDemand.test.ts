import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, PurchasableCertificate, Supply, Currency } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Year } from '@energyweb/utils-general';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';
import moment from 'moment';

import { MatchableDemand } from '../../MatchableDemand';
import { MatchingErrorReason } from '../../MatchingErrorReason';

interface IMockOptions {
    status?: Demand.DemandStatus;
    energy?: number;
    price?: number;
    currency?: Currency;
    producingDeviceDeviceType?: string;
    producingDeviceOperationalSince?: number;
    address?: string;
    isFilledDemand?: boolean;
    location?: string[];
    vintage?: [Year, Year];
    region?: string;
    province?: string;
}

describe('MatchableDemand tests', () => {
    const country = 'Thailand';

    describe('Certificates', () => {
        const missingDemand = 1000;
        const certificateEnergy = 1000;
        const energyPrice = 2;
        const currency = 'USD';
        const deviceType = 'Solar';
        const location = [`${country};Central;Nakhon Pathom`];
        const address =
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140';
        const region = 'Central';
        const province = 'Nakhon Pathom';

        const createMatchingMocks = (options: IMockOptions) => {
            const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
            demandOffChainProperties.energyPerTimeFrame.returns(certificateEnergy);
            demandOffChainProperties.maxPricePerMwh.returns(energyPrice);
            demandOffChainProperties.currency.returns(currency);
            demandOffChainProperties.deviceType.returns([deviceType]);
            demandOffChainProperties.location.returns(options.location || location);
            demandOffChainProperties.vintage.returns(options.vintage || null);

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

            const producingDeviceOffChainProperties = Substitute.for<
                ProducingDevice.IOffChainProperties
            >();
            producingDeviceOffChainProperties.deviceType.returns(
                options.producingDeviceDeviceType || deviceType
            );
            producingDeviceOffChainProperties.country.returns(country);
            producingDeviceOffChainProperties.address.returns(options.address || address);
            producingDeviceOffChainProperties.region.returns(options.region || region);
            producingDeviceOffChainProperties.province.returns(options.province || province);
            producingDeviceOffChainProperties.operationalSince.returns(
                options.producingDeviceOperationalSince || 0
            );

            const producingDevice = Substitute.for<ProducingDevice.IProducingDevice>();
            producingDevice.offChainProperties.returns(producingDeviceOffChainProperties);

            return {
                demand,
                certificate,
                producingDevice
            };
        };

        it('should match certificate', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({});

            const matchableDemand = new MatchableDemand(demand);
            const { result } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isTrue(result);
        });

        it('should not match non active demand', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                status: Demand.DemandStatus.ARCHIVED
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_ACTIVE_DEMAND);
        });

        it('should not match already filled demand', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                isFilledDemand: true
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.PERIOD_ALREADY_FILLED);
        });

        it('should not match demand with lower expected price', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                price: energyPrice + 1
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.TOO_EXPENSIVE);
        });

        it('should not match demand with difference currency', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                currency: 'EUR'
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_CURRENCY);
        });

        it('should not match demand with not compatible device type', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                producingDeviceDeviceType: 'Wind'
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_DEVICE_TYPE);
        });

        it('should not match demand with from different location', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                address: 'Warsaw, Poland',
                region: 'Mazovian',
                province: 'Warsaw'
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_LOCATION);
        });

        it('should match demand with certificate when province is in passed region', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                location: ['Thailand;Central']
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isTrue(result);
        });

        it('should not match demand with certificate when province is not included in location', async () => {
            const { demand, certificate, producingDevice } = createMatchingMocks({
                location: ['Thailand;Central', 'Thailand;Central;Nonthaburi']
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.NON_MATCHING_LOCATION);
        });

        it('should not match demand with certificate when requested vintage is out of device range', async () => {
            const now = moment().unix();
            const { demand, certificate, producingDevice } = createMatchingMocks({
                producingDeviceOperationalSince: now,
                vintage: [2000, 2005]
            });

            const matchableDemand = new MatchableDemand(demand);
            const { result, reason } = await matchableDemand.matchesCertificate(
                certificate,
                producingDevice
            );

            assert.isFalse(result);
            assert.equal(reason[0], MatchingErrorReason.VINTAGE_OUT_OF_RANGE);
        });
    });
    describe('Supply', () => {
        const supplyEnergy = 1000;
        const energyPrice = 100;
        const currency = 'USD';
        const deviceType = 'Solar';

        const createMatchingMocks = (options: IMockOptions) => {
            const demandOffChainProperties = Substitute.for<Demand.IDemandOffChainProperties>();
            demandOffChainProperties.energyPerTimeFrame.returns(supplyEnergy);
            demandOffChainProperties.maxPricePerMwh.returns(energyPrice * 1e6);
            demandOffChainProperties.currency.returns(currency);
            demandOffChainProperties.deviceType.returns([deviceType]);

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
