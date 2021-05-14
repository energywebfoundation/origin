import { TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FC } from 'react';
import { TableHeaderData } from '../../../containers';
import { useTranslation } from 'react-i18next';

interface TableComponentHeaderProps {
  headerData: TableHeaderData;
}

export const TableComponentHeader: FC<TableComponentHeaderProps> = ({
  headerData,
}) => {
  const { t } = useTranslation();
  return (
    <TableHead>
      <TableRow>
        {Object.values(headerData).map((headerItem) => (
          <TableCell key={headerItem}>{t(headerItem)}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
