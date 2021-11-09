import { TableCell, TableRow } from '@mui/material';
import React, { PropsWithChildren, ReactElement } from 'react';
import { TableRowData, TableHeaderData } from '../../../containers';
import { TableComponentActions } from '../TableComponentActions';
import { TableComponentCell } from '../TableComponentCell';
import { useTableComponentRowEffects } from './TableComponentRow.effects';
import { useStyles } from './TableComponentRow.styles';

export interface TableComponentRowProps<Id> {
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
  const {
    handleClick,
    headerKeys,
    showExpanded,
    ExpandedRow,
    applyHoverStyles,
  } = useTableComponentRowEffects(row, onRowClick, headerData);

  const classes = useStyles();
  const rowClass = `${className} ${applyHoverStyles && classes.hover}`;

  return (
    <>
      <TableRow
        className={rowClass}
        onClick={handleClick}
        hover={applyHoverStyles}
      >
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
      {row.expandedRowComponent && showExpanded && (
        <TableRow>
          <TableCell colSpan={headerKeys.length}>
            <ExpandedRow id={row.id} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
