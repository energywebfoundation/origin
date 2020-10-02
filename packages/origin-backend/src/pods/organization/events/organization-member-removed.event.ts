import { IFullOrganization, IUser } from '@energyweb/origin-backend-core';

export class OrganizationMemberRemovedEvent {
    constructor(public readonly organization: IFullOrganization, public readonly member: IUser) {}
}
