import { IFullOrganization, IUser } from '@energyweb/origin-backend-core';

export class OrganizationRegisteredEvent {
    constructor(public readonly organization: IFullOrganization, public readonly member: IUser) {}
}
