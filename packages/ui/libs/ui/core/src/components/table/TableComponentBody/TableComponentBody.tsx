import { Box, Skeleton, TableBody } from '@material-ui/core';
import React, { FC, PropsWithChildren, ReactElement } from 'react';
import { TableHeaderData, TableRowData } from '../../../containers';
import { TableComponentRow } from '../TableComponentRow';
import { range } from 'lodash';

interface TableComponentBodyProps<Id> {
  rowData: TableRowData<Id>[];
  headerData: TableHeaderData;
  pageSize: number;
  loading: boolean;
  onRowClick?: (id: Id) => void;
  getCustomRowClassName?: (id: Id) => string;
}

export type TTableComponentBody = <Id>(
  props: PropsWithChildren<TableComponentBodyProps<Id>>
) => ReactElement;

export const TableComponentBody: TTableComponentBody = ({
  loading,
  rowData,
  headerData,
  pageSize,
  onRowClick,
  getCustomRowClassName,
}) => {
  return (
    <TableBody>
      {loading ? (
        <TableRowsLoadingComponent
          colSpan={Object.keys(headerData).length}
          pageSize={pageSize}
        />
      ) : (
        rowData.map((row) => (
          <TableComponentRow
            key={row.id.toString()}
            row={row}
            headerData={headerData}
            onRowClick={onRowClick}
            className={getCustomRowClassName && getCustomRowClassName(row.id)}
          />
        ))
      )}
    </TableBody>
  );
};

const TableRowsLoadingComponent: FC<{ pageSize?: number; colSpan: number }> = ({
  pageSize,
  colSpan,
}) => {
  return (
    <>
      {range(pageSize).map((value) => (
        <tr key={value.toString()}>
          <td colSpan={colSpan}>
            <Box m={'10px'}>
              <Skeleton height={'60px'} />
            </Box>
          </td>
        </tr>
      ))}
    </>
  );
};
