import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useRetireCertificateHandler,
  useCompanyBeneficiaries,
} from '@energyweb/origin-ui-certificate-data';
import {
  useBeneficiaryFormLogic,
  useRetireActionLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { Dayjs } from 'dayjs';
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

  const { companyBeneficiaries, areCompanyBeneficiariesLoading } =
    useCompanyBeneficiaries();

  const { initialValues, fields, validationSchema } = useBeneficiaryFormLogic({
    allBeneficiaries: companyBeneficiaries,
  });

  const { register, control, watch, formState } = useForm({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const { isValid, isDirty, errors } = formState;

  const { beneficiary, startDate, endDate, purpose } = watch();

  const selectedBeneficiary = useMemo(
    () => companyBeneficiaries?.find((b) => b.id === beneficiary),
    [companyBeneficiaries, beneficiary]
  );

  const { retireHandler, isLoading: isHandlerLoading } =
    useRetireCertificateHandler(
      selectedBeneficiary,
      resetIds,
      startDate as Dayjs,
      endDate as Dayjs,
      purpose,
      setTxPending
    );

  const actionLogic = useRetireActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  const isLoading = areCompanyBeneficiariesLoading || isHandlerLoading;
  const buttonDisabled = !isDirty || !isValid;

  const selectDisabled = fields[0].options?.length === 0;

  return {
    ...actionLogic,
    retireHandler,
    isLoading,
    buttonDisabled,
    fields,
    register,
    control,
    errors,
    selectDisabled,
  };
};
