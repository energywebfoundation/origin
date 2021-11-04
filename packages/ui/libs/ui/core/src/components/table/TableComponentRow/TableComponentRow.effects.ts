import {
  TableHeaderData,
  TableRowData,
} from '../../../containers/TableComponent';
import { useState } from 'react';

export const useTableComponentRowEffects = <Id>(
  row: TableRowData<Id>,
  onRowClick: (id: Id) => void,
  headerData: TableHeaderData
) => {
  const [showExpanded, setShowExpanded] = useState(false);

  const handleExpandRow = () => {
    row.expandedRowComponent && setShowExpanded(!showExpanded);
  };

  const handleRowClick = () => {
    onRowClick && onRowClick(row.id);
  };

  const handleClick = row.expandedRowComponent
    ? handleExpandRow
    : handleRowClick;
  const headerKeys = Object.keys(headerData);

  const applyHoverStyles =
    Boolean(onRowClick) || Boolean(row.expandedRowComponent);
  const ExpandedRow = row.expandedRowComponent;

  return {
    headerKeys,
    handleClick,
    showExpanded,
    ExpandedRow,
    applyHoverStyles,
  };
};
