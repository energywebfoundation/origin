import { useBeneficiaryControllerGetCompanyBeneficiaries } from '@energyweb/origin-organization-irec-api-react-query-client';

export const useCompanyBeneficiaries = () => {
  const {
    data: companyBeneficiaries,
    isLoading: areCompanyBeneficiariesLoading,
  } = useBeneficiaryControllerGetCompanyBeneficiaries();

  return { companyBeneficiaries, areCompanyBeneficiariesLoading };
};
