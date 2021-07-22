import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clear } from '@material-ui/icons';
import {
  useApiPendingRequests,
  useApiHandlersForPendingRequests,
  useApiAllDevices,
  useAllFuelTypes,
} from '@energyweb/origin-ui-certificate-data';
import { usePendingCertificatsLogic } from '@energyweb/origin-ui-certificate-logic';

export const usePendingPageEffects = () => {
  const { t } = useTranslation();

  const { allDevices: devices, isLoading: areDevicesLoading } =
    useApiAllDevices();

  const { allTypes: allFuelTypes, isLoading: isFuelTypesloading } =
    useAllFuelTypes();

  const { pendingRequests: requests, isLoading: allRequestsLoading } =
    useApiPendingRequests();

  const { approveHandler, rejectHandler } = useApiHandlersForPendingRequests();

  const loading = isFuelTypesloading || areDevicesLoading || allRequestsLoading;

  const actions = [
    {
      icon: <Check />,
      name: t('certificate.pending.approve'),
      onClick: approveHandler,
    },
    {
      icon: <Clear />,
      name: t('certificate.pending.reject'),
      onClick: rejectHandler,
    },
  ];

  const tableData = usePendingCertificatsLogic({
    devices,
    requests,
    actions,
    loading,
    allFuelTypes,
  });

  return {
    tableData,
  };
};
