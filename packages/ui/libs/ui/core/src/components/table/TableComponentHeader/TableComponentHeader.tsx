import { TableCell, TableHead, TableRow } from '@material-ui/core';
import React, { FC, memo } from 'react';
import {
  ITableSortConfig,
  TableHeaderData,
  TableTranslateKey,
  TableTranslateKeyWithContextObjectAndFormatter,
} from '../../../containers';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ArrowDownward, ArrowUpward } from '@material-ui/icons';

type SorfConfigChangeHandlerFn = (
  column: string,
  sortOrder: 'ASC' | 'DESC'
) => void;
interface TableComponentHeaderProps {
  headerData: TableHeaderData;
  handleSortOrderChange: SorfConfigChangeHandlerFn;
  sortConfig: ITableSortConfig<object>;
}

export const translateHeader = (
  t: TFunction,
  headerItem: TableTranslateKeyWithContextObjectAndFormatter | TableTranslateKey
) => {
  if (Array.isArray(headerItem)) {
    const [tKey, config] =
      headerItem as TableTranslateKeyWithContextObjectAndFormatter;
    return t(tKey, config[1]?.translateContext);
  } else if (headerItem) {
    return t(headerItem as TableTranslateKey);
  }
};

export const TableComponentHeader: FC<TableComponentHeaderProps> = ({
  headerData,
  sortConfig,
  handleSortOrderChange,
}) => {
  const { t } = useTranslation();

  return (
    <TableHead>
      <TableRow>
        {Object.entries(headerData).map(([columnKey, headerItem]) => {
          const columnTranslationKey = Array.isArray(headerItem)
            ? headerItem[0]
            : headerItem;
          const colSortConfig =
            sortConfig.sortableColumns[columnTranslationKey];
          return (
            <TableCell key={columnTranslationKey}>
              {colSortConfig && (
                <SortIndicator
                  columnKey={columnKey}
                  handleSortOrderChange={handleSortOrderChange}
                  sortOrder={colSortConfig.sortOrder}
                />
              )}
              {translateHeader(t, headerItem)}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};

interface SortIndicatorProps {
  columnKey: string;
  sortOrder: 'ASC' | 'DESC';
  handleSortOrderChange: SorfConfigChangeHandlerFn;
}

const SortIndicator = memo((props: SortIndicatorProps) => {
  const { handleSortOrderChange, sortOrder, columnKey } = props;
  switch (sortOrder) {
    case 'DESC':
      return (
        <ArrowDownward
          onClick={() => handleSortOrderChange(columnKey, 'ASC')}
        />
      );
    case 'ASC':
      return (
        <ArrowUpward onClick={() => handleSortOrderChange(columnKey, 'DESC')} />
      );
  }
});

SortIndicator.displayName = 'SortIndicator';
