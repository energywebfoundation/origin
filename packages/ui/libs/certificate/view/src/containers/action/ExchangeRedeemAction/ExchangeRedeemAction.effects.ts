import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useExchangeRedeemCertificateHandler,
  useCompanyBeneficiaries,
} from '@energyweb/origin-ui-certificate-data';
import {
  useRedeemBeneficiaryFormLogic,
  useExchangeRedeemActionLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTransactionPendingDispatch } from '../../../context';

export const useExchangeRedeemActionEffects = (
  selectedIds: AccountAssetDTO['asset']['id'][],
  resetIds: () => void
) => {
  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const setTxPending = useTransactionPendingDispatch();

  const { companyBeneficiaries, areCompanyBeneficiariesLoading } =
    useCompanyBeneficiaries();

  const { initialValues, fields, validationSchema } =
    useRedeemBeneficiaryFormLogic(companyBeneficiaries);

  const { register, control, watch, formState } = useForm({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const { isValid, isDirty, errors } = formState;
  const { beneficiary, startDate, endDate, purpose } = watch();

  const selectedBeneficiary = useMemo(
    () => companyBeneficiaries?.find((b) => b.id === beneficiary),
    [beneficiary, companyBeneficiaries]
  );

  const { redeemHandler } = useExchangeRedeemCertificateHandler(
    exchangeCertificates,
    selectedBeneficiary,
    startDate as Dayjs,
    endDate as Dayjs,
    purpose,
    resetIds,
    setTxPending
  );

  const actionLogic = useExchangeRedeemActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  const buttonDisabled = !isDirty || !isValid;
  const selectDisabled = fields[0].options?.length === 0;

  return {
    ...actionLogic,
    redeemHandler,
    isLoading: areCompanyBeneficiariesLoading,
    buttonDisabled,
    fields,
    register,
    control,
    errors,
    selectDisabled,
  };
};
