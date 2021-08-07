import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FullCertificationRequestDTO } from '@energyweb/issuer-irec-api-react-query-client';
import {
  TableRowData,
  TableComponentProps,
  TableActionData,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import { TFunction } from 'i18next';

export type TUsePendingCertificatesLogicArgs = {
  devices: ComposedPublicDevice[];
  requests: FullCertificationRequestDTO[];
  allFuelTypes: CodeNameDTO[];
  actions: TableActionData<FullCertificationRequestDTO['id']>[];
  loading: boolean;
  downloadFileHandler: (id: string, name: string) => Promise<void>;
};

export type TFormatPendingCertificatesReturnData = TableRowData<
  FullCertificationRequestDTO['id']
>[];

export type TFormatPendingCertificatesData = (
  props: Omit<TUsePendingCertificatesLogicArgs, 'loading'> & { t: TFunction }
) => TFormatPendingCertificatesReturnData;

export type TUsePendingCertificatesLogic = (
  props: TUsePendingCertificatesLogicArgs
) => TableComponentProps<FullCertificationRequestDTO['id']>;
