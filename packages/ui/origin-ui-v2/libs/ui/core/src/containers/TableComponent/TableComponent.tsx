import React, { FC } from 'react';
import { Table, TableContainer, Paper } from '@material-ui/core';
import { TableRowData, TableHeaderData } from './TableComponent.types';
import {
  TableComponentHeader,
  TableComponentBody,
  TableComponentFooter,
} from '../../components/table';

export interface TableComponentProps {
  data: TableRowData[];
  header: TableHeaderData;
}

export const TableComponent: FC<TableComponentProps> = ({ data, header }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableComponentHeader headerData={header} />
        <TableComponentBody allRows={data} headerData={header} />
        <TableComponentFooter pageSize={2} totalPages={7} />
      </Table>
    </TableContainer>
  );
};
