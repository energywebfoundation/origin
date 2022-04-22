import {
  useCachedBlockchainCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useBlockchainRedeemCertificateHandler,
  useCompanyBeneficiaries,
} from '@energyweb/origin-ui-certificate-data';
import {
  useBeneficiaryFormLogic,
  useBlockchainRedeemActionLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useTransactionPendingDispatch } from '../../../context';

export const useBlockchainRedeemActionEffects = (
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

  const { redeemHandler, isLoading: isHandlerLoading } =
    useBlockchainRedeemCertificateHandler(
      selectedBeneficiary,
      resetIds,
      startDate as Dayjs,
      endDate as Dayjs,
      purpose,
      setTxPending
    );

  const actionLogic = useBlockchainRedeemActionLogic({
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
    redeemHandler,
    isLoading,
    buttonDisabled,
    fields,
    register,
    control,
    errors,
    selectDisabled,
  };
};
