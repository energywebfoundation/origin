import { TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FC } from 'react';
import { TableHeaderData } from '../../../containers';

interface TableComponentHeaderProps {
  headerData: TableHeaderData;
}

export const TableComponentHeader: FC<TableComponentHeaderProps> = ({
  headerData,
}) => {
  return (
    <TableHead>
      <TableRow>
        {Object.values(headerData).map((headerItem) => (
          <TableCell key={headerItem}>{headerItem}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
