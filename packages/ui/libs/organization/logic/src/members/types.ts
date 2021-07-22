import { User } from '@energyweb/origin-backend-react-query-client';
import {
  TableActionData,
  TableComponentProps,
  TableRowData,
} from '@energyweb/origin-ui-core';
import { TFunction } from 'react-i18next';

export type TUseMembersTableArgs = {
  users: User[];
  actions: TableActionData<User['id']>[];
  loading: boolean;
};

export type TFormatOrgMembers = (
  props: Omit<TUseMembersTableArgs, 'loading'> & {
    t: TFunction<'translation'>;
  }
) => TableRowData<User['id']>[];

export type TUseMembersTableLogic = (
  props: TUseMembersTableArgs
) => TableComponentProps<User['id']>;
