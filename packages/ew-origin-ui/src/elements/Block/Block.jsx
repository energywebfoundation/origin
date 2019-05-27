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

import React, { Component } from 'react';
import { ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';

import './Block.scss';

class Block extends Component {
    constructor(props) {
        super(props);

        this.state = {
            itemData: {}
        };
    }

    onItemChange = index => {
        return ((k, e) => {
            const { itemData } = this.state;
            itemData[index] = k;
            this.setState({ itemData });
        }).bind(this);
    };

    render() {
        const { data } = this.props;
        const { button, items } = data;
        const { itemData } = this.state;

        return (
            <div className="BlockWrapper">
                <div className="BlockHeader">
                    <div>{data.title}</div>
                    <img src={data.icon} className="Icon" />
                </div>
                <div className="BlockItems">
                    {items.map((item, index) => {
                        return (
                            <div class={`BlockItem --${item.type}`}>
                                <div class="Label">{item.label}:</div>
                                <div class="Content">
                                    {item.type === 'label' && <div>{item.content}</div>}
                                    {item.type === 'select' && (
                                        <DropdownButton
                                            bsStyle="default"
                                            title={item.content[itemData[index]] || 'Default'}
                                            onSelect={this.onItemChange(index)}
                                        >
                                            {item.content.map((opt, index) => {
                                                return <MenuItem eventKey={index}>{opt}</MenuItem>;
                                            })}
                                        </DropdownButton>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="BlockButton" onClick={button.action} style={button.styles}>
                    {button.text}
                </div>
            </div>
        );
    }
}

export default Block;
