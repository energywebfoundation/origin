import { Table, Typography, TypographyProps } from '@material-ui/core';
import React, { useCallback } from 'react';
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
import { usePaginateData } from './usePaginateData';
import { useStyles } from './TableComponent.styles';

export const TABLE_COMPONENT__DEFAULT_PAGE_SIZE = 5;

export interface TableComponentProps<Id> {
  loading: boolean;
  data: TableRowData<Id>[];
  header: TableHeaderData;
  totalPages?: number;
  tableTitle?: string;
  tableTitleProps?: TypographyProps;
  pageSize?: number;
}

export const TableComponent: TTableComponent = ({
  data = [],
  header,
  tableTitle,
  tableTitleProps,
  pageSize = TABLE_COMPONENT__DEFAULT_PAGE_SIZE,
  totalPages,
  loading,
}) => {
  const { activePage, setActivePage, paginatedData } = usePaginateData(
    data,
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
    </div>
  );
};
