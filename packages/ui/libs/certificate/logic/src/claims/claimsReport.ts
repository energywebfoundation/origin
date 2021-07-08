import { useTranslation } from 'react-i18next';
import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import {
  TUseLogicClaimsReport,
  TFormatClaimsReportData,
  TFormatClaimsReportReturnData,
} from './types';

const formatClaimsReportData: TFormatClaimsReportData = ({
  devices,
  certificates,
  allFuelTypes,
}) => {
  return certificates.length > 0 && devices.length > 0
    ? certificates.map((certificate) => {
        const compliance = 'I-REC';
        const device = devices.find(
          (device) => certificate?.deviceId === device.externalRegistryId
        );

        return {
          id: certificate?.id,
          fuelType:
            allFuelTypes?.find((type) => type.code === device?.fuelType)
              ?.name || '',
          vintageCOD: formatDate(device?.commissioningDate),
          location: `${device?.region}, ${device?.subregion}`,
          gridOperator: device?.gridOperator,
          compliance,
          certificationDate: formatDate(certificate?.creationTime),
          certifiedEnergy: EnergyFormatter.getValueInDisplayUnit(
            certificate?.energy?.claimedVolume
          ).toString(),
        };
      })
    : ([] as TFormatClaimsReportReturnData);
};

export const useLogicClaimsReport: TUseLogicClaimsReport = ({
  devices,
  certificates,
  allFuelTypes,
  loading,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      fuelType: t('certificate.claimsReport.fuelType'),
      vintageCOD: t('certificate.claimsReport.vintageCOD'),
      location: t('certificate.claimsReport.location'),
      gridOperator: t('certificate.claimsReport.gridOperator'),
      compliance: t('certificate.claimsReport.compliance'),
      certificationDate: t('certificate.claimsReport.certificationDate'),
      certifiedEnergy: `${t('certificate.claimsReport.certifiedEnergy')} (${
        EnergyFormatter.displayUnit
      })`,
    },
    pageSize: 10,
    loading,
    data: formatClaimsReportData({ devices, certificates, allFuelTypes }),
  };
};
