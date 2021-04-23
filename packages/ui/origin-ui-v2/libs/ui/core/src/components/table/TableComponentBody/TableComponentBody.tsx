import { TableBody } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { TableHeaderData, TableRowData } from '../../../containers';
import { TableComponentRow } from '../TableComponentRow/TableComponentRow';

interface TableComponentBodyProps<Id> {
  allRows: TableRowData<Id>[];
  headerData: TableHeaderData;
}

export type TTableComponentBody = <Id>(
  props: PropsWithChildren<TableComponentBodyProps<Id>>
) => ReactElement;

export const TableComponentBody: TTableComponentBody = ({
  allRows,
  headerData,
}) => {
  return (
    <TableBody>
      {allRows.map((row) => (
        <TableComponentRow
          key={row.id.toString()}
          row={row}
          headerData={headerData}
        />
      ))}
    </TableBody>
  );
};
