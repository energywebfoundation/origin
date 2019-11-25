import React from 'react';
import { MarketUser } from '@energyweb/market';
import { Redirect } from 'react-router-dom';
import { Configuration } from '@energyweb/utils-general';
import { ConsumingAsset } from '@energyweb/asset-registry';
import {
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues
} from './Table/PaginatedLoader';
import {
    IPaginatedLoaderFilteredState,
    getInitialPaginatedLoaderFilteredState,
    PaginatedLoaderFiltered
} from './Table/PaginatedLoaderFiltered';
import { ICustomFilterDefinition, CustomFilterInputType } from './Table/FiltersHeader';
import { getConsumingAssetDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getConfiguration, getConsumingAssets, getBaseURL } from '../features/selectors';
import { TableMaterial } from './Table/TableMaterial';

interface IStateProps {
    configuration: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
    baseURL: string;
}

interface IEnrichedConsumingAssetData {
    asset: ConsumingAsset.Entity;
    organizationName: string;
}

interface IConsumingAssetTableState extends IPaginatedLoaderFilteredState {
    detailViewForAssetId: string;
    paginatedData: IEnrichedConsumingAssetData[];
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
    }

    viewAsset(rowIndex: number) {
        const asset = this.state.paginatedData[rowIndex].asset;

        this.setState({
            detailViewForAssetId: asset.id
        });
    }

    filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedConsumingAssetData) =>
                `${record?.asset?.offChainProperties?.facilityName}${record?.organizationName}`,
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

        return {
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
            organizationName: (
                await new MarketUser.Entity(
                    asset.owner.address,
                    this.props.configuration as any
                ).sync()
            ).organization
        }));

        return Promise.all(promises);
    }

    columns = [
        { id: 'owner', label: 'Owner' },
        { id: 'facilityName', label: 'Facility name' },
        { id: 'townCountry', label: 'Town, country' },
        { id: 'capacity', label: 'Nameplate capacity (kW)' },
        { id: 'consumption', label: 'Consumption (kWh)' }
    ] as const;

    get rows() {
        return this.state.paginatedData.map(({ asset, organizationName }) => {
            const consumption =
                typeof asset.lastSmartMeterReadWh === 'number'
                    ? (asset.lastSmartMeterReadWh / 1000).toLocaleString()
                    : '-';

            return {
                owner: organizationName,
                facilityName: asset.offChainProperties.facilityName,
                townCountry:
                    asset.offChainProperties.address + ', ' + asset.offChainProperties.country,
                capacity: asset.offChainProperties.capacityWh
                    ? (asset.offChainProperties.capacityWh / 1000).toLocaleString()
                    : '-',
                consumption
            };
        });
    }

    render(): JSX.Element {
        const { detailViewForAssetId, total, pageSize } = this.state;

        if (detailViewForAssetId !== null) {
            return (
                <Redirect
                    push={true}
                    to={getConsumingAssetDetailLink(this.props.baseURL, detailViewForAssetId)}
                />
            );
        }

        return (
            <div className="ConsumptionWrapper">
                <TableMaterial
                    columns={this.columns}
                    rows={this.rows}
                    loadPage={this.loadPage}
                    total={total}
                    pageSize={pageSize}
                    filters={this.filters}
                    handleRowClick={(row: number) => this.viewAsset(row)}
                />
            </div>
        );
    }
}

export const ConsumingAssetTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        consumingAssets: getConsumingAssets(state),
        baseURL: getBaseURL()
    })
)(ConsumingAssetTableClass);
