// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { DatePicker } from '@material-ui/pickers';
import renderHTML from 'react-render-html';
import { Moment } from 'moment';
import { PeriodToSeconds } from '../DemandTable';
import { TimeFrame } from '@energyweb/utils-general';
import { Pagination } from './Pagination';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';

import './toggle.scss';
import './Table.scss';
import { ActionIcon } from '../icons/ActionIcon';
import { ICustomFilter } from './FiltersHeader';
import { deepEqual } from '../../utils/Helper';
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    FilledInput,
    MenuItem
} from '@material-ui/core';

export type TableOnSelectFunction = (index: number, selected: boolean) => void;

export interface ITableProps {
    header: Array<ITableHeaderData | ITableAdminHeaderData>;
    data: any;
    loadPage?: (page: number, filters?: ICustomFilter[]) => void | Promise<any>;
    pageSize?: number;
    total?: number;
    footer?: any;
    actions?: any | boolean;
    actionWidth?: any;
    classNames?: string[];
    type?: any;
    operations?: any[];
    operationClicked?: (key: string | number, id?: number) => void;
    onSelect?: TableOnSelectFunction;
    currentSort?: string[];
    sortAscending?: boolean;
    toggleSort?: (sortProperties: string[]) => void;
}

export interface ITableHeaderData {
    label: string;
    key: string;
    style: React.CSSProperties;
    styleBody: React.CSSProperties;
    sortProperties?: string[];
}

export interface ITableAdminHeaderData {
    header?: any;
    footer?: any;
    data?: any;
    footerClick?: (inputs: any) => void;
    key?: string;
}

interface IState {
    inputs: any;
    totalEnergy: any;
    date: any;
    currentPage: number;

    [x: string]: any;
    [x: number]: any;
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

        const { header, type = 'data' } = props;

        const toggles = {};
        if (type === 'admin') {
            for (let i = 0; i < header.length; i++) {
                if (header[i].header) {
                    continue;
                }
                const { data } = header[i];
                for (let d = 0; d < data.length; d++) {
                    const row = data[d];
                    if (row.toggle.default) {
                        toggles['toggle_' + row.key] = true;
                    }
                }
            }
        }

        this.state = {
            ...toggles,
            inputs: {
                enabledProperties: [
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false
                ]
            },
            totalEnergy: 0,
            date: new Date(),
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

    handleDropdown = (key, itemInput) => {
        return event => {
            const value = event.target.value;
            const { data } = this.props;
            if (itemInput.labelKey) {
                const items = data[itemInput.data];
                let val = items.filter(item => item[itemInput.key] === value);
                val = val.length > 0 ? val[0][itemInput.labelKey] : '';
                this.setState({
                    [key]: value,
                    ['dropdown_' + key]: val
                });
            } else {
                this.setState({ [key]: value });
            }
            const newInputs = { ...this.state.inputs };
            newInputs[key] = value;

            this.setState({ inputs: newInputs }, this.saveTotalEnergy);
        };
    };

    handleToggle = (key, index) => {
        return () => {
            const { state } = this;
            this.setState(state);

            if (index !== undefined) {
                const newInputs = { ...this.state.inputs };
                newInputs.enabledProperties[index] = !newInputs.enabledProperties[index];

                this.setState({ inputs: newInputs });
            }
        };
    };

    handleInput = key => {
        return e => {
            const newInputs = { ...this.state.inputs };
            newInputs[key] = e.target.value;

            this.setState(
                {
                    inputs: newInputs
                },
                this.saveTotalEnergy
            );
        };
    };

    handleDate = key => {
        return (momentObject: Moment) => {
            const dateObject = momentObject.toDate();
            const output = momentObject.format('DD MMM YY');
            this.setState({ [key]: dateObject, ['date_' + key]: output });
            const newInputs = { ...this.state.inputs };
            newInputs[key] = momentObject.unix();

            this.setState(
                {
                    inputs: newInputs
                },
                this.saveTotalEnergy
            );
        };
    };

    saveTotalEnergy() {
        this.setState({
            totalEnergy: this.calculateTotalEnergy()
        });
    }

    calculateTotalEnergy(): number {
        if (
            this.state.inputs.targetWhPerPeriod &&
            this.state.inputs.timeframe &&
            this.state.inputs.startTime &&
            this.state.inputs.endTime
        ) {
            return (
                Math.ceil(
                    (parseInt(this.state.inputs.endTime, 10) -
                        parseInt(this.state.inputs.startTime, 10)) /
                        PeriodToSeconds[TimeFrame[this.state.inputs.timeframe]]
                ) * parseInt(this.state.inputs.targetWhPerPeriod, 10)
            );
        } else {
            return 0;
        }
    }

    render() {
        const { state, props, handleToggle, handleDropdown, handleInput, handleDate } = this;
        const {
            header = [],
            footer = [],
            data = [],
            actions,
            actionWidth,
            classNames,
            type = 'data',
            operations = [],
            operationClicked = () => null,
            currentSort,
            sortAscending
        } = props;

        const totalTableColumnSum = type === 'data' ? this.calculateTotal(data, footer) : 0;

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
                {type === 'data' && (
                    <>
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
                                                            this.props.toggleSort(
                                                                item.sortProperties
                                                            )
                                                        }
                                                        className="Table_head_columnHeader-clickable"
                                                    >
                                                        {item.label}
                                                        {deepEqual(
                                                            item.sortProperties,
                                                            currentSort
                                                        ) ? (
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
                                        <th
                                            style={{ width: actionWidth || 72.89 }}
                                            className="Actions"
                                        >
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
                                                        item.colspan +
                                                            (this.props.onSelect ? 1 : 0) || 1
                                                    }
                                                    className={`Total ${
                                                        item.hide ? 'Hide' : 'Show'
                                                    }`}
                                                    style={item.style || {}}
                                                    key={item.key}
                                                >
                                                    {renderHTML(
                                                        renderText(
                                                            item.label ||
                                                                totalTableColumnSum[item.key]
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
                                                        style={
                                                            { ...item.style, ...item.styleBody } ||
                                                            {}
                                                        }
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
                    </>
                )}
                {type === 'admin' && (
                    <table className={`${type}`}>
                        <thead>
                            <tr>
                                <td style={{ width: '18.33' }}>&nbsp;</td>
                                <td style={{ width: '11.13' }}>&nbsp;</td>
                                <td style={{ width: '12.85' }}>&nbsp;</td>
                                <td style={{ width: '25.28' }}>&nbsp;</td>
                                <td style={{ width: '32.4' }}>&nbsp;</td>
                            </tr>
                        </thead>
                        <tbody>
                            {header.map((item: ITableAdminHeaderData) => {
                                return item.header ? (
                                    <tr
                                        key={item.key}
                                        className={`${item.footer ? 'TableFooter' : 'TableHeader'}`}
                                    >
                                        <th colSpan={5} className="Actions">
                                            {item.footer ? (
                                                <button
                                                    onClick={() =>
                                                        item.footerClick(this.state.inputs)
                                                    }
                                                >
                                                    {item.footer}
                                                </button>
                                            ) : (
                                                item.header
                                            )}
                                        </th>
                                    </tr>
                                ) : (
                                    item.data.map(nestedItem => (
                                        <tr key={nestedItem.key}>
                                            <td className="Actions Label">
                                                {renderHTML(
                                                    renderText(
                                                        nestedItem.label.length
                                                            ? nestedItem.label + ':'
                                                            : ''
                                                    )
                                                )}
                                            </td>
                                            <td
                                                className={`Actions ToggleLabel ${
                                                    state['toggle_' + nestedItem.key] ||
                                                    (nestedItem.toggle.ref &&
                                                        state['toggle_' + nestedItem.toggle.ref])
                                                        ? 'Disabled'
                                                        : 'Active'
                                                }`}
                                            >
                                                {renderHTML(
                                                    renderText(
                                                        nestedItem.toggle.hide
                                                            ? ''
                                                            : nestedItem.toggle.label
                                                    )
                                                )}
                                            </td>
                                            <td className={`Actions Toggle`}>
                                                {nestedItem.toggle.hide ? (
                                                    <div />
                                                ) : (
                                                    <div>
                                                        <Toggle
                                                            defaultChecked={
                                                                nestedItem.toggle.default || false
                                                            }
                                                            icons={false}
                                                            onChange={handleToggle(
                                                                nestedItem.key,
                                                                nestedItem.toggle.index
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td
                                                className={`Actions ToggleDescription ${
                                                    state['toggle_' + nestedItem.key] ||
                                                    (nestedItem.toggle.ref &&
                                                        state['toggle_' + nestedItem.toggle.ref])
                                                        ? 'Active'
                                                        : 'Disabled'
                                                }`}
                                            >
                                                {renderHTML(
                                                    renderText(
                                                        nestedItem.toggle.description.length
                                                            ? nestedItem.toggle.description + ':'
                                                            : ''
                                                    )
                                                )}
                                            </td>
                                            <td className={`Actions Input`}>
                                                {nestedItem.input.type === 'text' &&
                                                    nestedItem.key !== 'totalDemand' && (
                                                        <TextField
                                                            onChange={handleInput(nestedItem.key)}
                                                            value={state[nestedItem.key]}
                                                            label={nestedItem.label}
                                                            fullWidth
                                                            variant="filled"
                                                        />
                                                    )}
                                                {nestedItem.input.type === 'text' &&
                                                    nestedItem.key === 'totalDemand' && (
                                                        <TextField
                                                            value={this.state.totalEnergy}
                                                            label={nestedItem.label}
                                                            fullWidth
                                                            variant="filled"
                                                            disabled
                                                        />
                                                    )}
                                                {nestedItem.input.type === 'number' && (
                                                    // TO-DO: Deprecate the use of input type number after POC
                                                    <TextField
                                                        onChange={handleInput(nestedItem.key)}
                                                        value={state[nestedItem.key]}
                                                        label={nestedItem.label}
                                                        fullWidth
                                                        variant="filled"
                                                        type="number"
                                                    />
                                                )}
                                                {nestedItem.input.type === 'date' && (
                                                    <DatePicker
                                                        onChange={handleDate(nestedItem.key)}
                                                        value={state[nestedItem.key] || null}
                                                        fullWidth
                                                        variant="inline"
                                                        inputVariant="filled"
                                                        label={nestedItem.label}
                                                    />
                                                )}
                                                {nestedItem.input.type === 'select' && (
                                                    <FormControl fullWidth={true} variant="filled">
                                                        <InputLabel>
                                                            Choose {nestedItem.label}
                                                        </InputLabel>
                                                        <Select
                                                            onChange={handleDropdown(
                                                                nestedItem.key,
                                                                nestedItem.input
                                                            )}
                                                            fullWidth={true}
                                                            variant="filled"
                                                            value={state[nestedItem.key]}
                                                            input={<FilledInput />}
                                                        >
                                                            {nestedItem.input.key
                                                                ? data[nestedItem.input.data].map(
                                                                      (opt, index) => (
                                                                          <MenuItem
                                                                              key={index}
                                                                              value={
                                                                                  opt[
                                                                                      nestedItem
                                                                                          .input.key
                                                                                  ]
                                                                              }
                                                                          >
                                                                              {
                                                                                  opt[
                                                                                      nestedItem
                                                                                          .input
                                                                                          .labelKey
                                                                                  ]
                                                                              }
                                                                          </MenuItem>
                                                                      )
                                                                  )
                                                                : data[nestedItem.input.data].map(
                                                                      (opt, index) => (
                                                                          <MenuItem
                                                                              key={index}
                                                                              value={opt}
                                                                          >
                                                                              {opt}
                                                                          </MenuItem>
                                                                      )
                                                                  )}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        );
    }
}
