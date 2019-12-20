import React, { useEffect } from 'react';
import moment from 'moment-timezone';
import { ProducingDevice } from '@energyweb/device-registry';
import { TableMaterial } from './Table/TableMaterial';
import {
    usePaginatedLoader,
    IPaginatedLoaderHooksFetchDataParameters
} from './Table/PaginatedLoaderHooks';

interface IProps {
    producingDevice: ProducingDevice.Entity;
}

type TRecord = [string, number];

export function SmartMeterReadingsTable(props: IProps) {
    const { producingDevice } = props;

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        const readings = await producingDevice.getSmartMeterReads();
        const deviceTimezone = producingDevice.offChainProperties.timezone;

        const data = [];
        let currentSmartMeterState = 0;

        for (let i = 0; i < readings.length; i++) {
            currentSmartMeterState += readings[i].energy;

            data.push([
                moment
                    .unix(readings[i].timestamp)
                    .tz(deviceTimezone)
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
        let isMounted = true;

        const checkIsMounted = () => isMounted;

        loadPage(1, null, checkIsMounted);

        return () => {
            isMounted = false;
        };
    }, [producingDevice]);

    const columns = [
        { id: 'time', label: `Time (${producingDevice.offChainProperties.timezone})` },
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
