import { TableRow } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { TableRowData, TableHeaderData } from '../../../containers';
import { TableComponentActions } from '../TableComponentActions';
import { TableComponentCell } from '../TableComponentCell';

interface TableComponentRowProps<Id> {
  row: TableRowData<Id>;
  headerData: TableHeaderData;
}

export type TTableComponentRow = <Id>(
  props: PropsWithChildren<TableComponentRowProps<Id>>
) => ReactElement;

export const TableComponentRow: TTableComponentRow = ({ row, headerData }) => {
  const headerKeys = Object.keys(headerData);
  return (
    <TableRow>
      {headerKeys.map((key) =>
        key === 'actions' ? (
          <TableComponentActions
            key={key + row.id.toString()}
            id={row.id}
            actions={row.actions}
          />
        ) : (
          <TableComponentCell
            key={key + row.id.toString()}
            cellData={row[key]}
          />
        )
      )}
    </TableRow>
  );
};
