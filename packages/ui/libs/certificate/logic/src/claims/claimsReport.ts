import { useTranslation } from 'react-i18next';
import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import {
  TUseLogicClaimsReport,
  TFormatClaimsReportData,
  TFormatClaimsReportReturnData,
} from './types';

const formatClaimsReportData: TFormatClaimsReportData = ({
  devices,
  blockchainCertificates,
  claimedCertificates,
  allFuelTypes,
}) => {
  return claimedCertificates?.length > 0 && devices.length > 0
    ? claimedCertificates?.map((certificate) => {
        const compliance = 'I-REC';
        const fullCertificateData = blockchainCertificates.find(
          (bc) => bc.id === certificate.id
        );

        const device = devices.find(
          (device) =>
            fullCertificateData?.deviceId === device.externalRegistryId
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
          claimDate: formatDate(certificate?.claimData.fromDate),
          certifiedEnergy: EnergyFormatter.getValueInDisplayUnit(
            certificate.value
          ).toString(),
        };
      })
    : ([] as TFormatClaimsReportReturnData);
};

export const useLogicClaimsReport: TUseLogicClaimsReport = ({
  devices,
  blockchainCertificates,
  claimedCertificates,
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
      claimDate: t('certificate.claimsReport.claimDate'),
      certifiedEnergy: `${t('certificate.claimsReport.certifiedEnergy')} (${
        EnergyFormatter.displayUnit
      })`,
    },
    pageSize: 10,
    loading,
    data: formatClaimsReportData({
      devices,
      blockchainCertificates,
      claimedCertificates,
      allFuelTypes,
    }),
  };
};
