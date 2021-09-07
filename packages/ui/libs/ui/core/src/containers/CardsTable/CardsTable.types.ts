import {
  DetailedHTMLProps,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
  ReactNode,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
} from 'react';
import {
  CardTableHeader,
  CardTableItem,
  TTotalItem,
  TVerticalHeader,
} from '../../components';

export interface CardsTableProps<VerticalHeaderId, HeaderId> {
  // vertical headers table props
  verticalHeaders: TVerticalHeader<VerticalHeaderId>[];
  verticalHeadersTableProps?: DetailedHTMLProps<
    TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >;
  verticalHeadersTableHeadCellProps?: DetailedHTMLProps<
    ThHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
  verticalHeadersTableCellProps?: DetailedHTMLProps<
    TdHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
  // total table props
  totalColumnHeader?: ReactNode;
  totalColumnItems?: TTotalItem<VerticalHeaderId>[];
  totalTableProps?: DetailedHTMLProps<
    TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >;
  totalTableHeadCellProps?: DetailedHTMLProps<
    ThHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
  totalTableCellProps?: DetailedHTMLProps<
    TdHTMLAttributes<HTMLTableHeaderCellElement>,
    HTMLTableHeaderCellElement
  >;
  totalTableCellContentWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  // content table props
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
  tableCellContentWrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export type TCardsTable = <VerticalHeaderId, HeaderId>(
  props: PropsWithChildren<CardsTableProps<VerticalHeaderId, HeaderId>>
) => ReactElement;
