import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FullCertificationRequestDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { TableRowData, TableComponentProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';
import { TFunction } from 'i18next';

export type TUseApprovedCertificatesLogicArgs = {
  devices: ComposedPublicDevice[];
  certificates: FullCertificationRequestDTO[];
  allFuelTypes: CodeNameDTO[];
  loading: boolean;
  downloadFileHandler: (id: string, name: string) => Promise<void>;
};

export type TFormatApprovedCertificatesReturnData = TableRowData<
  FullCertificationRequestDTO['id']
>[];

export type TFormatApprovedCertificatesData = (
  props: Omit<TUseApprovedCertificatesLogicArgs, 'loading'> & { t: TFunction }
) => TFormatApprovedCertificatesReturnData;

export type TUseApprovedCertificatesLogic = (
  props: TUseApprovedCertificatesLogicArgs
) => TableComponentProps<FullCertificationRequestDTO['id']>;
