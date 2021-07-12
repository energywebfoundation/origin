import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedMyDevices,
  useRetireCertificateHandler,
  usePlatformBeneficiaries,
} from '@energyweb/origin-ui-certificate-data';
import {
  useBeneficiariesSelectorLogic,
  useRetireActionLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { useMemo, useState } from 'react';
import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';

export const useRetireActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const myDevices = useCachedMyDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const [selectedBeneficiaryId, setSelectedBeneficiaryId] =
    useState<BeneficiaryDTO['irecBeneficiaryId']>();
  const { platformBeneficiaries, isLoading: areBeneficiariesLoading } =
    usePlatformBeneficiaries();
  const beneficiarySelectorProps = useBeneficiariesSelectorLogic(
    platformBeneficiaries,
    setSelectedBeneficiaryId
  );

  const selectedBeneficiary = useMemo(
    () =>
      platformBeneficiaries?.find(
        (beneficiary) => beneficiary.irecBeneficiaryId === selectedBeneficiaryId
      ),
    [platformBeneficiaries, selectedBeneficiaryId]
  );

  const { retireHandler, isLoading: isHandlerLoading } =
    useRetireCertificateHandler(selectedBeneficiary, resetIds);

  const actionLogic = useRetireActionLogic({
    selectedIds,
    blockchainCertificates,
    myDevices,
    allFuelTypes,
  });

  const isLoading = areBeneficiariesLoading || isHandlerLoading;

  return {
    ...actionLogic,
    retireHandler,
    isLoading,
    beneficiarySelectorProps,
    selectedBeneficiaryId,
  };
};
