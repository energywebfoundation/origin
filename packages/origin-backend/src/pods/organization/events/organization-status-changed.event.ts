import { IFullOrganization, OrganizationStatus } from '@energyweb/origin-backend-core';

export class OrganizationStatusChangedEvent {
    constructor(
        public readonly organization: IFullOrganization,
        public readonly status: OrganizationStatus,
        public readonly previousStatus: OrganizationStatus
    ) {}
}
