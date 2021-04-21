import { TableBody } from '@material-ui/core';
import React, { FC } from 'react';
import { TableHeaderData, TableRowData } from '../../../containers';
import { TableComponentRow } from '../TableComponentRow/TableComponentRow';

interface TableComponentBodyProps {
  allRows: TableRowData[];
  headerData: TableHeaderData;
}

export const TableComponentBody: FC<TableComponentBodyProps> = ({
  allRows,
  headerData,
}) => {
  return (
    <TableBody>
      {allRows.map((row) => (
        <TableComponentRow key={row.id} row={row} headerData={headerData} />
      ))}
    </TableBody>
  );
};
