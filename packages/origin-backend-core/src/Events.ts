import { DeviceStatus } from './Device';
import { OrganizationStatus } from './Organization';

export type NewEvent = Omit<IEvent, 'timestamp'>;

export interface IEvent {
    type: SupportedEvents;
    data: SupportedEventData;
    timestamp: number;
}

export type DeviceStatusChangedEvent = {
    deviceId: string;
    status: DeviceStatus;
    deviceManagersEmails: string[];
};

export type CreatedNewDemand = {
    demandId: number;
};

export type DemandUpdated = {
    demandId: number;
};

export type DemandPartiallyFilledEvent = {
    demandId: number;
    certificateId: string;
    energy: number;
    blockNumber: number;
};

export type OrganizationStatusChangedEvent = {
    organizationId: number;
    organizationEmail: string;
    status: OrganizationStatus;
};

export type OrganizationInvitationEvent = {
    email: string;
    organizationName: string;
};

export type OrganizationRemovedMemberEvent = {
    organizationName: string;
    email: string;
};

export enum SupportedEvents {
    DEVICE_STATUS_CHANGED = 'DeviceStatusChanged',
    CREATE_NEW_DEMAND = 'CreatedNewDemand',
    DEMAND_UPDATED = 'DemandUpdated',
    DEMAND_PARTIALLY_FILLED = 'DemandPartiallyFilled',
    ORGANIZATION_STATUS_CHANGED = 'OrganizationStatusChanged',
    ORGANIZATION_INVITATION = 'OrganizationInvitation',
    ORGANIZATION_REMOVED_MEMBER = 'OrganizationRemovedMember'
}

export type SupportedEventData =
    | DeviceStatusChangedEvent
    | CreatedNewDemand
    | DemandUpdated
    | DemandPartiallyFilledEvent
    | OrganizationStatusChangedEvent
    | OrganizationInvitationEvent
    | OrganizationRemovedMemberEvent;
