import React, { ReactNode, useState, useContext } from 'react';
import {
    SortPropertiesType,
    CurrentSortType,
    ICustomFilter,
    FiltersHeader,
    ICustomFilterDefinition,
    Actions,
    ITableAction,
    ColumnBatchActions,
    IBatchableAction,
    CustomCounterGeneratorFunction
} from '.';
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
    TableSortLabel,
    Box
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { OriginConfigurationContext } from '../../PackageConfigurationProvider';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

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

export type TableAction = ITableAction | ITableAction[] | ((row: any) => ITableAction);

export function getRowId(row: { id?: string }, index: number): string {
    return row?.id ?? index?.toString();
}

interface IProps<T extends readonly ITableColumn[]> {
    columns: T;
    rows: (TTableRow<GetReadonlyArrayItemType<T>['id']> & { id?: string })[];

    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    actions?: TableAction[];
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
    allowedActions?: any;
    caption?: string;
    actionsLabel?: string;
    dependantFilters?: (filters: ICustomFilter[]) => ICustomFilter[];
}

export function TableMaterial<T extends readonly ITableColumn[]>(props: IProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const configuration = useContext(OriginConfigurationContext);

    async function loadPage(page: number, filters?: ICustomFilter[]) {
        await props.loadPage(page, filters);

        setCurrentPage(page);
    }

    function filtersChanged(filters: ICustomFilter[]) {
        loadPage(1, filters);
        setCurrentPage(1);
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

    function renderActions(
        actionsArr,
        allowed,
        row: TTableRow<GetReadonlyArrayItemType<T>['id']>,
        rowId: number,
        id: string,
        classes: Record<'root' | 'tableWrapper' | 'tableCellWrappingActions', string>
    ) {
        if (!actionsArr?.length) {
            return;
        }

        const is2DArray = Array.isArray(actionsArr[0]);

        let finalActionsList;

        if (!is2DArray) {
            finalActionsList = actionsArr;
        } else if (actionsArr[rowId].length > 0) {
            finalActionsList = actionsArr[rowId];
        } else {
            return <TableCell key={id}></TableCell>;
        }

        finalActionsList = finalActionsList
            .map((ac) => {
                if (typeof ac === 'function') {
                    return ac(row);
                }
                return ac;
            })
            .filter((ac) => Boolean(ac));

        const finalFinalActions = allowed
            ? finalActionsList.filter((action) => allowed[(row as any).source]?.includes(action.id))
            : finalActionsList;

        return (
            <TableCell key={id} className={classes.tableCellWrappingActions}>
                {finalFinalActions.length > 0 && <Actions actions={finalFinalActions} id={id} />}
            </TableCell>
        );
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
        highlightedRowsIds: highlightedRowsIndexes = [],
        allowedActions,
        caption,
        actionsLabel,
        dependantFilters
    } = props;

    if (selectedIds.length > rows.length) {
        setSelectedIds([]);
    }

    const zeroIndexBasedPage = currentPage - 1;

    const order = sortAscending ? 'asc' : 'desc';

    const showBatchableActions = batchableActions && batchableActions.length > 0;
    const originPrimaryColor = configuration?.styleConfig?.PRIMARY_COLOR;
    const useStyles = makeStyles(() =>
        createStyles({
            root: {
                width: '100%'
            },
            tableWrapper: {},
            tableCellWrappingActions: {
                position: 'relative',
                minWidth: '56px'
            },
            highlightedRow: {
                outline: `1px solid ${originPrimaryColor}`,
                outlineOffset: '-1px',
                '&[tabindex="-1"]:focus:not(:focus-visible)': {
                    outline: `1px solid ${originPrimaryColor} !important`,
                    outlineOffset: '-1px !important'
                }
            }
        })
    );
    const theme = useTheme();
    const {
        palette: {
            text: { primary: textPrimary }
        },
        spacing
    } = theme;

    const classes = useStyles(useTheme());

    return (
        <>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={configuration?.language}>
                <FiltersHeader
                    filters={filters}
                    filtersChanged={filtersChanged}
                    dependantFilters={dependantFilters}
                />

                <ColumnBatchActions
                    batchableActions={batchableActions}
                    selectedIds={selectedIds}
                    customCounterGenerator={customSelectCounterGenerator}
                />

                <Paper className={classes.root}>
                    <div className={classes.tableWrapper}>
                        {caption && (
                            <Box
                                style={{
                                    paddingLeft: spacing(2),
                                    paddingTop: spacing(2),
                                    color: textPrimary,
                                    fontWeight: 'bold'
                                }}
                            >
                                <span>{caption}</span>
                            </Box>
                        )}
                        <Table>
                            <TableHead>
                                <TableRow></TableRow>
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
                                                sortDirection={
                                                    sortedByThisColumn ? order : undefined
                                                }
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
                                    {actions && actions.length > 0 && (
                                        <TableCell align="center">{actionsLabel}</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, rowIndex) => {
                                    const id = getRowId(row, rowIndex);
                                    const isItemSelected = selectedIds.includes(id);
                                    const rowStyle = highlightedRowsIndexes.includes(id);
                                    return (
                                        <React.Fragment key={id}>
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                className={rowStyle ? classes.highlightedRow : null}
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
                                                                handleRowClick
                                                                    ? 'cursor-pointer'
                                                                    : ''
                                                            }
                                                            key={column.id}
                                                            align={column.align}
                                                        >
                                                            {value}
                                                        </TableCell>
                                                    );
                                                })}
                                                {renderActions(
                                                    actions,
                                                    allowedActions,
                                                    row,
                                                    rowIndex,
                                                    id,
                                                    classes
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
            </MuiPickersUtilsProvider>
        </>
    );
}
