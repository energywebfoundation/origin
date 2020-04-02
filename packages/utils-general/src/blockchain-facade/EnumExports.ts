export enum TimeFrame {
    yearly,
    monthly,
    daily,
    weekly,
    hourly,
    halfHourly
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
    ACTIVE,
    PAUSED,
    ARCHIVED
}
