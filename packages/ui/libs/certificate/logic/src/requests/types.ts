import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FullCertificationRequestDTO } from '@energyweb/issuer-irec-api-react-query-client';
import {
  TableRowData,
  TableActionData,
  TableComponentProps,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';

export type TUseLogicCertificateRequestsArgs = {
  devices: ComposedPublicDevice[];
  requests: FullCertificationRequestDTO[];
  actions?: TableActionData<FullCertificationRequestDTO['id']>[];
  loading: boolean;
  allFuelTypes: CodeNameDTO[];
};

export type TFormatCertificateRequestsReturnData = TableRowData<
  FullCertificationRequestDTO['id']
>[];

export type TFormatCertificateRequestsData = (
  props: Omit<TUseLogicCertificateRequestsArgs, 'loading'>
) => TFormatCertificateRequestsReturnData;

export type TUseLogicCertificateRequests = (
  props: TUseLogicCertificateRequestsArgs
) => TableComponentProps<FullCertificationRequestDTO['id']>;