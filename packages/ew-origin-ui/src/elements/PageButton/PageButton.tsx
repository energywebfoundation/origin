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
import { DropdownButton, MenuItem } from 'react-bootstrap';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import datepick from '../../../assets/datepick.svg';
import plus from '../../../assets/plus.svg';
import '../Block/Block.scss';
import './PageButton.scss';

export class PageButton extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            itemData: null
        };

        this.handleDateRange = this.handleDateRange.bind(this);
    }

    handleDateRange(range) {
        this.setState({ itemData: range });
    }

    onItemChange = index => {
        const {
            data: { content }
        } = this.props;
        this.setState({ itemData: content[index] });
    }

    withDropdown = ary => {
        const ret = ary.map(item => `dropdown-${item}`);

        return ret.join(' ');
    }

    render() {
        const { data, onFilterOrganization } = this.props;
        const { type, label, face, content, onClick } = data;
        const { itemData } = this.state;

        return (
            <div className={`ButtonWrapper Button--${type}`}>
                {type === 'dropdown' ? (
                    <DropdownButton
                        id="org_dropddown"
                        bsStyle="default"
                        title={itemData || label}
                        onSelect={this.onItemChange}
                        className={this.withDropdown(face)}
                    >
                        {content.map((opt, index) => {
                            return (
                                <MenuItem
                                    id={'org_dropdown_' + index}
                                    key={index}
                                    onClick={() => onFilterOrganization(index)}
                                    eventKey={index}
                                >
                                    {opt}
                                </MenuItem>
                            );
                        })}
                    </DropdownButton>
                ) : type === 'date-range' ? (
                    <DropdownButton
                        bsStyle="default"
                        id="date_filter_dropddown"
                        title={
                            <div className="DateRangeTitle">
                                <div className="DateLabel StartDate">
                                    <img src={datepick as any} />
                                    {itemData
                                        ? moment(itemData.startDate).format('DD MMM YY')
                                        : 'Select'}
                                </div>
                                <div className="DateLabel EndDate">
                                    {itemData
                                        ? moment(itemData.endDate).format('DD MMM YY')
                                        : 'Select'}
                                    <img src={plus as any} />
                                </div>
                            </div>
                        }
                        className={'DateRange'}
                    >
                        <DateRange onInit={this.handleDateRange} onChange={this.handleDateRange} />
                    </DropdownButton>
                ) : type === 'button' ? (
                    <button
                        onClick={onClick}
                        className={'btn btn-default'}
                    >{label}</button>
                ) : (
                    <div>Unknown Type</div>
                )}
            </div>
        );
    }
}
