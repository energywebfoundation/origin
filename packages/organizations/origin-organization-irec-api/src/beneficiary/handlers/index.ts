import { AddOrganizationBeneficiaryHandler } from './add-organization-beneficiary.handler';
import { CreateBeneficiaryHandler } from './create-beneficiary.handler';
import { GetBeneficiaryHandler } from './get-beneficiary.handler';
import { GetBeneficiariesHandler } from './get-beneficiaries.handler';
import { RemoveOrganizationBeneficiaryHandler } from './remove-organization-beneficiary.handler';

export const BeneficiaryHandlers = [
    AddOrganizationBeneficiaryHandler,
    CreateBeneficiaryHandler,
    GetBeneficiaryHandler,
    GetBeneficiariesHandler,
    RemoveOrganizationBeneficiaryHandler
];
