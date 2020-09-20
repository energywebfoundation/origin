import { IFullOrganization, IUser, Role } from '@energyweb/origin-backend-core';

export class OrganizationMemberRoleChangedEvent {
    constructor(
        public readonly organization: IFullOrganization,
        public readonly member: IUser,
        public readonly role: Role,
        public readonly previousRole: Role
    ) {}
}
