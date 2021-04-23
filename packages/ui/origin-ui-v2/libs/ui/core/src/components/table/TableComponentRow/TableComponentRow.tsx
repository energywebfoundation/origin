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
    <TableRow key={row.id.toString()}>
      {headerKeys.map((key, idx) =>
        key === 'actions' ? (
          <TableComponentActions
            key={key + idx}
            id={row.id}
            actions={row.actions}
          />
        ) : (
          <TableComponentCell key={key + idx} cellData={row[key]} />
        )
      )}
    </TableRow>
  );
};
