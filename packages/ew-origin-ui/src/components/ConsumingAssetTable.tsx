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
import { Certificate } from 'ew-origin-lib';
import { User } from 'ew-user-registry-lib';
import { Redirect } from 'react-router-dom';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { Configuration } from 'ew-utils-general-lib';
import { Demand } from 'ew-market-lib';
import { ConsumingAsset } from 'ew-asset-registry-lib';

export interface ConsumingAssetTableProps {
    conf: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
    demands: Demand.Entity[];
    certificates: Certificate.Entity[];
    currentUser: User;
    baseUrl: string;
    switchedToOrganization: boolean;
}

export interface ConsumingAssetTableState {
    enrichedConsumingAssetData: EnrichedConsumingAssetData[];
    detailViewForAssetId: number;
}

export interface EnrichedConsumingAssetData {
    consumingAsset: ConsumingAsset.Entity;
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
            switchedToOrganization
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

        const promieses = props.consumingAssets.map(
            async (consumingAsset: ConsumingAsset.Entity, index: number) => ({
                consumingAsset,
                organizationName: (await new User(
                    consumingAsset.owner.address,
                    props.conf as any
                ).sync()).organization
            })
        );

        Promise.all(promieses).then(enrichedConsumingAssetData =>
            this.setState({
                enrichedConsumingAssetData
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
            return (
                <Redirect
                    push
                    to={
                        '/' +
                        this.props.baseUrl +
                        '/assets/consuming_detail_view/' +
                        this.state.detailViewForAssetId
                    }
                />
            );
        }

        const defaultWidth = 106;
        const generateHeader = TableUtils.generateHeader;
        const generateFooter = TableUtils.generateFooter;

        const TableHeader = [
            generateHeader('#', 60),
            generateHeader('Owner'),
            generateHeader('Facility Name'),
            generateHeader('Town, Country'),
            generateHeader('Nameplate Capacity (kW)', defaultWidth, true),
            generateHeader('Consumption (kWh)', defaultWidth, true)
        ];

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: 5
            },
            generateFooter('Consumption (kWh)')
        ];

        const filteredEnrichedAssetData = this.state.enrichedConsumingAssetData.filter(
            (enrichedConsumingAssetData: EnrichedConsumingAssetData) =>
                !this.props.switchedToOrganization ||
                enrichedConsumingAssetData.consumingAsset.owner.address ===
                    this.props.currentUser.id
        );

        const operations = ['Show Details'];

        const data = filteredEnrichedAssetData.map(
            (enrichedConsumingAssetData: EnrichedConsumingAssetData) => {
                const consumingAsset: ConsumingAsset.Entity =
                    enrichedConsumingAssetData.consumingAsset;

                return [
                    consumingAsset.id,
                    enrichedConsumingAssetData.organizationName,
                    consumingAsset.offChainProperties.facilityName,
                    consumingAsset.offChainProperties.city +
                        ', ' +
                        consumingAsset.offChainProperties.country,
                    consumingAsset.offChainProperties.capacityWh
                        ? (consumingAsset.offChainProperties.capacityWh / 1000).toLocaleString()
                        : '-',
                    (consumingAsset.lastSmartMeterReadWh / 1000).toLocaleString(),
                    (consumingAsset.certificatesUsedForWh / 1000).toLocaleString()
                ];
            }
        );

        return (
            <div className="ConsumptionWrapper">
                <Table
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    operationClicked={this.operationClicked}
                    data={data}
                    operations={operations}
                />
            </div>
        );
    }
}
