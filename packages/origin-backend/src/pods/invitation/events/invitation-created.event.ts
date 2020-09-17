import { IPublicOrganization } from '@energyweb/origin-backend-core';

export class InvitationCreatedEvent {
    constructor(public readonly organization: IPublicOrganization, public readonly email: string) {}
}
