import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PowerFormatter,
  EnergyFormatter,
  formatDate,
} from '@energyweb/origin-ui-utils';
import {
  TFormatCertificateRequestsData,
  TUseLogicCertificateRequests,
} from './types';

const formatRequestsData: TFormatCertificateRequestsData = ({
  devices,
  requests,
  allFuelTypes,
  exchangeAddress,
  downloadFileHandler,
}) => {
  const { t } = useTranslation();

  const onlyOwnedRequests =
    requests.length > 0 && devices.length > 0
      ? requests.filter((request) => request.owner === exchangeAddress)
      : [];

  return onlyOwnedRequests.map((request) => {
    const status = request?.approved
      ? t('certificate.requests.approved')
      : t('certificate.requests.pending');
    const device = devices.find(
      (device) => request?.deviceId === device.externalRegistryId
    );

    return {
      id: request?.id,
      facility: device?.name,
      location: `${device?.region}, ${device?.subregion}`,
      gridOperator: device?.gridOperator,
      fuelType:
        allFuelTypes?.find((type) => type.code === device?.fuelType)?.name ||
        '',
      capacity: PowerFormatter.format(device?.capacity),
      meterRead: EnergyFormatter.format(request?.energy),
      files: request?.files?.map((fileId) => (
        <div key={fileId}>
          <a
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              downloadFileHandler(fileId, fileId);
            }}
          >
            {fileId}
          </a>
        </div>
      )),
      timeFrame: (
        <div style={{ whiteSpace: 'nowrap' }}>
          {formatDate(request?.fromTime * 1000)} -{' '}
          {formatDate(request?.toTime * 1000)}
        </div>
      ),
      status,
    };
  });
};

export const useCertificateRequestsLogic: TUseLogicCertificateRequests = ({
  devices,
  requests,
  allFuelTypes,
  exchangeAddress,
  loading,
  downloadFileHandler,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      facility: t('certificate.requests.facility'),
      location: t('certificate.requests.location'),
      gridOperator: t('certificate.requests.gridOperator'),
      fuelType: t('certificate.requests.fuelType'),
      capacity: `${t('certificate.requests.capacity')} (${
        PowerFormatter.displayUnit
      })`,
      meterRead: `${t('certificate.requests.meterRead')} (${
        EnergyFormatter.displayUnit
      })`,
      files: t('certificate.requests.files'),
      timeFrame: t('certificate.requests.timeFrame'),
      status: t('certificate.requests.status'),
      actions: '',
    },
    pageSize: 10,
    loading: loading,
    data: formatRequestsData({
      devices,
      exchangeAddress,
      requests,
      allFuelTypes,
      downloadFileHandler,
    }),
  };
};
