import React, { useCallback, useMemo, useState } from 'react';
import { Table, TableContainer, Paper } from '@material-ui/core';
import {
  TableRowData,
  TableHeaderData,
  TTableComponent,
} from './TableComponent.types';
import {
  TableComponentHeader,
  TableComponentBody,
  TableComponentFooter,
} from '../../components/table';

export const TABLE_COMPONENT__DEFAULT_PAGE_SIZE = 5;

export interface TableComponentProps<Id> {
  loading: boolean;
  data: TableRowData<Id>[];
  header: TableHeaderData;
  totalPages?: number;
  pageSize?: number;
}

export const TableComponent: TTableComponent = ({
  data = [],
  header,
  pageSize = TABLE_COMPONENT__DEFAULT_PAGE_SIZE,
  totalPages,
  loading,
}) => {
  const { activePage, setActivePage, paginatedData } = usePaginateData(data);
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableComponentHeader headerData={header} />
        <TableComponentBody
          rowData={paginatedData}
          headerData={header}
          pageSize={pageSize}
          loading={loading}
        />
        <TableComponentFooter
          totalRows={data.length}
          currentPage={activePage}
          handlePageChange={useCallback(
            (pageNumber) => {
              setActivePage(pageNumber);
            },
            [setActivePage]
          )}
          pageSize={pageSize}
          totalPages={totalPages || Math.ceil(data.length / pageSize)}
        />
      </Table>
    </TableContainer>
  );
};

const usePaginateData = <T,>(
  data: T[],
  pageSize: number = TABLE_COMPONENT__DEFAULT_PAGE_SIZE
) => {
  const [activePage, setActivePage] = useState(0);
  const startIndex = activePage * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    setActivePage,
    activePage,
    paginatedData: useMemo(() => data.slice(startIndex, endIndex), [
      data,
      startIndex,
      endIndex,
    ]),
  };
};
