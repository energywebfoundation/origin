import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useRetireCertificateHandler,
  usePlatformBeneficiaries,
} from '@energyweb/origin-ui-certificate-data';
import {
  useBeneficiaryFormLogic,
  useRetireActionLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { useMemo, useState } from 'react';
import { BeneficiaryDTO } from '@energyweb/origin-organization-irec-api-react-query-client';

export const useRetireActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const [selectedBeneficiaryId, setSelectedBeneficiaryId] =
    useState<BeneficiaryDTO['irecBeneficiaryId']>();
  const { platformBeneficiaries, isLoading: areBeneficiariesLoading } =
    usePlatformBeneficiaries();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');

  const { selectorProps, startPickerProps, endPickerProps, purposeInputProps } =
    useBeneficiaryFormLogic({
      allBeneficiaries: platformBeneficiaries,
      setSelectedBeneficiary: setSelectedBeneficiaryId,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      purpose,
      setPurpose,
    });

  const selectedBeneficiary = useMemo(
    () =>
      platformBeneficiaries?.find(
        (beneficiary) => beneficiary.irecBeneficiaryId === selectedBeneficiaryId
      ),
    [platformBeneficiaries, selectedBeneficiaryId]
  );

  const { retireHandler, isLoading: isHandlerLoading } =
    useRetireCertificateHandler(
      selectedBeneficiary,
      resetIds,
      startDate,
      endDate,
      purpose
    );

  const actionLogic = useRetireActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  const isLoading = areBeneficiariesLoading || isHandlerLoading;
  const buttonDisabled =
    !selectedBeneficiaryId || !startDate || !endDate || !purpose;

  return {
    ...actionLogic,
    retireHandler,
    isLoading,
    selectorProps,
    startPickerProps,
    endPickerProps,
    purposeInputProps,
    selectedBeneficiaryId,
    buttonDisabled,
  };
};
