import { Table, Typography } from '@material-ui/core';
import React, { useCallback } from 'react';
import { TTableComponent } from './TableComponent.types';
import {
  TableComponentHeader,
  TableComponentBody,
  TableComponentFooter,
  TableFilters,
} from '../../components/table';
import { usePaginateData } from './usePaginateData';
import { useStyles } from './TableComponent.styles';
import { useFilterTableData } from './useFilterTableData';

export const TABLE_COMPONENT__DEFAULT_PAGE_SIZE = 5;

export const TableComponent: TTableComponent = ({
  data = [],
  header,
  tableTitle,
  tableTitleProps,
  pageSize = TABLE_COMPONENT__DEFAULT_PAGE_SIZE,
  totalPages,
  tableFilters,
  loading,
  onRowClick,
  getCustomRowClassName,
}) => {
  const { filteredData, filters, setFilters } = useFilterTableData(
    data,
    tableFilters
  );
  const { activePage, setActivePage, paginatedData } = usePaginateData(
    filteredData,
    pageSize
  );
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      {tableTitle && (
        <Typography gutterBottom {...tableTitleProps}>
          {tableTitle}
        </Typography>
      )}
      {tableFilters && tableFilters.length > 0 && (
        <TableFilters filters={filters} setFilters={setFilters} />
      )}
      <Table size="small" aria-label="a dense table">
        <TableComponentHeader headerData={header} />
        <TableComponentBody
          rowData={paginatedData}
          headerData={header}
          pageSize={pageSize}
          loading={loading}
          onRowClick={onRowClick}
          getCustomRowClassName={getCustomRowClassName}
        />
        <TableComponentFooter
          totalRows={filteredData.length}
          currentPage={activePage}
          handlePageChange={useCallback(
            (pageNumber) => {
              setActivePage(pageNumber);
            },
            [setActivePage]
          )}
          pageSize={pageSize}
          totalPages={totalPages || Math.ceil(filteredData.length / pageSize)}
        />
      </Table>
    </div>
  );
};
