// Copyright 2018 Energy Web Foundation
//
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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as React from 'react'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import * as EwUser from 'ew-user-registry-lib';

export interface OrganizationFilterProps {
    currentUser: EwUser.User;
    switchedToOrganization: boolean;
    switchToOrganization: Function;

}

export class OrganizationFilter extends React.Component<OrganizationFilterProps, {}> {

    render() {

        return <div className='org-filter btn-group btn-group-toggle' data-toggle='buttons'>
            <label onClick={() => this.props.switchToOrganization(false)} className={'btn btn-secondary' + (!this.props.switchedToOrganization ? ' active' : '')}>
                <input type='radio' name='options' /> All
                    </label>
            {this.props.currentUser ?
                <label onClick={() => this.props.switchToOrganization(true)} className={'btn btn-secondary' + (this.props.switchedToOrganization ? ' active' : '')}>
                    <input type='radio' name='options' /> {this.props.currentUser.organization}
                </label>
                : null}
        </div>
    }

}