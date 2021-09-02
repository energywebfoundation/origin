import { useAllFuelTypes } from '@energyweb/origin-ui-certificate-data';

export const useCertificatesImportPageEffects = () => {
  const { allTypes: allFuelTypes, isLoading } = useAllFuelTypes();
  return { isLoading, allFuelTypes };
};
