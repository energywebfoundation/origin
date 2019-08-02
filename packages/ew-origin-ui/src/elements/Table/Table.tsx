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
import { Button, DropdownButton, MenuItem, OverlayTrigger, Popover } from 'react-bootstrap';
import Toggle from 'react-toggle';
import DatePicker from 'react-date-picker';
import renderHTML from 'react-render-html';
import moment from 'moment';
import { PeriodToSeconds } from '../../components/DemandTable';
import { TimeFrame } from 'ew-utils-general-lib';
import { Pagination } from './Pagination';

import './toggle.scss';
import './Table.scss';
import './datepicker.scss';
import { ActionIcon } from '../icons/ActionIcon';

export type TableOnSelectFunction = (index: number, selected: boolean) => void;

export interface ITableProps {
    header: Array<ITableHeaderData | ITableAdminHeaderData>;
    data: any;
    loadPage?: (page: number) => void;
    pageSize?: number;
    total?: number;
    footer?: any;
    actions?: any | boolean;
    actionWidth?: any;
    classNames?: string[];
    type?: any;
    operations?: any[];
    operationClicked?: Function;
    onSelect?: TableOnSelectFunction;
}

export interface ITableHeaderData {
    label: string;
    key: string;
    style: React.CSSProperties;
    styleBody: React.CSSProperties;
}

export interface ITableAdminHeaderData {
    header?: any;
    footer?: any;
    data?: any;
    footerClick?: Function;
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

export class Table extends React.Component<ITableProps, IState> {
    _isMounted = false;

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
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
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

        for (let key of Object.keys(ret)) {
            if (ret[key] && typeof(ret[key]) === 'number') {
                ret[key] = Math.round(ret[key] * 1000) / 1000;
            }
        }

        return ret;
    }

    async loadPage(page: number) {
        await this.props.loadPage(page);

        if (!this._isMounted) {
            return;
        }

        this.setState({
            currentPage: page
        });
    }

    handleDropdown = (key, itemInput) => {
        return (value => {
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
        }).bind(this);
    }

    handleToggle = (key, index) => {
        const stateKey = 'toggle_' + key;

        return (() => {
            const { state } = this;
            // state[stateKey] = state[stateKey] ? false : true
            this.setState(state);

            if (index !== undefined) {
                const newInputs = { ...this.state.inputs };
                newInputs.enabledProperties[index] = !newInputs.enabledProperties[index];

                this.setState({ inputs: newInputs });
            }
        }).bind(this);
    }

    handleInput = key => {
        return (e => {
            const newInputs = { ...this.state.inputs };
            newInputs[key] = e.target.value;

            this.setState(
                {
                    inputs: newInputs
                },
                this.saveTotalEnergy
            );
        }).bind(this);
    }

    handleDate = key => {
        return (date => {
            const output = moment(date).format('DD MMM YY');
            this.setState({ [key]: date, ['date_' + key]: output });
            const newInputs = { ...this.state.inputs };
            newInputs[key] = moment(date).unix();

            this.setState(
                {
                    inputs: newInputs
                },
                this.saveTotalEnergy
            );
        }).bind(this);
    }

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
            operationClicked = () => {}
        } = props;

        const totalTableColumnSum = type === 'data' ? this.calculateTotal(data, footer) : 0;

        const popoverFocus = (id: number) => (
            <Popover id="popover-trigger-focus">
                <div className="popover-wrapper">
                    {operations.map(o => (
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
                                            {renderHTML(renderText(item.label))}
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
                        {footer.length > 0 &&
                            <tfoot>
                                <tr>
                                    {footer.map(item => {
                                        return (
                                            <td
                                                colSpan={(item.colspan + (this.props.onSelect ? 1 : 0) || 1)}
                                                className={`Total ${item.hide ? 'Hide' : 'Show'}`}
                                                style={item.style || {}}
                                                key={item.key}
                                            >
                                                {renderHTML(renderText(item.label || totalTableColumnSum[item.key]))}
                                            </td>
                                        );
                                    })}
                                    {actions && <td className="Actions" />}
                                </tr>
                            </tfoot>
                        }
                        <tbody>
                            {data.map((row, rowIndex) => {
                                return (
                                    <tr key={row[0]}>
                                        {this.props.onSelect && 
                                            <td className="selectRow">
                                                <div className="custom-control custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id={'selectbox' + row[0]}
                                                        onChange={e => this.props.onSelect(rowIndex, e.target.checked)}
                                                    />
                                                    <label className="custom-control-label" htmlFor={'selectbox' + row[0]} />
                                                </div>
                                            </td>
                                        }
                                        {header.map((item: ITableHeaderData, colIndex) => {
                                            return (
                                                <td
                                                    key={item.key}
                                                    style={
                                                        { ...item.style, ...item.styleBody } || {}
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
                            {header.map((item : ITableAdminHeaderData) => {
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
                                    item.data.map(item => (
                                        <tr key={item.key}>
                                            <td className="Actions Label">
                                                {renderHTML(
                                                    renderText(
                                                        item.label.length ? item.label + ':' : ''
                                                    )
                                                )}
                                            </td>
                                            <td
                                                className={`Actions ToggleLabel ${
                                                    state['toggle_' + item.key] ||
                                                    (item.toggle.ref &&
                                                        state['toggle_' + item.toggle.ref])
                                                        ? 'Disabled'
                                                        : 'Active'
                                                }`}
                                            >
                                                {renderHTML(
                                                    renderText(
                                                        item.toggle.hide ? '' : item.toggle.label
                                                    )
                                                )}
                                            </td>
                                            <td className={`Actions Toggle`}>
                                                {item.toggle.hide ? (
                                                    <div />
                                                ) : (
                                                    <div>
                                                        <Toggle
                                                            defaultChecked={
                                                                item.toggle.default || false
                                                            }
                                                            icons={false}
                                                            onChange={handleToggle(
                                                                item.key,
                                                                item.toggle.index
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td
                                                className={`Actions ToggleDescription ${
                                                    state['toggle_' + item.key] ||
                                                    (item.toggle.ref &&
                                                        state['toggle_' + item.toggle.ref])
                                                        ? 'Active'
                                                        : 'Disabled'
                                                }`}
                                            >
                                                {renderHTML(
                                                    renderText(
                                                        item.toggle.description.length
                                                            ? item.toggle.description + ':'
                                                            : ''
                                                    )
                                                )}
                                            </td>
                                            <td className={`Actions Input`}>
                                                {item.input.type === 'text' &&
                                                    item.key !== 'totalDemand' && (
                                                        <div>
                                                            <input
                                                                onChange={handleInput(item.key)}
                                                            />
                                                        </div>
                                                    )}
                                                {item.input.type === 'text' &&
                                                    item.key === 'totalDemand' && (
                                                        <div>
                                                            <input
                                                                value={this.state.totalEnergy}
                                                                readOnly={true}
                                                            />
                                                        </div>
                                                    )}
                                                {item.input.type === 'number' && (
                                                    // TO-DO: Deprecate the use of input type number after POC
                                                    <div>
                                                        <input type="number"
                                                            onChange={handleInput(item.key)}
                                                        />
                                                    </div>
                                                )}
                                                {item.input.type === 'date' && (
                                                    <div>
                                                        <input
                                                            className="Date"
                                                            value={
                                                                state['date_' + item.key] ||
                                                                'Pick a date'
                                                            }
                                                        />
                                                        <DatePicker
                                                            onChange={handleDate(item.key)}
                                                            value={state[item.key]}
                                                        />
                                                    </div>
                                                )}
                                                {item.input.type === 'select' && (
                                                    <DropdownButton
                                                        bsStyle="default"
                                                        title={
                                                            (item.input.labelKey
                                                                ? state['dropdown_' + item.key]
                                                                : state[item.key]) ||
                                                            `Choose ${item.label}`
                                                        }
                                                        onSelect={handleDropdown(
                                                            item.key,
                                                            item.input
                                                        )}
                                                    >
                                                        {item.input.key
                                                            ? data[item.input.data].map(opt => (
                                                                  <MenuItem
                                                                      eventKey={opt[item.input.key]}
                                                                  >
                                                                      {opt[item.input.labelKey]}
                                                                  </MenuItem>
                                                              ))
                                                            : data[item.input.data].map(
                                                                  (opt, index) => (
                                                                      <MenuItem
                                                                          eventKey={opt}
                                                                          key={index}
                                                                      >
                                                                          {opt}
                                                                      </MenuItem>
                                                                  )
                                                              )}
                                                    </DropdownButton>
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

const renderText = (data, tag = 'div') => {
    return `<${tag}>${Number(data) ? addCommas(data) : data}</${tag}>`;
};

const addCommas = intNum => {
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
};
