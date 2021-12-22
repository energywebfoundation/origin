import { PropsWithChildren, ReactElement, ReactNode, FC } from 'react';
import { TypographyProps } from '@mui/material';

export type TableHeaderData = Record<string, string>;

export type TableActionData<Id> = {
  name: string;
  icon: ReactNode;
  onClick: (rowId: Id) => any;
  loading?: boolean;
};

export type TableRowData<Id> = {
  id: Id;
  actions?: TableActionData<Id>[];
  expandedRowComponent?: FC<{ id: Id }>;
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
  header: TableHeaderData;
  data: TableRowData<Id>[];
  loading?: boolean;
  tableFilters?: TableFilter[];
  tableTitle?: string;
  tableTitleProps?: TypographyProps;
  pageSize?: number;
  onRowClick?: (id: Id) => void | Promise<void>;
  getCustomRowClassName?: (id: Id) => string;
}

export type TTableComponent = <Id>(
  props: PropsWithChildren<TableComponentProps<Id>>
) => ReactElement;
