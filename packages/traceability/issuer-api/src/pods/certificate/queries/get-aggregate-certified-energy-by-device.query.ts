export class GetAggregateCertifiedEnergyByDeviceIdQuery {
    constructor(
        public readonly deviceId: string,
        public readonly startDate: number,
        public readonly endDate: number
    ) {}
}
