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
import { Table } from './Table/Table';
import TableUtils from './Table/TableUtils';
import { Configuration } from 'ew-utils-general-lib';
import { Demand } from 'ew-market-lib';
import { ConsumingAsset } from 'ew-asset-registry-lib';
import { IPaginatedLoaderState, PaginatedLoader, DEFAULT_PAGE_SIZE, getInitialPaginatedLoaderState } from './Table/PaginatedLoader';

export interface ConsumingAssetTableProps {
    conf: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
    demands: Demand.Entity[];
    certificates: Certificate.Entity[];
    currentUser: User;
    baseUrl: string;
    switchedToOrganization: boolean;
}

export interface IConsumingAssetTableState extends IPaginatedLoaderState {
    detailViewForAssetId: number;
    switchedToOrganization: boolean;
}

export interface IEnrichedConsumingAssetData {
    consumingAsset: ConsumingAsset.Entity;
    organizationName: string;
}

export class ConsumingAssetTable extends PaginatedLoader<ConsumingAssetTableProps, IConsumingAssetTableState> {
    constructor(props: ConsumingAssetTableProps) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderState(),
            detailViewForAssetId: null,
            switchedToOrganization: false
        };

        this.switchToOrganization = this.switchToOrganization.bind(this);
        this.operationClicked = this.operationClicked.bind(this);
    }

    switchToOrganization(switchedToOrganization: boolean): void {
        this.setState({
            switchedToOrganization
        });
    }

    async getPaginatedData({ pageSize, offset }) {
        const consumingAssets: ConsumingAsset.Entity[] = this.props.consumingAssets;
        const enrichedConsumingAssetData = await this.enrichedConsumingAssetData(consumingAssets);

        const filteredEnrichedAssetData = enrichedConsumingAssetData.filter(
            (enrichedConsumingAssetData: IEnrichedConsumingAssetData) =>
                !this.props.switchedToOrganization ||
                enrichedConsumingAssetData.consumingAsset.owner.address ===
                    this.props.currentUser.id
        );

        const total = filteredEnrichedAssetData.length;

        const paginatedData = filteredEnrichedAssetData.slice(offset, offset + pageSize);

        const formattedPaginatedData = paginatedData.map(
            (enrichedConsumingAssetData: IEnrichedConsumingAssetData) => {
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
        
        return {
            formattedPaginatedData,
            paginatedData,
            total
        };
    }

    async componentDidUpdate(newProps: ConsumingAssetTableProps) {
        if (newProps.consumingAssets !== this.props.consumingAssets) {
            await this.loadPage(1);
        }
    }

    async enrichedConsumingAssetData(consumingAssets: ConsumingAsset.Entity[]): Promise<IEnrichedConsumingAssetData[]> {
        const promises = consumingAssets.map(
            async (consumingAsset: ConsumingAsset.Entity) => ({
                consumingAsset,
                organizationName: (await new User(
                    consumingAsset.owner.address,
                    this.props.conf as any
                ).sync()).organization
            })
        );

        return Promise.all(promises);
    }

    operationClicked(id: number): void {
        this.setState({
            detailViewForAssetId: id
        });
    }

    render(): JSX.Element {
        if (this.state.detailViewForAssetId !== null) {
            return (
                <Redirect
                    push={true}
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

        const operations = ['Show Details'];

        return (
            <div className="ConsumptionWrapper">
                <Table
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    operationClicked={this.operationClicked}
                    data={this.state.formattedPaginatedData}
                    operations={operations}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                />
            </div>
        );
    }
}
