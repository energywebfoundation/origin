import { Table, Typography, TypographyProps } from '@material-ui/core';
import React, { useCallback, useMemo, useState } from 'react';
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
import { useImmer } from 'use-immer';
import {
  TABLE_COMPONENT__DEFAULT_PAGE_SIZE,
  usePaginateData,
} from './hooks/usePaginateData';

export interface ITableSortConfig<TColumnConfig> {
  sortableColumns: {
    [columnName in keyof TColumnConfig]?: {
      sortFunction?: <T = TColumnConfig[columnName]>(a: T, b: T) => boolean;
      sortOrder?: 'ASC' | 'DESC';
    };
  };
}

export interface TableComponentProps<Id, TColumnsColumnConfig = {}> {
  loading: boolean;
  data: TableRowData<Id>[];
  header: TableHeaderData;
  totalPages?: number;
  tableTitle?: string;
  tableTitleProps?: TypographyProps;
  pageSize?: number;
  sortConfig?: ITableSortConfig<TColumnsColumnConfig>;
}

export const TableComponent: TTableComponent = ({
  data = [],
  header,
  tableTitle,
  tableTitleProps,
  pageSize = TABLE_COMPONENT__DEFAULT_PAGE_SIZE,
  totalPages,
  loading,
  sortConfig,
}) => {
  const [sortConfigState, setSortConfigState] = useImmer(sortConfig);
  const dataSorted = useSortData<typeof sortConfigState>(data, sortConfigState);
  const { activePage, setActivePage, paginatedData } =
    usePaginateData(dataSorted);
  return (
    <>
      {tableTitle && (
        <Typography gutterBottom {...tableTitleProps}>
          {tableTitle}
        </Typography>
      )}
      <Table size="small" aria-label="a dense table">
        <TableComponentHeader
          sortConfig={sortConfig}
          headerData={header}
          handleSortOrderChange={useCallback((columnName, sortOrder) => {
            setSortConfigState(
              (draft) => (draft.sortableColumns[columnName] = sortOrder)
            );
          }, [])}
        />
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
    </>
  );
};

const useSortData = <T,>(data, sortConfig: T) => {
  const [activeSortColumn, setActiveSortColumn] = useState(null);
  return [];
};
