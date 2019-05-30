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

import { Configuration, TimeFrame, Compliance, AssetType } from 'ew-utils-general-lib';
import { ProducingAsset, ConsumingAsset } from 'ew-asset-registry-lib';
import { User } from 'ew-user-registry-lib';
import { Demand } from 'ew-market-lib';

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
    demandOwner: User;
    consumingAsset?: ConsumingAsset.Entity
    producingAsset?: ProducingAsset.Entity
}

export const PeriodToSeconds = [31536000, 2592000, 86400, 3600];

const NO_VALUE_TEXT = 'any';

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
        const promises = props.demands.map(async (demand: Demand.Entity) => {
            const result: IEnrichedDemandData = {
                demand,
                producingAsset: null,
                consumingAsset: null,
                demandOwner: await (new User(demand.demandOwner, props.conf)).sync()
            };


            if (typeof(demand.offChainProperties.productingAsset) !== 'undefined') {
                result.producingAsset = this.props.producingAssets.find(
                    (asset: ProducingAsset.Entity) =>
                        asset.id === demand.offChainProperties.productingAsset.toString()
                );
            }

            if (typeof(demand.offChainProperties.consumingAsset) !== 'undefined') {
                result.consumingAsset = this.props.consumingAssets.find(
                    (asset: ConsumingAsset.Entity) =>
                        asset.id === demand.offChainProperties.consumingAsset.toString()
                )
            }

            return result;
        });

        Promise.all(promises).then(enrichedDemandData => this.setState({ enrichedDemandData }));
    }

    getCountryRegionText(demand: Demand.Entity): string {
        let text = '';

        if (demand.offChainProperties.locationCountry) {
            text += demand.offChainProperties.locationCountry;
        }

        if (demand.offChainProperties.locationRegion) {
            text += `, ${demand.offChainProperties.locationRegion}`;
        }

        return text || NO_VALUE_TEXT;
    }

    render() {
        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 9
            },
            generateFooter('Energy Demand (kWh)', true)
        ];

        const data = this.state.enrichedDemandData.map(
            (enrichedDemandData: IEnrichedDemandData) => {
                const demand = enrichedDemandData.demand;

                return [
                    demand.id,
                    enrichedDemandData.demandOwner.organization,
                    this.getCountryRegionText(demand),
                    typeof(demand.offChainProperties.assettype) !== 'undefined' ? AssetType[demand.offChainProperties.assettype] : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.registryCompliance) !== 'undefined' ? Compliance[demand.offChainProperties.registryCompliance] : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.timeframe) !== 'undefined' ? TimeFrame[demand.offChainProperties.timeframe] : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.productingAsset) !== 'undefined' ? demand.offChainProperties.productingAsset : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.consumingAsset) !== 'undefined' ? demand.offChainProperties.consumingAsset : NO_VALUE_TEXT,
                    typeof(demand.offChainProperties.minCO2Offset) !== 'undefined' ? demand.offChainProperties.minCO2Offset.toLocaleString() : 0,
                    (demand.offChainProperties.targetWhPerPeriod / 1000).toLocaleString()
                ];
            }
        );

        const TableHeader = [
            generateHeader('#'),
            generateHeader('Buyer'),
            generateHeader('Country,<br/>Region'),
            generateHeader('Asset Type'),
            generateHeader('Compliance'),
            generateHeader('Coupling Timeframe'),
            generateHeader('Production Coupling with Asset'),
            generateHeader('Consumption Coupling with Asset'),
            generateHeader('Min CO2 Offset'),
            generateHeader('Coupling Cap per Timeframe (kWh)')
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
