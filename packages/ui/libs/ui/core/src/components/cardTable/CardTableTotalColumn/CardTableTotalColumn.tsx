import React, {
  ReactNode,
  DetailedHTMLProps,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { useStyles } from './CardTableTotalColumn.styles';

export type TTotalItem<Id> = {
  id: Id;
  component: React.FC<{ id: Id }>;
};

export interface CardTableTotalColumnProps<Id> {
  header: ReactNode;
  totalItems: TTotalItem<Id>[];
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
  cellContentWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export type TCardTableTotalColumn = <Id>(
  props: PropsWithChildren<CardTableTotalColumnProps<Id>>
) => ReactElement;

export const CardTableTotalColumn: TCardTableTotalColumn = ({
  header,
  totalItems,
  tableProps,
  tableHeadCellProps,
  tableCellProps,
  cellContentWrapperProps,
}) => {
  const classes = useStyles();
  const { className: tableClass, ...restTableProps } = tableProps || {};
  const { className: tableHeadCellClass, ...restTableHeadProps } =
    tableHeadCellProps || {};
  const { className: cellContentWrapperClass, ...restCellContentWrapperProps } =
    cellContentWrapperProps || {};
  const { className: tableCellClass, ...restTableCellProps } =
    tableCellProps || {};
  return (
    <table className={`${classes.table} ${tableClass}`} {...restTableProps}>
      <thead>
        <tr>
          <th
            className={`${classes.tableHeadCell} ${tableHeadCellClass}`}
            {...restTableHeadProps}
          >
            <div
              className={`${classes.totalCellWrapper} ${cellContentWrapperClass}`}
              {...restCellContentWrapperProps}
            >
              {header}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {totalItems.map((item) => {
          const { component: Component } = item;
          return (
            <tr key={`total-column-${item.id}`}>
              <td
                className={`${classes.tableCell} ${tableCellClass}`}
                {...restTableCellProps}
              >
                <div
                  className={`${classes.totalCellWrapper} ${cellContentWrapperClass}`}
                  {...restCellContentWrapperProps}
                >
                  {Component ? <Component id={item.id} /> : null}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
