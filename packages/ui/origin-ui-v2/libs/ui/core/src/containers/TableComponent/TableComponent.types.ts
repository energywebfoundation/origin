import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { TableComponentProps } from './TableComponent';

export type TableHeaderData = Record<string, string>;

export type TableActionData<Id> = {
  name: string;
  icon: ReactNode;
  onClick: (rowId: Id) => any;
};

export type TableRowData<Id> = {
  id: Id;
  actions?: TableActionData<Id>[];
  [key: string]: any;
};

export type TTableComponent = <Id>(
  props: PropsWithChildren<TableComponentProps<Id>>
) => ReactElement;
