import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, PurchasableCertificate } from '@energyweb/market';
import { IRECDeviceService, LocationService } from '@energyweb/utils-general';
import moment from 'moment';
import { DemandStatus } from '@energyweb/origin-backend-core';
import { Validator } from './Validator';
import { MatchingErrorReason } from './MatchingErrorReason';

export class MatchableDemand {
    private deviceService = new IRECDeviceService();

    private locationService = new LocationService();

    constructor(public demand: Demand.IDemandEntity) {}

    public async matchesCertificate(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        producingDevice: ProducingDevice.IProducingDevice
    ) {
        const { deviceType, maxPriceInCentsPerMwh, currency } = this.demand;

        const missingEnergyInCurrentPeriod = await this.demand.missingEnergyInPeriod(
            moment().unix()
        );

        return new Validator<MatchingErrorReason>()
            .validate(this.isActive, MatchingErrorReason.NON_ACTIVE_DEMAND)
            .validate(missingEnergyInCurrentPeriod !== undefined, MatchingErrorReason.OUT_OF_RANGE)
            .validate(
                missingEnergyInCurrentPeriod && missingEnergyInCurrentPeriod.value > 0,
                MatchingErrorReason.PERIOD_ALREADY_FILLED
            )
            .validate(certificate.price <= maxPriceInCentsPerMwh, MatchingErrorReason.TOO_EXPENSIVE)
            .validate(certificate.currency === currency, MatchingErrorReason.NON_MATCHING_CURRENCY)
            .validate(
                deviceType
                    ? this.deviceService.includesDeviceType(
                          producingDevice.offChainProperties.deviceType,
                          deviceType
                      )
                    : true,
                MatchingErrorReason.NON_MATCHING_DEVICE_TYPE
            )
            .validate(
                this.matchesLocation(producingDevice),
                MatchingErrorReason.NON_MATCHING_LOCATION
            )
            .validate(
                this.matchesVintage(producingDevice),
                MatchingErrorReason.VINTAGE_OUT_OF_RANGE
            )
            .result();
    }

    private get isActive() {
        return this.demand.status === DemandStatus.ACTIVE;
    }

    private matchesVintage(device: ProducingDevice.IProducingDevice) {
        if (!this.demand.vintage) {
            return true;
        }

        const [vintageStart, vintageEnd] = this.demand.vintage;
        const operationalSinceYear = moment.unix(device.offChainProperties.operationalSince).year();

        return operationalSinceYear >= vintageStart && operationalSinceYear <= vintageEnd;
    }

    private matchesLocation(device: ProducingDevice.IProducingDevice) {
        if (!this.demand.location) {
            return true;
        }

        try {
            const matchableLocation = `${device.offChainProperties.country};${device.offChainProperties.region};${device.offChainProperties.province}`;

            return this.locationService.matches(this.demand.location, matchableLocation);
        } catch (e) {
            return false;
        }
    }
}
