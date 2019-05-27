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
import { Nav } from 'react-bootstrap';
import FadeIn from 'react-fade-in';
import renderHTML from 'react-render-html';

import '../../assets/common.scss';
import './About.scss';

export class About extends React.Component<any, {}> {
    render() {
        return (
            <div className="PageWrapper">
                <div className="PageNav" />

                <div className="PageContentWrapper">
                    <div className="PageHeader">
                        <div className="PageTitle">About</div>
                    </div>
                    <div className="PageBody">
                        <div className="Line">
                            <p>
                                Origin, the first dApp running on the Energy Web, unlocks the
                                beginning of a new era for the world’s renewable energy and carbon
                                markets.
                                <br />
                                It records the provenance and automatically tracks the ownership of
                                renewably generated electricity
                                <br />
                                with unprecedented transparency, integrity, and detail—including
                                location, time, source type, and CO2 emissions
                            </p>

                            <p>
                                The result: lower costs and more enhanced transparency for
                                transactions, <br />
                                greater market access for buyers and generators of all sizes, and
                                new services built with Origin that run on the Energy Web.
                            </p>

                            <p>
                                Renewable energy generators and buyers can work with EWF over the
                                course of 2018
                                <br />
                                to run their own market demos showcasing how the Origin dApp works
                                and providing input to ensure it meets business needs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
