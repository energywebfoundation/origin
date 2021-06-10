import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { TableComponentProps } from './TableComponent';

export type TableColumnConfig<RowDataConfigType> = {
  [k in keyof Omit<RowDataConfigType, 'id'>]:
    | TableTranslateKeyWithContextObjectAndFormatter
    | TableTranslateKey;
};
export type TableFormatterFunction = (string) => string;
export type TableFormatterFunctionWithArguments<
  TableFormatterFunctionArgsTypes = unknown
> = {
  fn: TableFormatterFunction;
  args: Array<TableFormatterFunctionArgsTypes>;
};

export type TableTranslateKey = string;
export type TableTranslateKeyWithContextObjectAndFormatter = [
  string,
  (
    | { translateContext: object; formatter: TableFormatterFunction }
    | { formatter: TableFormatterFunction }
    | { translateContext: object }
  )
];

export type TableHeaderData = Record<
  string,
  TableTranslateKey | TableTranslateKeyWithContextObjectAndFormatter
>;

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
