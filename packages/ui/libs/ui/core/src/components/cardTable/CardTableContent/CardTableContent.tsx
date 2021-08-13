import React, {
  DetailedHTMLProps,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { useStyles } from './CardTableContent.styles';

export type CardTableHeader<Id> = {
  id: Id;
  component: React.FC<{ id: Id }>;
};

export type CardTableItem<HeaderId, VerticalHeaderId> = {
  headerId: HeaderId;
  verticalHeaderId: VerticalHeaderId;
  component: React.FC<{
    headerId: HeaderId;
    verticalHeaderId: VerticalHeaderId;
  }>;
};

export interface CardTableContentProps<HeaderId, VerticalHeaderId> {
  headers: CardTableHeader<HeaderId>[];
  rows: CardTableItem<HeaderId, VerticalHeaderId>[][];
  tableWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
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

export type TCardTableContent = <HeaderId, VerticalHeaderId>(
  props: PropsWithChildren<CardTableContentProps<HeaderId, VerticalHeaderId>>
) => ReactElement;

export const CardTableContent: TCardTableContent = ({
  headers,
  rows,
  tableWrapperProps,
  tableProps,
  tableHeadCellProps,
  tableCellProps,
  cellContentWrapperProps,
}) => {
  const classes = useStyles();
  const { className: tableWrapperClass, ...restTableWrapperProps } =
    tableWrapperProps || {};
  const { className: tableClass, ...restTableProps } = tableProps || {};
  const { className: tableHeadCellClass, ...restTableHeadCellProps } =
    tableHeadCellProps || {};
  const { className: cellContentWrapperClass, ...restCellContentWrapperProps } =
    cellContentWrapperProps || {};
  const { className: tableCellClass, ...restTableCellProps } =
    tableCellProps || {};
  return (
    <div
      className={`${classes.tableWrapper} ${tableWrapperClass}`}
      {...restTableWrapperProps}
    >
      <table
        cellSpacing="0"
        className={`${classes.table} ${tableClass}`}
        {...restTableProps}
      >
        <thead>
          <tr>
            {headers.map((header) => {
              const { component: Component } = header;
              return (
                <th
                  className={`${classes.tableHeadCell} ${tableHeadCellClass}`}
                  key={`${header.id}`}
                  {...restTableHeadCellProps}
                >
                  <div
                    className={`${classes.tableCellWrapper} ${cellContentWrapperClass}`}
                    {...restCellContentWrapperProps}
                  >
                    {Component ? <Component id={header.id} /> : null}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`row-${row[0].verticalHeaderId}`}>
              {headers.map((header) => {
                const cellData = row.find((row) => row.headerId === header.id);
                const { component: Component } = cellData;
                return (
                  <td
                    className={`${classes.tableCell} ${tableCellClass}`}
                    key={`cell-${cellData.verticalHeaderId}-${cellData.headerId}`}
                    {...restTableCellProps}
                  >
                    <div
                      className={`${classes.tableCellWrapper} ${cellContentWrapperClass}`}
                      {...restCellContentWrapperProps}
                    >
                      {Component ? (
                        <Component
                          headerId={cellData.headerId}
                          verticalHeaderId={cellData.verticalHeaderId}
                        />
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
