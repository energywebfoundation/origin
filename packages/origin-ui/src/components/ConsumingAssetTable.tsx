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
import { User } from '@energyweb/user-registry';
import { Redirect } from 'react-router-dom';
import { ITableHeaderData } from './Table/Table';
import TableUtils from './Table/TableUtils';
import { Configuration } from '@energyweb/utils-general';
import { ConsumingAsset } from '@energyweb/asset-registry';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import {
    IPaginatedLoaderFilteredState,
    getInitialPaginatedLoaderFilteredState,
    FILTER_SPECIAL_TYPES,
    RECORD_INDICATOR,
    PaginatedLoaderFiltered
} from './Table/PaginatedLoaderFiltered';
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import { AdvancedTable } from './Table/AdvancedTable';
import { getConsumingAssetDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getConfiguration, getConsumingAssets, getBaseURL } from '../features/selectors';

interface IStateProps {
    configuration: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
    baseURL: string;
}

interface IConsumingAssetTableState extends IPaginatedLoaderFilteredState {
    detailViewForAssetId: number;
}

interface IEnrichedConsumingAssetData {
    asset: ConsumingAsset.Entity;
    organizationName: string;
}

class ConsumingAssetTableClass extends PaginatedLoaderFiltered<
    IStateProps,
    IConsumingAssetTableState
> {
    constructor(props: IStateProps) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForAssetId: null
        };

        this.operationClicked = this.operationClicked.bind(this);
    }

    filters: ICustomFilterDefinition[] = [
        {
            property: `${FILTER_SPECIAL_TYPES.COMBINE}::${RECORD_INDICATOR}asset.offChainProperties.facilityName::${RECORD_INDICATOR}organizationName`,
            label: 'Search',
            input: {
                type: CustomFilterInputType.string
            },
            search: true
        }
    ];

    async getPaginatedData({
        pageSize,
        offset,
        filters
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const assets = this.props.consumingAssets;
        const enrichedAssetData = await this.enrichedConsumingAssetData(assets);

        const filteredEnrichedAssetData = enrichedAssetData.filter(record =>
            this.checkRecordPassesFilters(record, filters)
        );

        const total = filteredEnrichedAssetData.length;

        const paginatedData = filteredEnrichedAssetData.slice(offset, offset + pageSize);

        const formattedPaginatedData = paginatedData.map(enrichedRecordData => {
            const asset = enrichedRecordData.asset;

            return [
                asset.id,
                enrichedRecordData.organizationName,
                asset.offChainProperties.facilityName,
                asset.offChainProperties.city + ', ' + asset.offChainProperties.country,
                asset.offChainProperties.capacityWh
                    ? (asset.offChainProperties.capacityWh / 1000).toLocaleString()
                    : '-',
                (asset.lastSmartMeterReadWh / 1000).toLocaleString(),
                (asset.certificatesUsedForWh / 1000).toLocaleString()
            ];
        });

        return {
            formattedPaginatedData,
            paginatedData,
            total
        };
    }

    async componentDidUpdate(newProps: IStateProps) {
        if (newProps.consumingAssets !== this.props.consumingAssets) {
            await this.loadPage(1);
        }
    }

    async enrichedConsumingAssetData(
        consumingAssets: ConsumingAsset.Entity[]
    ): Promise<IEnrichedConsumingAssetData[]> {
        const promises = consumingAssets.map(async (asset: ConsumingAsset.Entity) => ({
            asset,
            organizationName: (await new User.Entity(asset.owner.address, this.props
                .configuration as any).sync()).organization
        }));

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
                    to={getConsumingAssetDetailLink(
                        this.props.baseURL,
                        this.state.detailViewForAssetId
                    )}
                />
            );
        }

        const defaultWidth = 106;
        const generateHeader = TableUtils.generateHeader;
        const generateFooter = TableUtils.generateFooter;

        const TableHeader: ITableHeaderData[] = [
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
                <AdvancedTable
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    operationClicked={this.operationClicked}
                    data={this.state.formattedPaginatedData}
                    operations={operations}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                    filters={this.filters}
                />
            </div>
        );
    }
}

export const ConsumingAssetTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        consumingAssets: getConsumingAssets(state),
        baseURL: getBaseURL(state)
    })
)(ConsumingAssetTableClass);
