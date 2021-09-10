import { FullOrganizationInfoDTO } from '@energyweb/origin-backend-react-query-client';
import {
  TableActionData,
  TableComponentProps,
  TableRowData,
} from '@energyweb/origin-ui-core';

export type TUseAllOrganizationsTableArgs = {
  allOrganizations: FullOrganizationInfoDTO[];
  actions: TableActionData<FullOrganizationInfoDTO['id']>[];
  isLoading: boolean;
};

export type TFormatAllOrgs = (
  props: Omit<TUseAllOrganizationsTableArgs, 'isLoading'>
) => TableRowData<FullOrganizationInfoDTO['id']>[];

export type TUseAllOrganizationsTableLogic = (
  props: TUseAllOrganizationsTableArgs
) => TableComponentProps<FullOrganizationInfoDTO['id']>;
