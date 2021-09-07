import { TableRow } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { TableRowData, TableHeaderData } from '../../../containers';
import { TableComponentActions } from '../TableComponentActions';
import { TableComponentCell } from '../TableComponentCell';
import { useStyles } from './TableComponentRow.styles';

interface TableComponentRowProps<Id> {
  row: TableRowData<Id>;
  headerData: TableHeaderData;
  onRowClick?: (id: Id) => void;
  className?: string;
}

export type TTableComponentRow = <Id>(
  props: PropsWithChildren<TableComponentRowProps<Id>>
) => ReactElement;

export const TableComponentRow: TTableComponentRow = ({
  row,
  headerData,
  onRowClick,
  className,
}) => {
  const classes = useStyles();
  const headerKeys = Object.keys(headerData);

  const handleClick = () => {
    onRowClick && onRowClick(row.id);
  };

  const rowClass = `${className} ${onRowClick && classes.hover}`;

  return (
    <TableRow className={rowClass} onClick={handleClick}>
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
