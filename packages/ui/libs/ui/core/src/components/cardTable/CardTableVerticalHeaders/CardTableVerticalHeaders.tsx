import React, {
  DetailedHTMLProps,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { useStyles } from './CardTableVerticalHeaders.styles';

export type TVerticalHeader<Id> = {
  id: Id;
  component: React.FC<{ id: Id }>;
};

export interface CardTableVerticalHeaders<Id> {
  verticalHeaders: TVerticalHeader<Id>[];
  tableProps?: DetailedHTMLProps<
    TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >;
  tableHeadCellProps?: DetailedHTMLProps<
    ThHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
  tableCellProps?: DetailedHTMLProps<
    TdHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
}

export type TCardTableVerticalHeaders = <Id>(
  props: PropsWithChildren<CardTableVerticalHeaders<Id>>
) => ReactElement;

export const CardTableVerticalHeaders: TCardTableVerticalHeaders = ({
  verticalHeaders,
  tableProps,
  tableHeadCellProps,
  tableCellProps,
}) => {
  const classes = useStyles();
  const { className: tableClassName, ...restTableProps } = tableProps || {};
  const { className: tableHeadClassName, ...restTableHeadProps } =
    tableHeadCellProps || {};
  const { className: tableCellClassName, ...restTableCellProps } =
    tableCellProps || {};
  return (
    <table className={`${classes.table} ${tableClassName}`} {...restTableProps}>
      <thead>
        <tr>
          <th
            className={`${classes.tableHeadCell} ${tableHeadClassName}`}
            {...restTableHeadProps}
          />
        </tr>
      </thead>
      <tbody>
        {verticalHeaders.map((header) => {
          const { component: Component } = header;
          return (
            <tr key={`vertical-header-${header.id}`}>
              <td
                className={`${classes.tableCell} ${tableCellClassName}`}
                {...restTableCellProps}
              >
                {Component ? <Component id={header.id} /> : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
