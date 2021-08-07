import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FullCertificationRequestDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { TableRowData, TableComponentProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import { TFunction } from 'i18next';

export type TUseLogicCertificateRequestsArgs = {
  devices: ComposedPublicDevice[];
  requests: FullCertificationRequestDTO[];
  allFuelTypes: CodeNameDTO[];
  exchangeAddress: string;
  loading: boolean;
  downloadFileHandler: (id: string, name: string) => Promise<void>;
};

export type TFormatCertificateRequestsReturnData = TableRowData<
  FullCertificationRequestDTO['id']
>[];

export type TFormatCertificateRequestsData = (
  props: Omit<TUseLogicCertificateRequestsArgs, 'loading'> & { t: TFunction }
) => TFormatCertificateRequestsReturnData;

export type TUseLogicCertificateRequests = (
  props: TUseLogicCertificateRequestsArgs
) => TableComponentProps<FullCertificationRequestDTO['id']>;
