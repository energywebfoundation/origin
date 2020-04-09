import React, { ReactNode, useState } from 'react';
import { ICustomFilter, FiltersHeader, ICustomFilterDefinition } from './FiltersHeader';
import { SortPropertiesType, CurrentSortType } from './PaginatedLoaderFilteredSorted';
import {
    Paper,
    TableFooter,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    makeStyles,
    createStyles,
    useTheme,
    Checkbox,
    TableSortLabel
} from '@material-ui/core';
import { Actions, ITableAction } from './Actions';
import {
    ColumnBatchActions,
    IBatchableAction,
    CustomCounterGeneratorFunction
} from './ColumnBatchActions';

type TableOnSelectFunction = (index: number, selected: boolean) => void;

export interface ITableColumn {
    id: string;
    label: string;
    sortProperties?: SortPropertiesType;
    minWidth?: number;
    align?: 'right';
}

export type GetReadonlyArrayItemType<T extends ReadonlyArray<any>> = T extends ReadonlyArray<
    infer U
>
    ? U
    : never;

export type TTableRow<T extends string> = {
    [key in T]: ReactNode;
};

export interface ICustomRow {
    renderAfterIndex: number;
    display: React.ReactElement;
}

interface IProps<T extends readonly ITableColumn[]> {
    columns: T;
    rows: TTableRow<GetReadonlyArrayItemType<T>['id']>[];

    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    actions?: ITableAction[];
    onSelect?: TableOnSelectFunction;
    currentSort?: CurrentSortType;
    sortAscending?: boolean;
    toggleSort?: (sortType: CurrentSortType) => void;
    filters?: ICustomFilterDefinition[];
    handleRowClick?: (rowIndex: number) => void;
    batchableActions?: IBatchableAction[];
    customSelectCounterGenerator?: CustomCounterGeneratorFunction;
    highlightedRowsIndexes?: number[];
    customRow?: ICustomRow;
}

export function TableMaterial<T extends readonly ITableColumn[]>(props: IProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIndexes, setSelectedIndexes] = useState([]);

    async function loadPage(page: number, filters?: ICustomFilter[]) {
        await props.loadPage(page, filters);

        setCurrentPage(page);
    }

    function filtersChanged(filters: ICustomFilter[]) {
        loadPage(1, filters);
    }

    function itemSelectionChanged(index: number, selected: boolean) {
        let newSelectedIndexes = selectedIndexes;

        if (selected) {
            if (!newSelectedIndexes.includes(index)) {
                newSelectedIndexes = [...selectedIndexes, index];
            }
        } else if (newSelectedIndexes.includes(index)) {
            newSelectedIndexes = newSelectedIndexes.filter(
                (selectedIndex) => selectedIndex !== index
            );
        }

        setSelectedIndexes(newSelectedIndexes);
    }

    function resetSelection() {
        setSelectedIndexes([]);
    }

    function setAllItemsSelectedProperty(checked: boolean) {
        if (checked) {
            setSelectedIndexes(props.rows.map((row, index) => index));
        } else {
            resetSelection();
        }
    }

    const {
        customRow: arbitraryRow,
        columns,
        pageSize,
        rows,
        total,
        filters,
        actions,
        currentSort,
        sortAscending,
        handleRowClick,
        batchableActions,
        customSelectCounterGenerator,
        toggleSort,
        highlightedRowsIndexes
    } = props;

    if (selectedIndexes.length > rows.length) {
        setSelectedIndexes([]);
    }

    const zeroIndexBasedPage = currentPage - 1;

    const order = sortAscending ? 'asc' : 'desc';

    const showBatchableActions = batchableActions && batchableActions.length > 0;

    const useStyles = makeStyles(() =>
        createStyles({
            root: {
                width: '100%'
            },
            tableWrapper: {},
            tableCellWrappingActions: {
                position: 'relative',
                minWidth: '56px'
            }
        })
    );

    const classes = useStyles(useTheme());

    const tableRows = arbitraryRow
        ? [
              ...rows.slice(0, arbitraryRow.renderAfterIndex + 1),
              arbitraryRow,
              ...rows.slice(arbitraryRow.renderAfterIndex + 1)
          ]
        : rows;

    return (
        <>
            <FiltersHeader filters={filters} filtersChanged={filtersChanged} />

            <ColumnBatchActions
                batchableActions={batchableActions}
                selectedIndexes={selectedIndexes}
                customCounterGenerator={customSelectCounterGenerator}
            />

            <Paper className={classes.root}>
                <div className={classes.tableWrapper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {showBatchableActions && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={
                                                selectedIndexes.length > 0 &&
                                                selectedIndexes.length < rows.length
                                            }
                                            checked={
                                                selectedIndexes.length !== 0 &&
                                                selectedIndexes.length === rows.length
                                            }
                                            onChange={(e) =>
                                                setAllItemsSelectedProperty(e.target.checked)
                                            }
                                            color="primary"
                                        />
                                    </TableCell>
                                )}
                                {columns.map((column) => {
                                    const isSortable = column.sortProperties?.length > 0;
                                    const sortedByThisColumn =
                                        isSortable && column.id === currentSort.id;

                                    return (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                            sortDirection={sortedByThisColumn ? order : undefined}
                                        >
                                            <TableSortLabel
                                                active={sortedByThisColumn}
                                                direction={order}
                                                onClick={() => {
                                                    if (!column.sortProperties || !toggleSort) {
                                                        return;
                                                    }

                                                    toggleSort(column as CurrentSortType);
                                                }}
                                                hideSortIcon={!isSortable}
                                                disabled={!isSortable}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        </TableCell>
                                    );
                                })}
                                {actions && actions.length > 0 && <TableCell></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableRows.map((row, rowIndex) => {
                                const index =
                                    arbitraryRow && arbitraryRow.renderAfterIndex < rowIndex
                                        ? rowIndex - 1
                                        : rowIndex;

                                if (typeof (row as ICustomRow).renderAfterIndex !== 'undefined') {
                                    return (
                                        <TableRow tabIndex={-1} key={`${index}-details`}>
                                            {arbitraryRow.display}
                                        </TableRow>
                                    );
                                }

                                const isItemSelected = selectedIndexes.includes(index);

                                const rowStyle = highlightedRowsIndexes?.includes(index)
                                    ? {
                                          background: '#424242'
                                      }
                                    : {};

                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={index}
                                        style={rowStyle}
                                    >
                                        {showBatchableActions && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    onChange={(e) =>
                                                        itemSelectionChanged(
                                                            index,
                                                            e.target.checked
                                                        )
                                                    }
                                                    color="primary"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell
                                                    onClick={
                                                        handleRowClick &&
                                                        (() => handleRowClick(index))
                                                    }
                                                    className={
                                                        handleRowClick ? 'cursor-pointer' : ''
                                                    }
                                                    key={column.id}
                                                    align={column.align}
                                                >
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                        {actions && actions.length > 0 && (
                                            <TableCell
                                                key={index}
                                                className={classes.tableCellWrappingActions}
                                            >
                                                <Actions actions={actions} id={index} />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={total}
                                    rowsPerPage={pageSize}
                                    page={zeroIndexBasedPage}
                                    onChangePage={(event, zeroIndexBasedNewPage) => {
                                        loadPage(zeroIndexBasedNewPage + 1);
                                    }}
                                    align="left"
                                    rowsPerPageOptions={[]}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </Paper>
        </>
    );
}
