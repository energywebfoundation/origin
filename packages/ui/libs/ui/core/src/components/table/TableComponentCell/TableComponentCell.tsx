import { TableCell } from '@mui/material';
import React, { FC } from 'react';

interface TableComponentCellProps {
  cellData: any;
}

export const TableComponentCell: FC<TableComponentCellProps> = ({
  cellData,
}) => {
  return <TableCell>{cellData}</TableCell>;
};
