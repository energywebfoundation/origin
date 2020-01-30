import { DeviceStatus } from "@energyweb/origin-backend-core";

export type DeviceStatusChanged = {
    deviceId: string,
    status: DeviceStatus
};

export type createdNewDemand = {
    demandId: number
};

export type DemandUpdated = {
    demandId: number
}

export type DemandPartiallyFilled = {
    demandId: number,
    certificateId: string,
    energy: number
}

export enum SupportedEvents {
    DEVICE_STATUS_CHANGED = 'DeviceStatusChanged',
    CREATE_NEW_DEMAND = 'createdNewDemand',
    DEMAND_UPDATED = 'DemandUpdated',
    DEMAND_PARTIALLY_FILLED = 'DemandPartiallyFilled'
};

export type SupportedEventType = DeviceStatusChanged
    | createdNewDemand
    | DemandUpdated
    | DemandPartiallyFilled;
