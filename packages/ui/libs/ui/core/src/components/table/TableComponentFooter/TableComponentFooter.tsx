import { TableFooter, TablePagination, TableRow } from '@material-ui/core';
import React from 'react';
import { FC } from 'react';
import { useTableFooterEffects } from './TableComponentFooter.effects';

interface TableComponentFooterProps {
  totalPages: number;
  pageSize: number;
}

export const TableComponentFooter: FC<TableComponentFooterProps> = ({
  totalPages,
  pageSize,
}) => {
  const { currentPage, setCurrentPage } = useTableFooterEffects();
  return (
    <TableFooter>
      <TableRow>
        <TablePagination
          count={isNaN(totalPages) ? 0 : totalPages}
          rowsPerPage={pageSize}
          page={currentPage - 1}
          onPageChange={(event, zeroIndexBasedPage) => {
            setCurrentPage(zeroIndexBasedPage + 1);
          }}
          rowsPerPageOptions={[]}
        />
      </TableRow>
    </TableFooter>
  );
};
