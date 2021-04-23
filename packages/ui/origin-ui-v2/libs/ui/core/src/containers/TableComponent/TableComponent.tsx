import React from 'react';
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

export interface TableComponentProps<Id> {
  data: TableRowData<Id>[];
  header: TableHeaderData;
  totalPages: number;
  pageSize?: number;
}

export const TableComponent: TTableComponent = ({
  data,
  header,
  pageSize,
  totalPages,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableComponentHeader headerData={header} />
        <TableComponentBody allRows={data} headerData={header} />
        <TableComponentFooter
          pageSize={pageSize ?? 5}
          totalPages={totalPages}
        />
      </Table>
    </TableContainer>
  );
};
