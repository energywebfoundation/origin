import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { TableRowData, TableComponentProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';

export type TUseLogicClaimsReportArgs = {
  devices: ComposedPublicDevice[];
  certificates: CertificateDTO[];
  allFuelTypes: CodeNameDTO[];
  loading: boolean;
};

export type TFormatClaimsReportReturnData = TableRowData<
  CertificateDTO['id']
>[];

export type TFormatClaimsReportData = (
  props: Omit<TUseLogicClaimsReportArgs, 'loading'>
) => TFormatClaimsReportReturnData;

export type TUseLogicClaimsReport = (
  props: TUseLogicClaimsReportArgs
) => TableComponentProps<CertificateDTO['id']>;
