import { IPublicOrganization } from '@energyweb/origin-backend-core';

export interface IBeneficiary {
    id: number;
    irecBeneficiaryId: number;
    organizationId: number;
    active: boolean;
}

export interface IPublicBeneficiary {
    id: number;
    irecBeneficiaryId: number;
    organization: IPublicOrganization;
    active: boolean;
}
