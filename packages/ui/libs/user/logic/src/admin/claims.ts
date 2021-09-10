import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { TableComponentProps, TableRowData } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { ComposedPublicDevice } from '@energyweb/origin-ui-user-data';
import { formatDate, PowerFormatter } from '@energyweb/origin-ui-utils';

type TUseClaimsTableLogicArgs = {
  certificates: CertificateDTO[];
  allDevices: ComposedPublicDevice[];
  isLoading: boolean;
};
type TUseClaimsTableLogic = (
  args: TUseClaimsTableLogicArgs
) => TableComponentProps<string>;

type TFormatClaims = (
  args: Omit<TUseClaimsTableLogicArgs, 'isLoading'>
) => TableRowData<string>[];

type FormattedClaim = {
  id: string;
  certificateId: CertificateDTO['id'];
  deviceName: string;
  energy: string;
  beneficiary: string;
  fromDate: string;
  toDate: string;
};

const formatClaims: TFormatClaims = ({ certificates, allDevices }) => {
  const formattedClaims: FormattedClaim[] = [];

  certificates?.forEach((certificate) =>
    certificate.claims?.forEach((claim) => {
      formattedClaims.push({
        id: `${certificate.id};${claim.claimData.periodStartDate}`,
        certificateId: certificate.id,
        deviceName: allDevices.find(
          (device) => device.externalRegistryId === certificate.deviceId
        )?.name,
        energy: PowerFormatter.format(parseInt(claim.value), true),
        beneficiary: claim.claimData.beneficiary,
        fromDate: formatDate(claim.claimData.periodStartDate),
        toDate: formatDate(claim.claimData.periodEndDate),
      });
    })
  );

  return formattedClaims;
};

export const useClaimsTableLogic: TUseClaimsTableLogic = ({
  isLoading,
  certificates,
  allDevices,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      certificateId: t('admin.claims.certificateId'),
      deviceName: t('admin.claims.deviceName'),
      energy: t('admin.claims.energy'),
      beneficiary: t('admin.claims.beneficiary'),
      fromDate: t('admin.claims.fromDate'),
      toDate: t('admin.claims.toDate'),
    },
    pageSize: 10,
    loading: isLoading,
    data: formatClaims({ certificates, allDevices }),
  };
};
