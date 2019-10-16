import * as React from 'react';
import moment from 'moment-timezone';

import { Configuration } from '@energyweb/utils-general';
import { ProducingAsset } from '@energyweb/asset-registry';
import {
    IPaginatedLoaderState,
    PaginatedLoader,
    IPaginatedLoaderFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    getInitialPaginatedLoaderState
} from './Table/PaginatedLoader';
import { TableMaterial } from './Table/TableMaterial';

interface IOwnProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

interface IState extends IPaginatedLoaderState {
    paginatedData: Array<[string, number]>;
}

export class SmartMeterReadingsTable extends PaginatedLoader<IOwnProps, IState> {
    constructor(props: IOwnProps) {
        super(props);

        this.state = {
            ...getInitialPaginatedLoaderState(),
            pageSize: 10
        };
    }

    async getPaginatedData({
        pageSize,
        offset
    }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const readings = await this.props.producingAsset.getSmartMeterReads();
        const assetTimezone = this.props.producingAsset.offChainProperties.timezone;

        const data = [];
        let currentSmartMeterState = 0;

        for (let i = 0; i < readings.length; i++) {
            currentSmartMeterState += readings[i].energy;

            data.push([
                moment
                    .unix(readings[i].timestamp)
                    .tz(assetTimezone)
                    .format('DD MMM YY, HH:mm'),
                currentSmartMeterState
            ]);
        }

        return {
            paginatedData: data.reverse().slice(offset, offset + pageSize),
            total: readings.length
        };
    }

    columns = [{ id: 'time', label: 'Time' }, { id: 'value', label: 'Smart Meter Value' }] as const;

    get rows() {
        return this.state.paginatedData.map(data => ({
            time: data[0],
            value: data[1].toLocaleString()
        }));
    }

    render() {
        return (
            <TableMaterial
                columns={this.columns}
                rows={this.rows}
                loadPage={this.loadPage}
                total={this.state.total}
                pageSize={this.state.pageSize}
            />
        );
    }
}
