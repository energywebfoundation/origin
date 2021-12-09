import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';

export const prepareBeneficiariesOptions = (
  beneficiaries: BeneficiaryDTO[]
) => {
  return beneficiaries?.map((beneficiary) => ({
    label: beneficiary.name,
    value: beneficiary.id,
  }));
};
