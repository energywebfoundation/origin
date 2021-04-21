import { TableRow } from '@material-ui/core';
import React from 'react';
import { FC } from 'react';
import { TableRowData, TableHeaderData } from '../../../containers';
import { TableComponentActions } from '../TableComponentActions';
import { TableComponentCell } from '../TableComponentCell';

interface TableComponentRowProps {
  row: TableRowData;
  headerData: TableHeaderData;
}

export const TableComponentRow: FC<TableComponentRowProps> = ({
  row,
  headerData,
}) => {
  const headerKeys = Object.keys(headerData);
  return (
    <TableRow key={row.id}>
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
