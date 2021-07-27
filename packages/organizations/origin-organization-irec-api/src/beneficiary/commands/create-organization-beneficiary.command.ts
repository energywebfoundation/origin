import { IPublicOrganization } from '@energyweb/origin-backend-core';

export class CreateOrganizationBeneficiaryCommand {
    constructor(public readonly organization: IPublicOrganization) {}
}
