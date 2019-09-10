import * as React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import renderHTML from 'react-render-html';
import { Pagination } from './Pagination';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import './Table.scss';
import { ActionIcon } from '../icons/ActionIcon';
import { ICustomFilter } from './FiltersHeader';
import { deepEqual } from '../../utils/Helper';
import { SortPropertiesType } from './PaginatedLoaderFilteredSorted';

export type TableOnSelectFunction = (index: number, selected: boolean) => void;

export interface ITableProps {
    header: Array<ITableHeaderData>;
    data: any;
    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    footer?: any;
    actions?: boolean;
    actionWidth?: any;
    classNames?: string[];
    operations?: any[];
    operationClicked?: (key: string | number, id?: number) => void;
    onSelect?: TableOnSelectFunction;
    currentSort?: SortPropertiesType;
    sortAscending?: boolean;
    toggleSort?: (sortProperties: SortPropertiesType) => void;
}

export interface ITableHeaderData {
    label: string;
    key: string;
    style: React.CSSProperties;
    styleBody: React.CSSProperties;
    sortProperties?: SortPropertiesType;
}

interface IState {
    currentPage: number;
}

const addCommas = intNum => {
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
};

const renderText = (data, tag = 'div') => {
    return `<${tag}>${Number(data) ? addCommas(data) : data}</${tag}>`;
};

export class Table extends React.Component<ITableProps, IState> {
    isMountedIndicator = false;

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1
        };

        this.loadPage = this.loadPage.bind(this);
    }

    componentDidMount() {
        this.isMountedIndicator = true;
    }

    componentWillUnmount() {
        this.isMountedIndicator = false;
    }

    calculateTotal = (data, keys) => {
        if (!keys || keys.length === 0) {
            return;
        }

        const ret = {};
        const offset = keys[0].colspan - 1;
        for (let k = 1; k < keys.length; k++) {
            const key = keys[k].key;
            ret[key] = 0;
        }
        for (let d = 0; d < data.length; d++) {
            const row = data[d];
            for (let k = 1; k < keys.length; k++) {
                const key = keys[k].key;
                ret[key] += Number(row[k + offset]);
            }
        }

        for (const key of Object.keys(ret)) {
            if (ret[key] && typeof ret[key] === 'number') {
                ret[key] = Math.round(ret[key] * 1000) / 1000;
            }
        }

        return ret;
    };

    async loadPage(page: number) {
        await this.props.loadPage(page);

        if (!this.isMountedIndicator) {
            return;
        }

        this.setState({
            currentPage: page
        });
    }

    render() {
        const {
            header = [],
            footer = [],
            data = [],
            actions,
            actionWidth,
            classNames,
            operations = [],
            operationClicked = () => null,
            currentSort,
            sortAscending
        } = this.props;

        const totalTableColumnSum = this.calculateTotal(data, footer);

        const popoverFocus = (id: number) => (
            <Popover id="popover-trigger-focus">
                <div className="popover-wrapper">
                    {operations.map((o: string) => (
                        <div
                            key={o}
                            onClick={() => operationClicked(o, id)}
                            className="popover-item"
                        >
                            {o}
                        </div>
                    ))}
                </div>
            </Popover>
        );

        return (
            <div className="TableWrapper">
                <table className={(classNames || []).join(' ')}>
                    <thead>
                        <tr>
                            {this.props.onSelect && <th style={{ width: '30px' }} />}
                            {header.map((item: ITableHeaderData) => {
                                return (
                                    <th style={item.style} key={item.key}>
                                        {item.sortProperties ? (
                                            <div
                                                onClick={() =>
                                                    this.props.toggleSort(item.sortProperties)
                                                }
                                                className="Table_head_columnHeader-clickable"
                                            >
                                                {item.label}
                                                {deepEqual(item.sortProperties, currentSort) ? (
                                                    sortAscending ? (
                                                        <ArrowDropUp className="Table_head_columnHeader_sortIcon" />
                                                    ) : (
                                                        <ArrowDropDown className="Table_head_columnHeader_sortIcon" />
                                                    )
                                                ) : (
                                                    ''
                                                )}
                                            </div>
                                        ) : (
                                            renderHTML(renderText(item.label))
                                        )}
                                    </th>
                                );
                            })}
                            {actions && (
                                <th style={{ width: actionWidth || 72.89 }} className="Actions">
                                    {renderHTML(renderText('Actions'))}
                                </th>
                            )}
                        </tr>
                    </thead>
                    {footer.length > 0 && (
                        <tfoot>
                            <tr>
                                {footer.map(item => {
                                    return (
                                        <td
                                            colSpan={
                                                item.colspan + (this.props.onSelect ? 1 : 0) || 1
                                            }
                                            className={`Total ${item.hide ? 'Hide' : 'Show'}`}
                                            style={item.style || {}}
                                            key={item.key}
                                        >
                                            {renderHTML(
                                                renderText(
                                                    item.label || totalTableColumnSum[item.key]
                                                )
                                            )}
                                        </td>
                                    );
                                })}
                                {actions && <td className="Actions" />}
                            </tr>
                        </tfoot>
                    )}
                    <tbody>
                        {data.map((row, rowIndex) => {
                            return (
                                <tr key={row[0]}>
                                    {this.props.onSelect && (
                                        <td className="selectRow">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id={'selectbox' + row[0]}
                                                    onChange={e =>
                                                        this.props.onSelect(
                                                            rowIndex,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="custom-control-label"
                                                    htmlFor={'selectbox' + row[0]}
                                                />
                                            </div>
                                        </td>
                                    )}
                                    {header.map((item: ITableHeaderData, colIndex) => {
                                        return (
                                            <td
                                                key={item.key}
                                                style={{ ...item.style, ...item.styleBody } || {}}
                                                className={`${
                                                    item.styleBody.opacity ? 'Active' : ''
                                                }`}
                                            >
                                                {renderHTML(renderText(row[colIndex]))}
                                            </td>
                                        );
                                    })}
                                    {actions && (
                                        <td className="Actions">
                                            {operations.length > 0 && (
                                                <OverlayTrigger
                                                    trigger="focus"
                                                    placement="bottom"
                                                    overlay={popoverFocus(row[0])}
                                                >
                                                    <Button>
                                                        <ActionIcon />
                                                    </Button>
                                                </OverlayTrigger>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <Pagination
                    displayedEntriesLength={data.length}
                    currentPage={this.state.currentPage}
                    loadPage={this.loadPage}
                    pageSize={this.props.pageSize}
                    total={this.props.total}
                />
            </div>
        );
    }
}
