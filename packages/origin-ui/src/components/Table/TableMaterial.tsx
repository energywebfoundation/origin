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
    WithStyles
} from '@material-ui/core';

const styles = {
    root: {
        width: '100%'
    },
    tableWrapper: {
        overflow: 'auto'
    }
};

export interface ITableColumn {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right';
}

interface IProps extends WithStyles<typeof styles> {
    columns: readonly ITableColumn[]; // @TODO strict
    rows: any; // @TODO strict
    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    operations?: any[];
    operationClicked?: (key: string | number, id?: number) => void;
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

class TableMaterialClass extends React.Component<IProps, IState> {
    isMountedIndicator = false;

    constructor(props) {
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
        const { classes, columns, pageSize, rows, total, filters } = this.props;
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => {
                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={index}
                                            onClick={() => this.handleRowClick(index)}
                                            className={
                                                this.props.handleRowClick ? 'cursor-pointer' : ''
                                            }
                                        >
                                            {columns.map(column => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {value}
                                                    </TableCell>
                                                );
                                            })}
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

export const TableMaterial = withStyles(styles)(TableMaterialClass);
