import { Box } from '@material-ui/core';
import React from 'react';
import {
  CardTableContent,
  CardTableTotalColumn,
  CardTableVerticalHeaders,
} from '../../components';
import { useCardsTableEffects } from './CardsTable.effects';
import { TCardsTable } from './CardsTable.types';

export const CardsTable: TCardsTable = ({
  verticalHeaders,
  verticalHeadersTableCellProps,
  verticalHeadersTableHeadCellProps,
  verticalHeadersTableProps,
  totalColumnHeader,
  totalColumnItems,
  totalTableCellContentWrapperProps,
  totalTableCellProps,
  totalTableHeadCellProps,
  totalTableProps,
  headers,
  rows,
  tableWrapperProps,
  tableProps,
  tableHeadCellProps,
  tableCellProps,
  tableCellContentWrapperProps,
}) => {
  const { orderedRows } = useCardsTableEffects(verticalHeaders, rows);
  return (
    <Box display="flex">
      <CardTableVerticalHeaders
        verticalHeaders={verticalHeaders}
        tableProps={verticalHeadersTableProps}
        tableHeadCellProps={verticalHeadersTableHeadCellProps}
        tableCellProps={verticalHeadersTableCellProps}
      />

      <CardTableContent
        headers={headers}
        rows={orderedRows}
        tableWrapperProps={tableWrapperProps}
        tableProps={tableProps}
        tableHeadCellProps={tableHeadCellProps}
        tableCellProps={tableCellProps}
        cellContentWrapperProps={tableCellContentWrapperProps}
      />

      {totalColumnHeader && totalColumnItems && (
        <CardTableTotalColumn
          header={totalColumnHeader}
          totalItems={totalColumnItems}
          tableProps={totalTableProps}
          tableHeadCellProps={totalTableHeadCellProps}
          cellContentWrapperProps={totalTableCellContentWrapperProps}
          tableCellProps={totalTableCellProps}
        />
      )}
    </Box>
  );
};
