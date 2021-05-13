import React from 'react';
import { Table, Typography, TypographyProps } from '@material-ui/core';
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

export interface TableComponentProps<Id> {
  data: TableRowData<Id>[];
  header: TableHeaderData;
  totalPages: number;
  tableTitle?: string;
  tableTitleProps?: TypographyProps;
  pageSize?: number;
}

export const TableComponent: TTableComponent = ({
  data,
  header,
  pageSize,
  tableTitle,
  tableTitleProps,
  totalPages,
}) => {
  return (
    <>
      {tableTitle && (
        <Typography gutterBottom {...tableTitleProps}>
          {tableTitle}
        </Typography>
      )}
      <Table size="small" aria-label="a dense table">
        <TableComponentHeader headerData={header} />
        <TableComponentBody allRows={data} headerData={header} />
        <TableComponentFooter
          pageSize={pageSize ?? 5}
          totalPages={totalPages}
        />
      </Table>
    </>
  );
};
