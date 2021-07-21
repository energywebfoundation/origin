import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PowerFormatter,
  EnergyFormatter,
  formatDate,
} from '@energyweb/origin-ui-utils';
import { downloadFileHandler } from '@energyweb/origin-ui-certificate-data';
import {
  TFormatPendingCertificatesData,
  TUsePendingCertificatesLogic,
} from './types';

const formatRequestsData: TFormatPendingCertificatesData = ({
  devices,
  requests,
  actions,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  return requests.length > 0 && devices.length > 0
    ? requests.map((request) => {
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
            allFuelTypes?.find((type) => type.code === device?.fuelType)
              ?.name || '',
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
          actions,
        };
      })
    : [];
};

export const usePendingCertificatsLogic: TUsePendingCertificatesLogic = ({
  devices,
  requests,
  allFuelTypes,
  actions,
  loading,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('certificate.pending.tableTitle'),
    tableTitleProps: { variant: 'h4', gutterBottom: true },
    header: {
      facility: t('certificate.pending.facility'),
      location: t('certificate.pending.location'),
      gridOperator: t('certificate.pending.gridOperator'),
      fuelType: t('certificate.pending.fuelType'),
      capacity: `${t('certificate.pending.capacity')} (${
        PowerFormatter.displayUnit
      })`,
      meterRead: `${t('certificate.pending.meterRead')} (${
        EnergyFormatter.displayUnit
      })`,
      files: t('certificate.pending.files'),
      timeFrame: t('certificate.pending.timeFrame'),
      status: t('certificate.pending.status'),
      actions: '',
    },
    pageSize: 10,
    loading: loading,
    data: formatRequestsData({
      devices,
      requests,
      actions,
      allFuelTypes,
    }),
  };
};
