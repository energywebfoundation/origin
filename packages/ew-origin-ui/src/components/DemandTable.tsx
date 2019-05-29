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
import FadeIn from 'react-fade-in';
import { NavLink, withRouter } from 'react-router-dom';

import { Configuration, TimeFrame, Compliance, AssetType } from 'ew-utils-general-lib';
import { ProducingAsset, ConsumingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';

import { OrganizationFilter } from './OrganizationFilter';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';

export interface IDemandTableProps {
    conf: Configuration.Entity;
    demands: Demand.Entity[];
    producingAssets: ProducingAsset.Entity[];
    consumingAssets: ConsumingAsset.Entity[];
    currentUser: User;
    switchedToOrganization: boolean;
    baseUrl: string;
}

export interface IDemandTableState {
    enrichedDemandData: IEnrichedDemandData[];
}

export interface IEnrichedDemandData {
    demand: Demand.Entity;
    buyer: User;
    originator: User;
}

export const PeriodToSeconds = [31536000, 2592000, 86400, 3600];

export class DemandTable extends React.Component<IDemandTableProps, {}> {
    state: IDemandTableState;

    constructor(props) {
        super(props);

        this.state = {
            enrichedDemandData: []
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
    }

    switchToOrganization(switchedToOrganization: boolean) {
        this.setState({
            switchedToOrganization
        });
    }

    async componentDidMount() {
        await this.enrichData(this.props);
    }

    async componentWillReceiveProps(newProps: IDemandTableProps) {
        await this.enrichData(newProps);
    }

    async enrichData(props: IDemandTableProps) {
        const promises = props.demands.map(async (demand: Demand.Entity, index: number) => ({
            demand,
            producingAsset: this.props.producingAssets.find(
                (asset: ProducingAsset.Entity) =>
                    asset.id === demand.offChainProperties.productingAsset.toString()
            ),
            consumingAsset: this.props.consumingAssets.find(
                (asset: ConsumingAsset.Entity) =>
                    asset.id === demand.offChainProperties.consumingAsset.toString()
            )
            // buyer: await (new User(demand.offChainProperties.buyer, props.conf)).sync(),
        }));

        Promise.all(promises).then(enrichedDemandData => this.setState({ enrichedDemandData }));
    }

    render() {
        const total = null;
        let totalDemand = 0;

        // const filteredEnrichedDemandData = this.state.enrichedDemandData.filter((enrichedDemandData: IEnrichedDemandData) => {
        //     return !this.props.switchedToOrganization || enrichedDemandData.demand.offChainProperties.buyer === this.props.currentUser || (enrichedDemandData.demand.getBitFromDemandMask(DemandProperties.Originator) && enrichedDemandData.demand.offChainProperties.originator === this.props.currentUser);
        // });

        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 10
            },
            generateFooter('Energy Demand (kWh)', true)
        ];

        const data = this.state.enrichedDemandData.map(
            (enrichedDemandData: IEnrichedDemandData) => {
                const demand = enrichedDemandData.demand;
                // const overallDemand =
                //     Math.ceil(
                //         (demand.offChainProperties.endTime - demand.offChainProperties.startTime) /
                //             PeriodToSeconds[demand.offChainProperties.timeframe]
                //     ) *
                //     (demand.offChainProperties.targetWhPerPeriod / 1000);
                // totalDemand += overallDemand;

                return [
                    demand.id,
                    enrichedDemandData.buyer.organization,
                    enrichedDemandData.originator.organization,
                    // `${new Date(demand.startTime * 1000).toDateString()} - ${new Date(
                    //     demand.offChainProperties.endTime * 1000
                    // ).toDateString()}`,
                    `${demand.offChainProperties.locationCountry} ${
                        demand.offChainProperties.locationRegion
                    }`,
                    AssetType[demand.offChainProperties.assettype],
                    Compliance[demand.offChainProperties.registryCompliance],
                    TimeFrame[demand.offChainProperties.timeframe],
                    demand.offChainProperties.productingAsset,
                    demand.offChainProperties.consumingAsset,
                    demand.offChainProperties.minCO2Offset.toFixed(3),
                    (demand.offChainProperties.targetWhPerPeriod / 1000).toFixed(3),
                    // overallDemand.toFixed(3)
                ];
            }
        );

        const TableHeader = [
            generateHeader('#'),
            generateHeader('Buyer'),
            generateHeader('Originating Address'),
            // generateHeader('Start/End-Date'),
            generateHeader('Country,<br/>Region'),
            generateHeader('Asset Type'),
            generateHeader('Compliance'),
            generateHeader('Coupling Timeframe'),
            generateHeader('Production Coupling with Asset'),
            generateHeader('Consumption Coupling with Asset'),
            generateHeader('Min CO2 Offset'),
            generateHeader('Coupling Cap per Timeframe (kWh)'),
            // generateHeader('Energy Demand (kWh)', defaultWidth, true, true)
        ];

        return (
            <div className="ForSaleWrapper">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    data={data}
                    actionWidth={55.39}
                />
            </div>
        );
    }
}
