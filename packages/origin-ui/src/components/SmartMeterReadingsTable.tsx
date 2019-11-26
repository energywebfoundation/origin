import React, { useEffect } from 'react';
import moment from 'moment-timezone';
import { ProducingAsset } from '@energyweb/asset-registry';
import { TableMaterial } from './Table/TableMaterial';
import {
    usePaginatedLoader,
    IPaginatedLoaderHooksFetchDataParameters
} from './Table/PaginatedLoaderHooks';

interface IProps {
    producingAsset: ProducingAsset.Entity;
}

type TRecord = [string, number];

export function SmartMeterReadingsTable(props: IProps) {
    const { producingAsset } = props;

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        const readings = await producingAsset.getSmartMeterReads();
        const assetTimezone = producingAsset.offChainProperties.timezone;

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
            paginatedData: data.reverse().slice(offset, offset + requestedPageSize),
            total: readings.length
        };
    }

    const { loadPage, total, pageSize, paginatedData } = usePaginatedLoader<TRecord>({
        initialPageSize: 10,
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [producingAsset]);

    const columns = [
        { id: 'time', label: `Time (${producingAsset.offChainProperties.timezone})` },
        { id: 'value', label: 'Smart Meter Value' }
    ] as const;

    const rows = paginatedData.map(data => ({
        time: data[0],
        value: data[1].toLocaleString()
    }));

    return (
        <TableMaterial
            columns={columns}
            rows={rows}
            loadPage={loadPage}
            total={total}
            pageSize={pageSize}
        />
    );
}
