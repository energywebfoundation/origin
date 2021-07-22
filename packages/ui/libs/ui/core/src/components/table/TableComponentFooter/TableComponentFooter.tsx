import { TableFooter, TablePagination, TableRow } from '@material-ui/core';
import React, { memo } from 'react';
import { FC } from 'react';

interface TableComponentFooterProps {
  totalPages?: number;
  pageSize: number;
  handlePageChange: (currentPage: number) => void;
  currentPage: number;
  rowsPerPageOptions?: Array<number>;
  totalRows: number;
}

export const TableComponentFooter: FC<TableComponentFooterProps> = memo(
  ({
    pageSize,
    currentPage,
    handlePageChange,
    totalRows,
    rowsPerPageOptions = [],
  }) => {
    return (
      <TableFooter>
        <TableRow>
          <TablePagination
            count={totalRows}
            rowsPerPage={pageSize}
            page={currentPage}
            showFirstButton={true}
            onPageChange={(event, zeroIndexBasedPage) => {
              handlePageChange(zeroIndexBasedPage);
            }}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        </TableRow>
      </TableFooter>
    );
  }
);

TableComponentFooter.displayName = 'TableComponentFooter';
