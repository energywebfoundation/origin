import { DeviceStatus } from "./Device";

export type NewEvent = Omit<IEvent, 'timestamp'>;

export interface IEvent {
    type: SupportedEvents;
    data: SupportedEventData;
    timestamp: number;
}

export type DeviceStatusChanged = {
    deviceId: string,
    status: DeviceStatus
};

export type CreatedNewDemand = {
    demandId: number
};

export type DemandUpdated = {
    demandId: number
}

export type DemandPartiallyFilledEvent = {
    demandId: number,
    certificateId: string,
    energy: number,
    blockNumber: number
}

export enum SupportedEvents {
    DEVICE_STATUS_CHANGED = 'DeviceStatusChanged',
    CREATE_NEW_DEMAND = 'CreatedNewDemand',
    DEMAND_UPDATED = 'DemandUpdated',
    DEMAND_PARTIALLY_FILLED = 'DemandPartiallyFilled'
};

export type SupportedEventData = DeviceStatusChanged
    | CreatedNewDemand
    | DemandUpdated
    | DemandPartiallyFilledEvent;
