import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PowerFormatter,
  EnergyFormatter,
  formatDate,
} from '@energyweb/origin-ui-utils';
import {
  TFormatApprovedCertificatesData,
  TUseApprovedCertificatesLogic,
} from './types';

const formatRequestsData: TFormatApprovedCertificatesData = ({
  devices,
  certificates,
  allFuelTypes,
  downloadFileHandler,
  t,
}) => {
  return certificates.length > 0 && devices.length > 0
    ? certificates.map((certificate) => {
        const status = certificate?.approved
          ? t('certificate.approved.approved')
          : '-';
        const device = devices.find(
          (device) => certificate?.deviceId === device.externalRegistryId
        );

        return {
          id: certificate?.id,
          facility: device?.name,
          location: `${device?.region}, ${device?.subregion}`,
          gridOperator: device?.gridOperator,
          fuelType:
            allFuelTypes?.find((type) => type.code === device?.fuelType)
              ?.name || '',
          capacity: PowerFormatter.format(device?.capacity),
          meterRead: EnergyFormatter.format(certificate?.energy),
          files: certificate?.files?.map((fileId) => (
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
              {formatDate(certificate?.fromTime * 1000)} -{' '}
              {formatDate(certificate?.toTime * 1000)}
            </div>
          ),
          status,
        };
      })
    : [];
};

export const useApprovedCertificatesLogic: TUseApprovedCertificatesLogic = ({
  devices,
  certificates,
  allFuelTypes,
  loading,
  downloadFileHandler,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('certificate.approved.tableTitle'),
    tableTitleProps: { variant: 'h4', gutterBottom: true },
    header: {
      facility: t('certificate.approved.facility'),
      location: t('certificate.approved.location'),
      gridOperator: t('certificate.approved.gridOperator'),
      fuelType: t('certificate.approved.fuelType'),
      capacity: `${t('certificate.approved.capacity')} (${
        PowerFormatter.displayUnit
      })`,
      meterRead: `${t('certificate.approved.meterRead')} (${
        EnergyFormatter.displayUnit
      })`,
      files: t('certificate.approved.files'),
      timeFrame: t('certificate.approved.timeFrame'),
      status: t('certificate.approved.status'),
    },
    pageSize: 10,
    loading: loading,
    data: formatRequestsData({
      devices,
      certificates,
      allFuelTypes,
      downloadFileHandler,
      t,
    }),
  };
};
