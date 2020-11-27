export enum TimeFrame {
    Yearly = 'Yearly',
    Monthly = 'Monthly',
    Daily = 'Daily',
    Weekly = 'Weekly',
    Hourly = 'Hourly',
    HalfHourly = 'HalfHourly'
}

export enum Unit {
    kW = 1e3,
    kWh = 1e3,
    MW = 1e6,
    MWh = 1e6,
    GW = 1e9,
    GWh = 1e9
}

export enum DemandStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    ARCHIVED = 'ARCHIVED'
}
