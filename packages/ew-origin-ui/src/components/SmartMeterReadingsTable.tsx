import * as React from 'react';
import moment from 'moment';

import { Configuration } from 'ew-utils-general-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';

import './SmartMeterReadingsTable.scss';
import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { IPaginatedLoaderState, PaginatedLoader, IPaginatedLoaderFetchDataParameters, IPaginatedLoaderFetchDataReturnValues } from '../elements/Table/PaginatedLoader';

export interface ISmartMeterReadingsTableProps {
    conf: Configuration.Entity;
    producingAsset: ProducingAsset.Entity;
}

export class SmartMeterReadingsTable extends PaginatedLoader<ISmartMeterReadingsTableProps, IPaginatedLoaderState> {
    constructor(props: ISmartMeterReadingsTableProps) {
        super(props);

        this.state = {
            formattedPaginatedData: [],
            paginatedData: [],
            total: 0,
            pageSize: 10
        };
    }

    async getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const readings = (await this.props.producingAsset.getSmartMeterReads());

        const data = [];
        let currentSmartMeterState = 0;

        for (let i = 0; i < readings.length; i++) {
            currentSmartMeterState += readings[i].energy;

            data.push([
                i,
                moment.unix(readings[i].timestamp).format('DD MMM YY, HH:mm'),
                currentSmartMeterState
            ]);
        }

        return {
            formattedPaginatedData: data.reverse().slice(offset, offset + pageSize),
            paginatedData: [],
            total: readings.length
        };
    }

    render() {
        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);

        const TableHeader = [
            generateHeader('#', 50),
            generateHeader('Time', 100),
            generateHeader('Smart Meter Value', 100, true),
        ];

        return (
            <div className="smartMeterReadingsTable">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    data={this.state.formattedPaginatedData}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                />
            </div>
        );
    }
}
