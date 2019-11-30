import React from 'react';
import { MarketUser } from '@energyweb/market';
import { Redirect } from 'react-router-dom';
import { Configuration } from '@energyweb/utils-general';
import { ConsumingDevice } from '@energyweb/asset-registry';
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
import { getConsumingDeviceDetailLink } from '../utils/routing';
import { connect } from 'react-redux';
import { IStoreState } from '../types';
import { getConfiguration, getConsumingDevices, getBaseURL } from '../features/selectors';
import { TableMaterial } from './Table/TableMaterial';

interface IStateProps {
    configuration: Configuration.Entity;
    consumingDevices: ConsumingDevice.Entity[];
    baseURL: string;
}

interface IEnrichedConsumingDeviceData {
    device: ConsumingDevice.Entity;
    organizationName: string;
}

interface IConsumingDeviceTableState extends IPaginatedLoaderFilteredState {
    detailViewForDeviceId: string;
    paginatedData: IEnrichedConsumingDeviceData[];
}

class ConsumingDeviceTableClass extends PaginatedLoaderFiltered<
    IStateProps,
    IConsumingDeviceTableState
> {
    constructor(props: IStateProps) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderFilteredState(),
            detailViewForDeviceId: null
        };
    }

    viewDevice(rowIndex: number) {
        const device = this.state.paginatedData[rowIndex].device;

        this.setState({
            detailViewForDeviceId: device.id
        });
    }

    filters: ICustomFilterDefinition[] = [
        {
            property: (record: IEnrichedConsumingDeviceData) =>
                `${record?.device?.offChainProperties?.facilityName}${record?.organizationName}`,
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
        const devices = this.props.consumingDevices;
        const enrichedDeviceData = await this.enrichedConsumingDeviceData(devices);

        const filteredEnrichedDeviceData = enrichedDeviceData.filter(record =>
            this.checkRecordPassesFilters(record, filters)
        );

        const total = filteredEnrichedDeviceData.length;

        const paginatedData = filteredEnrichedDeviceData.slice(offset, offset + pageSize);

        return {
            paginatedData,
            total
        };
    }

    async componentDidUpdate(newProps: IStateProps) {
        if (newProps.consumingDevices !== this.props.consumingDevices) {
            await this.loadPage(1);
        }
    }

    async enrichedConsumingDeviceData(
        consumingDevices: ConsumingDevice.Entity[]
    ): Promise<IEnrichedConsumingDeviceData[]> {
        const promises = consumingDevices.map(async (device: ConsumingDevice.Entity) => ({
            device,
            organizationName: (
                await new MarketUser.Entity(
                    device.owner.address,
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
        return this.state.paginatedData.map(({ device, organizationName }) => {
            const consumption =
                typeof device.lastSmartMeterReadWh === 'number'
                    ? (device.lastSmartMeterReadWh / 1000).toLocaleString()
                    : '-';

            return {
                owner: organizationName,
                facilityName: device.offChainProperties.facilityName,
                townCountry:
                    device.offChainProperties.address + ', ' + device.offChainProperties.country,
                capacity: device.offChainProperties.capacityWh
                    ? (device.offChainProperties.capacityWh / 1000).toLocaleString()
                    : '-',
                consumption
            };
        });
    }

    render(): JSX.Element {
        const { detailViewForDeviceId, total, pageSize } = this.state;

        if (detailViewForDeviceId !== null) {
            return (
                <Redirect
                    push={true}
                    to={getConsumingDeviceDetailLink(this.props.baseURL, detailViewForDeviceId)}
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
                    handleRowClick={(row: number) => this.viewDevice(row)}
                />
            </div>
        );
    }
}

export const ConsumingDeviceTable = connect(
    (state: IStoreState): IStateProps => ({
        configuration: getConfiguration(state),
        consumingDevices: getConsumingDevices(state),
        baseURL: getBaseURL()
    })
)(ConsumingDeviceTableClass);
