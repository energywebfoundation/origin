import { useBeneficiaryControllerGetPlatformBeneficiaries } from '@energyweb/origin-organization-irec-api-react-query-client';

export const usePlatformBeneficiaries = () => {
  const {
    data: platformBeneficiaries,
    isLoading,
  } = useBeneficiaryControllerGetPlatformBeneficiaries();

  return { platformBeneficiaries, isLoading };
};
