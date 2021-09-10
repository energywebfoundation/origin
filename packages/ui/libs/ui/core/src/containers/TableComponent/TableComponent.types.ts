import { PropsWithChildren, ReactElement, ReactNode, FC } from 'react';
import { TypographyProps } from '@material-ui/core';

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

export type TableFilter = {
  name: string;
  filterFunc: (cellData: any, filterValue: any) => boolean;
  component: FC<{
    value: any;
    handleFilterChange: (newValue: any) => void;
    [key: string]: any;
  }>;
  value?: any;
};

export interface TableComponentProps<Id> {
  loading: boolean;
  data: TableRowData<Id>[];
  header: TableHeaderData;
  tableFilters?: TableFilter[];
  totalPages?: number;
  tableTitle?: string;
  tableTitleProps?: TypographyProps;
  pageSize?: number;
  onRowClick?: (id: Id) => void;
  getCustomRowClassName?: (id: Id) => string;
}

export type TTableComponent = <Id>(
  props: PropsWithChildren<TableComponentProps<Id>>
) => ReactElement;
