import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useClaimCertificateHandler,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-certificate-data';
import {
  useClaimBeneficiaryFormLogic,
  useClaimActionLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTransactionPendingDispatch } from '../../../context';

export const useClaimActionEffects = (
  selectedIds: AccountAssetDTO['asset']['id'][],
  resetIds: () => void
) => {
  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();
  const setTxPending = useTransactionPendingDispatch();

  const { user, isLoading } = useApiUserAndAccount();
  const organization = user?.organization;

  const { initialValues, fields, validationSchema } =
    useClaimBeneficiaryFormLogic();

  const { register, control, watch, formState } = useForm({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const { isValid, isDirty, errors } = formState;
  const { startDate, endDate, purpose } = watch();

  const { claimHandler } = useClaimCertificateHandler(
    exchangeCertificates,
    organization,
    startDate as Dayjs,
    endDate as Dayjs,
    purpose,
    resetIds,
    setTxPending
  );

  const actionLogic = useClaimActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  const buttonDisabled = !isDirty || !isValid;

  return {
    ...actionLogic,
    claimHandler,
    isLoading,
    buttonDisabled,
    fields,
    register,
    control,
    errors,
  };
};
