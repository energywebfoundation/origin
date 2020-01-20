import { ProducingDevice } from '@energyweb/device-registry';
import { Demand, Supply, PurchasableCertificate } from '@energyweb/market';
import { IRECDeviceService, LocationService } from '@energyweb/utils-general';
import moment from 'moment';
import { Validator } from './Validator';
import { MatchingErrorReason } from './MatchingErrorReason';

export class MatchableDemand {
    private deviceService = new IRECDeviceService();

    private locationService = new LocationService();

    constructor(public demand: Demand.IDemand) {}

    public async matchesCertificate(
        certificate: PurchasableCertificate.IPurchasableCertificate,
        producingDevice: ProducingDevice.IProducingDevice
    ) {
        const { offChainProperties } = this.demand;

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
            .validate(
                certificate.price <= offChainProperties.maxPricePerMwh,
                MatchingErrorReason.TOO_EXPENSIVE
            )
            .validate(
                certificate.currency === offChainProperties.currency,
                MatchingErrorReason.NON_MATCHING_CURRENCY
            )
            .validate(
                offChainProperties.deviceType
                    ? this.deviceService.includesDeviceType(
                          producingDevice.offChainProperties.deviceType,
                          offChainProperties.deviceType
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

    public matchesSupply(supply: Supply.ISupply) {
        const supplyPricePerMwh =
            (supply.offChainProperties.price / supply.offChainProperties.availableWh) * 1e6;

        const { offChainProperties } = this.demand;

        return new Validator<MatchingErrorReason>()
            .validate(this.isActive, MatchingErrorReason.NON_ACTIVE_DEMAND)
            .validate(
                supply.offChainProperties.availableWh >= offChainProperties.energyPerTimeFrame,
                MatchingErrorReason.NOT_ENOUGH_ENERGY
            )
            .validate(
                supplyPricePerMwh <= offChainProperties.maxPricePerMwh,
                MatchingErrorReason.TOO_EXPENSIVE
            )
            .result();
    }

    private get isActive() {
        return this.demand.status === Demand.DemandStatus.ACTIVE;
    }

    private matchesVintage(device: ProducingDevice.IProducingDevice) {
        if (!this.demand.offChainProperties.vintage) {
            return true;
        }

        const { operationalSince } = device.offChainProperties;
        const [vintageStart, vintageEnd] = this.demand.offChainProperties.vintage;
        const operationalSinceYear = moment.unix(operationalSince).year();

        return operationalSinceYear >= vintageStart && operationalSinceYear <= vintageEnd;
    }

    private matchesLocation(device: ProducingDevice.IProducingDevice) {
        if (!this.demand.offChainProperties.location) {
            return true;
        }

        try {
            const matchableLocation = `${device.offChainProperties.country};${device.offChainProperties.region};${device.offChainProperties.province}`;

            return this.locationService.matches(
                this.demand.offChainProperties.location,
                matchableLocation
            );
        } catch (e) {
            return false;
        }
    }
}
