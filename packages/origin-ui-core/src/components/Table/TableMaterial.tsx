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

type TableOnSelectFunction = (id: string, selected: boolean) => void;

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

export interface ICustomRow<T extends any> {
    shouldDisplay: (row: T) => boolean;
    display: React.ReactElement;
}

export function getRowId(row: { id?: string }, index: number): string {
    return row?.id ?? index?.toString();
}

interface IProps<T extends readonly ITableColumn[]> {
    columns: T;
    rows: (TTableRow<GetReadonlyArrayItemType<T>['id']> & { id?: string })[];

    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    actions?: ITableAction[];
    onSelect?: TableOnSelectFunction;
    currentSort?: CurrentSortType;
    sortAscending?: boolean;
    toggleSort?: (sortType: CurrentSortType) => void;
    filters?: ICustomFilterDefinition[];
    handleRowClick?: (rowId: string) => void;
    batchableActions?: IBatchableAction[];
    customSelectCounterGenerator?: CustomCounterGeneratorFunction;
    highlightedRowsIds?: string[];
    customRow?: ICustomRow<TTableRow<GetReadonlyArrayItemType<T>['id']> & { id?: string }>;
}

export function TableMaterial<T extends readonly ITableColumn[]>(props: IProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    async function loadPage(page: number, filters?: ICustomFilter[]) {
        await props.loadPage(page, filters);

        setCurrentPage(page);
    }

    function filtersChanged(filters: ICustomFilter[]) {
        loadPage(1, filters);
    }

    function itemSelectionChanged(id: string, selected: boolean) {
        let newSelectedIndexes = selectedIds;

        if (selected) {
            if (!newSelectedIndexes.includes(id)) {
                newSelectedIndexes = [...selectedIds, id];
            }
        } else if (newSelectedIndexes.includes(id)) {
            newSelectedIndexes = newSelectedIndexes.filter((selectedIndex) => selectedIndex !== id);
        }

        setSelectedIds(newSelectedIndexes);
    }

    function resetSelection() {
        setSelectedIds([]);
    }

    function setAllItemsSelectedProperty(checked: boolean) {
        if (checked) {
            setSelectedIds(props.rows.map((row, index) => index?.toString()));
        } else {
            resetSelection();
        }
    }

    const {
        customRow,
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
        highlightedRowsIds: highlightedRowsIndexes
    } = props;

    if (selectedIds.length > rows.length) {
        setSelectedIds([]);
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

    return (
        <>
            <FiltersHeader filters={filters} filtersChanged={filtersChanged} />

            <ColumnBatchActions
                batchableActions={batchableActions}
                selectedIds={selectedIds}
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
                                                selectedIds.length > 0 &&
                                                selectedIds.length < rows.length
                                            }
                                            checked={
                                                selectedIds.length !== 0 &&
                                                selectedIds.length === rows.length
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
                            {rows.map((row, rowIndex) => {
                                const id = getRowId(row, rowIndex);
                                const isItemSelected = selectedIds.includes(id);
                                const rowStyle = highlightedRowsIndexes?.includes(id)
                                    ? {
                                          background: '#424242'
                                      }
                                    : {};

                                return (
                                    <React.Fragment key={id}>
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            style={rowStyle}
                                        >
                                            {showBatchableActions && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        onChange={(e) =>
                                                            itemSelectionChanged(
                                                                id,
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
                                                            (() => handleRowClick(id))
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
                                                    key={id}
                                                    className={classes.tableCellWrappingActions}
                                                >
                                                    <Actions actions={actions} id={id} />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                        {customRow?.shouldDisplay(row) && (
                                            <TableRow>{customRow.display}</TableRow>
                                        )}
                                    </React.Fragment>
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
