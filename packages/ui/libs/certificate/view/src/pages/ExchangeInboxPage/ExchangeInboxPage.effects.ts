import { useApiAllCertificates } from '@energyweb/origin-ui-certificate-data';

export const useExchangeInboxPageEffects = () => {
  const { allCertificates, isLoading } = useApiAllCertificates();

  return { isLoading };
};
