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
  BeneficiaryFormValues,
} from '@energyweb/origin-ui-certificate-logic';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useTransactionPendingDispatch } from '../../../context';

export const useRetireActionEffects = (
  selectedIds: CertificateDTO['id'][],
  resetIds: () => void
) => {
  const blockchainCertificates = useCachedBlockchainCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const setTxPending = useTransactionPendingDispatch();

  const { platformBeneficiaries, isLoading: areBeneficiariesLoading } =
    usePlatformBeneficiaries();

  const { initialValues, fields, validationSchema } = useBeneficiaryFormLogic({
    allBeneficiaries: platformBeneficiaries,
  });

  const { register, control, watch, formState } =
    useForm<BeneficiaryFormValues>({
      defaultValues: initialValues,
      mode: 'onChange',
      resolver: yupResolver(validationSchema),
    });
  const { isValid, isDirty, errors } = formState;

  const { beneficiary, startDate, endDate, purpose } = watch();

  const selectedBeneficiary = useMemo(
    () =>
      platformBeneficiaries?.find((b) => b.irecBeneficiaryId === beneficiary),
    [platformBeneficiaries, beneficiary]
  );

  const { retireHandler, isLoading: isHandlerLoading } =
    useRetireCertificateHandler(
      selectedBeneficiary,
      resetIds,
      startDate,
      endDate,
      purpose,
      setTxPending
    );

  const actionLogic = useRetireActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  const isLoading = areBeneficiariesLoading || isHandlerLoading;
  const buttonDisabled = !isDirty || !isValid;

  return {
    ...actionLogic,
    retireHandler,
    isLoading,
    buttonDisabled,
    fields,
    register,
    control,
    errors,
  };
};
