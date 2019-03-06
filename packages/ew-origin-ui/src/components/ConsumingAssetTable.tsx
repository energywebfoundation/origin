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

import * as React from 'react'
import * as General from 'ew-utils-general-lib';
import * as OriginIssuer from 'ew-origin-lib';
import * as Market from 'ew-market-lib';
import * as EwUser from 'ew-user-registry-lib';
import * as EwAsset from 'ew-asset-registry-lib';
import { OrganizationFilter } from './OrganizationFilter';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';

export interface ConsumingAssetTableProps {
    conf: General.Configuration.Entity;
    consumingAssets: EwAsset.ConsumingAsset.Entity[];
    demands: Market.Demand.Entity[];
    certificates: OriginIssuer.Certificate.Entity[];
    currentUser: EwUser.User;
    baseUrl: string;
    switchedToOrganization: boolean;
}

export interface ConsumingAssetTableState {
    enrichedConsumingAssetData: EnrichedConsumingAssetData[];
    detailViewForAssetId: number;

}

export interface EnrichedConsumingAssetData {
    consumingAsset: EwAsset.ConsumingAsset.Entity;
    organizationName: string;
}

export class ConsumingAssetTable extends React.Component<ConsumingAssetTableProps, {}> {

    state: ConsumingAssetTableState;

    constructor(props: ConsumingAssetTableProps) {
        super(props);

        this.state = {
            enrichedConsumingAssetData: [],
            detailViewForAssetId: null
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.operationClicked = this.operationClicked.bind(this);

    }

    switchToOrganization(switchedToOrganization: boolean): void {
        this.setState({
            switchedToOrganization: switchedToOrganization
        });
    }

    async componentDidMount(): Promise<void> {
        await this.getOrganizationNames(this.props);

    }

    async componentWillReceiveProps(newProps: ConsumingAssetTableProps): Promise<void> {
        await this.getOrganizationNames(newProps);
    }

    async getOrganizationNames(props: ConsumingAssetTableProps): Promise<void> {

        const enrichedConsumingAssetData = [];

        const promieses = props.consumingAssets.map(async (consumingAsset: EwAsset.ConsumingAsset.Entity, index: number) =>
            ({
                consumingAsset: consumingAsset,
                organizationName: (await (new EwUser.User(consumingAsset.owner.address, props.conf as any)).sync()).organization
            })
        )

        Promise.all(promieses).then((enrichedConsumingAssetData) =>
            this.setState({
                enrichedConsumingAssetData: enrichedConsumingAssetData
            })
        );

    }

    operationClicked(key: string, id: number): void {
        this.setState({
            detailViewForAssetId: id
        });

      }

      render(): JSX.Element {
        if (this.state.detailViewForAssetId !== null) {
            return <Redirect push to={'/' + this.props.baseUrl + '/assets/consuming_detail_view/' + this.state.detailViewForAssetId} />;
        }

        const defaultWidth = 106;
        const getKey = TableUtils.getKey;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) => (TableUtils.generateHeader(label, width, right, body));
        const generateFooter = TableUtils.generateFooter;

        const TableHeader = [
            generateHeader('#', 145.98),
            generateHeader('Owner'),
            generateHeader('Town, Country'),
            generateHeader('Nameplate Capacity (kW)', defaultWidth, true),
            generateHeader('Consumption (kWh)', defaultWidth, true)
        ];

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 4
            },
            generateFooter('Consumption (kWh)')
        ];

        //  this.getCO2Offset()
        const accumulatorCb = (accumulator, currentValue) => accumulator + currentValue;

        const filteredEnrichedAssetData = this.state.enrichedConsumingAssetData
            .filter((enrichedConsumingAssetData: EnrichedConsumingAssetData) =>

                !this.props.switchedToOrganization ||
                enrichedConsumingAssetData.consumingAsset.owner.address === this.props.currentUser.id

            );
        let assets = null;
        let total;

        const operations = ['Show Details'];

        const data = filteredEnrichedAssetData.map((enrichedConsumingAssetData: EnrichedConsumingAssetData) => {
            const consumingAsset: EwAsset.ConsumingAsset.Entity = enrichedConsumingAssetData.consumingAsset;

            // const generatedKWh = consumingAsset.certificatesUsedForWh / 1000
            const consumedKWh: number = consumingAsset.certificatesUsedForWh / 1000;

            return [
                consumingAsset.id,
                enrichedConsumingAssetData.organizationName,
                consumingAsset.offChainProperties.city + ', ' + consumingAsset.offChainProperties.country,
                consumingAsset.offChainProperties.capacityWh ?
                (consumingAsset.offChainProperties.capacityWh / 1000).toFixed(3) : '-',
                (consumingAsset.lastSmartMeterReadWh / 1000).toFixed(3),
                (consumingAsset.certificatesUsedForWh / 1000).toFixed(3)
            ];
        });



        return <div className='ConsumptionWrapper'>
            <Table
                header={TableHeader}
                footer={TableFooter}
                actions={true}
                operationClicked={this.operationClicked}
                data={data}
                operations={operations}
            />
        </div>;


    }
}
