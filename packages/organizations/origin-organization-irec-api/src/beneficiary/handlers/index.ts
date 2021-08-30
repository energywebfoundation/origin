import { AddOrganizationBeneficiaryHandler } from './add-organization-beneficiary.handler';
import { CreateOrganizationBeneficiaryHandler } from './create-organization-beneficiary.handler';
import { CreateLocalBeneficiaryHandler } from './create-local-beneficiary.handler';
import { GetBeneficiaryHandler } from './get-beneficiary.handler';
import { GetBeneficiariesHandler } from './get-beneficiaries.handler';
import { RemoveOrganizationBeneficiaryHandler } from './remove-organization-beneficiary.handler';

export const BeneficiaryHandlers = [
    AddOrganizationBeneficiaryHandler,
    CreateOrganizationBeneficiaryHandler,
    CreateLocalBeneficiaryHandler,
    GetBeneficiaryHandler,
    GetBeneficiariesHandler,
    RemoveOrganizationBeneficiaryHandler
];
