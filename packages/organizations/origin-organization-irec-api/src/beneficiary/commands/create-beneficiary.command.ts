import { IPublicOrganization } from '@energyweb/origin-backend-core';

export class CreateBeneficiaryCommand {
    constructor(public readonly organization: IPublicOrganization) {}
}
