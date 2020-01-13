import React, { ReactNode, useState } from 'react';
import { ICustomFilter, FiltersHeader, ICustomFilterDefinition } from './FiltersHeader';
import { SortPropertiesType } from './PaginatedLoaderFilteredSorted';
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

type GetReadonlyArrayItemType<T extends ReadonlyArray<any>> = T extends ReadonlyArray<infer U>
    ? U
    : never;

type TTableRow<T extends string> = {
    [key in T]: ReactNode;
};

interface IProps<T extends readonly ITableColumn[]> {
    columns: T;
    rows: TTableRow<GetReadonlyArrayItemType<T>['id']>[];

    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    actions?: ITableAction[];
    onSelect?: TableOnSelectFunction;
    currentSort?: ITableColumn;
    sortAscending?: boolean;
    toggleSort?: (sortProperties: ITableColumn) => void;
    filters?: ICustomFilterDefinition[];
    handleRowClick?: (rowIndex: number) => void;
    batchableActions?: IBatchableAction[];
    customSelectCounterGenerator?: CustomCounterGeneratorFunction;
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
                selectedIndex => selectedIndex !== index
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
        toggleSort
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
                                            onChange={e =>
                                                setAllItemsSelectedProperty(e.target.checked)
                                            }
                                            color="primary"
                                        />
                                    </TableCell>
                                )}
                                {columns.map(column => {
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
                                                onClick={() => toggleSort(column)}
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
                                const isItemSelected = selectedIndexes.includes(rowIndex);

                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                                        {showBatchableActions && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    onChange={e =>
                                                        itemSelectionChanged(
                                                            rowIndex,
                                                            e.target.checked
                                                        )
                                                    }
                                                    color="primary"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map(column => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell
                                                    onClick={
                                                        handleRowClick &&
                                                        (() => handleRowClick(rowIndex))
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
                                                key={rowIndex}
                                                className={classes.tableCellWrappingActions}
                                            >
                                                <Actions actions={actions} id={rowIndex} />
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
