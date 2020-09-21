import { IUser } from '@energyweb/origin-backend-core';

export class OrganizationNameAlreadyTakenEvent {
    constructor(public readonly name: string, public readonly member: IUser) {}
}
