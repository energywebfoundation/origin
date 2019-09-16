import * as React from 'react';
import { ICustomFilter, FiltersHeader, ICustomFilterDefinition } from './FiltersHeader';
import { SortPropertiesType } from './PaginatedLoaderFilteredSorted';
import { TableOnSelectFunction } from './Table';
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
    createStyles
} from '@material-ui/core';
import { Actions, ITableAction } from './Actions';

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
}

interface IState {
    currentPage: number;
}

class TableMaterialClass<T extends readonly ITableColumn[]> extends React.Component<
    IProps<T>,
    IState
> {
    isMountedIndicator = false;

    constructor(props: IProps<T>) {
        super(props);

        this.state = {
            currentPage: 1
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

    handleRowClick(rowIndex: number) {
        if (this.props.handleRowClick) {
            this.props.handleRowClick(rowIndex);
        }
    }

    render() {
        const { classes, columns, pageSize, rows, total, filters, actions } = this.props;
        const { currentPage } = this.state;

        const zeroIndexBasedPage = currentPage - 1;

        return (
            <>
                <FiltersHeader filters={filters} filtersChanged={this.filtersChanged} />

                <Paper className={classes.root}>
                    <div className={classes.tableWrapper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map(column => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                    {actions && actions.length > 0 && <TableCell></TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, rowIndex) => {
                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={rowIndex}
                                        >
                                            {columns.map(column => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell
                                                        onClick={() =>
                                                            this.handleRowClick(rowIndex)
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
