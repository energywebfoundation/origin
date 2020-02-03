import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, PurchasableCertificate, Currency } from '@energyweb/market';
import { Certificate } from '@energyweb/origin';
import { Year, Countries } from '@energyweb/utils-general';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { assert } from 'chai';
import moment from 'moment';

import { IDevice, DemandStatus } from '@energyweb/origin-backend-core';
import { MatchableDemand } from '../../MatchableDemand';
import { MatchingErrorReason } from '../../MatchingErrorReason';

interface IMockOptions {
    status?: DemandStatus;
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
        const energyPrice = 200;
        const currency = 'USD';
        const deviceType = 'Solar';
        const location = [`${country};Central;Nakhon Pathom`];
        const address =
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140';
        const region = 'Central';
        const province = 'Nakhon Pathom';

        const createMatchingMocks = (options: IMockOptions) => {
            const demand = Substitute.for<Demand.IDemandEntity>();
            demand
                .missingEnergyInPeriod(Arg.all())
                .returns(
                    Promise.resolve({ time: 0, value: options.isFilledDemand ? 0 : missingDemand })
                );
            demand.status.returns(options.status || DemandStatus.ACTIVE);
            demand.energyPerTimeFrame.returns(certificateEnergy);
            demand.maxPriceInCentsPerMwh.returns(energyPrice);
            demand.currency.returns(currency);
            demand.deviceType.returns([deviceType]);
            demand.location.returns(options.location || location);
            demand.vintage.returns(options.vintage || null);

            const certificate = Substitute.for<PurchasableCertificate.IPurchasableCertificate>();
            certificate.price.returns(options.price || energyPrice);
            certificate.currency.returns(options.currency || currency);
            certificate.certificate.returns({
                energy: options.energy || certificateEnergy
            } as Certificate.ICertificate);

            const producingDeviceOffChainProperties = Substitute.for<IDevice>();
            producingDeviceOffChainProperties.deviceType.returns(
                options.producingDeviceDeviceType || deviceType
            );
            producingDeviceOffChainProperties.country.returns(
                Countries.find(c => c.name === country).id
            );
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
                status: DemandStatus.ARCHIVED
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
                location: [`${country};Central`]
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
                location: [`${country};Central`, `${country};Central;Nonthaburi`]
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
});
