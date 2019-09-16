import * as React from 'react';
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
    withStyles,
    WithStyles,
    createStyles,
    Checkbox,
    TableSortLabel
} from '@material-ui/core';
import { Actions, ITableAction } from './Actions';
import { deepEqual } from '../../utils/Helper';
import {
    ColumnBatchActions,
    IBatchableAction,
    CustomCounterGeneratorFunction
} from './ColumnBatchActions';

type TableOnSelectFunction = (index: number, selected: boolean) => void;

const styles = () =>
    createStyles({
        root: {
            width: '100%'
        },
        tableWrapper: {},
        tableCellWrappingActions: {
            position: 'relative'
        }
    });

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
    [key in T]: string;
};

interface IProps<T extends readonly ITableColumn[]> extends WithStyles<typeof styles> {
    columns: T;
    rows: TTableRow<GetReadonlyArrayItemType<T>['id']>[];

    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    actions?: ITableAction[];
    onSelect?: TableOnSelectFunction;
    currentSort?: SortPropertiesType;
    sortAscending?: boolean;
    toggleSort?: (sortProperties: SortPropertiesType) => void;
    filters?: ICustomFilterDefinition[];
    handleRowClick?: (rowIndex: number) => void;
    batchableActions?: IBatchableAction[];
    customSelectCounterGenerator?: CustomCounterGeneratorFunction;
}

interface IState {
    currentPage: number;
    selectedIndexes: number[];
}

class TableMaterialClass<T extends readonly ITableColumn[]> extends React.Component<
    IProps<T>,
    IState
> {
    isMountedIndicator = false;

    constructor(props: IProps<T>) {
        super(props);

        this.state = {
            currentPage: 1,
            selectedIndexes: []
        };

        this.loadPage = this.loadPage.bind(this);
        this.filtersChanged = this.filtersChanged.bind(this);
    }

    componentDidMount() {
        this.isMountedIndicator = true;
    }

    componentWillUnmount() {
        this.isMountedIndicator = false;
    }

    filtersChanged(filters: ICustomFilter[]) {
        this.loadPage(1, filters);
    }

    async loadPage(page: number, filters?: ICustomFilter[]) {
        await this.props.loadPage(page, filters);

        if (!this.isMountedIndicator) {
            return;
        }

        this.setState({
            currentPage: page
        });
    }

    itemSelectionChanged(index: number, selected: boolean) {
        let selectedIndexes = this.state.selectedIndexes;

        if (selected) {
            if (!selectedIndexes.includes(index)) {
                selectedIndexes = [...selectedIndexes, index];
            }
        } else if (selectedIndexes.includes(index)) {
            selectedIndexes = selectedIndexes.filter(selectedIndex => selectedIndex !== index);
        }

        this.setState({
            selectedIndexes
        });
    }

    resetSelection() {
        this.setState({
            selectedIndexes: []
        });
    }

    setAllItemsSelectedProperty(checked: boolean) {
        if (checked) {
            this.setState({
                selectedIndexes: this.props.rows.map((row, index) => index)
            });
        } else {
            this.resetSelection();
        }
    }

    componentDidUpdate(prevProps: IProps<T>) {
        if (JSON.stringify(prevProps.rows) !== JSON.stringify(this.props.rows)) {
            this.resetSelection();
        }
    }

    render() {
        const {
            classes,
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
        } = this.props;
        const { currentPage, selectedIndexes } = this.state;

        const zeroIndexBasedPage = currentPage - 1;

        const order = sortAscending ? 'asc' : 'desc';

        const showBatchableActions = batchableActions && batchableActions.length > 0;

        return (
            <>
                <FiltersHeader filters={filters} filtersChanged={this.filtersChanged} />

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
                                                    this.setAllItemsSelectedProperty(
                                                        e.target.checked
                                                    )
                                                }
                                                color="primary"
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map(column => {
                                        const isSortable =
                                            column.sortProperties &&
                                            column.sortProperties.length > 0;
                                        const sortedByThisColumn =
                                            isSortable &&
                                            deepEqual(column.sortProperties, currentSort);

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
                                                    onClick={() =>
                                                        toggleSort(column.sortProperties)
                                                    }
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
                                    const isItemSelected = this.state.selectedIndexes.includes(
                                        rowIndex
                                    );

                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={rowIndex}
                                        >
                                            {showBatchableActions && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        onChange={e =>
                                                            this.itemSelectionChanged(
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
                                                            this.props.handleRowClick
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
                                            this.loadPage(zeroIndexBasedNewPage + 1);
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
}

type ExternalProps<T extends readonly ITableColumn[]> = Omit<IProps<T>, 'classes'>;

export const TableMaterial = withStyles(styles)(TableMaterialClass) as <
    T extends readonly ITableColumn[]
>(
    props: ExternalProps<T>
) => React.ReactElement<TableMaterialClass<T>>;
