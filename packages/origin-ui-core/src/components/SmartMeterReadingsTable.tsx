import React, { useEffect } from 'react';
import moment from 'moment-timezone';
import { ProducingDevice } from '@energyweb/device-registry';
import { TableMaterial } from './Table/TableMaterial';
import {
    usePaginatedLoader,
    IPaginatedLoaderHooksFetchDataParameters
} from './Table/PaginatedLoaderHooks';
import { EnergyFormatter } from '../utils/EnergyFormatter';
import { formatDate } from '../utils/helper';
import { ISmartMeterReadingsAdapter } from '../types';
import { useTranslation } from 'react-i18next';

interface IProps {
    producingDevice: ProducingDevice.Entity;
    smartMeterReadingsAdapter: ISmartMeterReadingsAdapter;
}

type TRecord = [string, number];

export function SmartMeterReadingsTable(props: IProps) {
    const { producingDevice, smartMeterReadingsAdapter } = props;
    const { t } = useTranslation();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        const readings = await smartMeterReadingsAdapter.getSmartMeterReads(producingDevice);
        const deviceTimezone = producingDevice.offChainProperties.timezone;

        const data = [];
        let currentSmartMeterState = 0;

        for (let i = 0; i < readings.length; i++) {
            currentSmartMeterState += readings[i].energy;

            data.push([
                formatDate(moment.unix(readings[i].timestamp).tz(deviceTimezone), true),
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
        {
            id: 'time',
            label: t('meterReads.properties.time', {
                timezone: producingDevice.offChainProperties.timezone
            })
        },
        {
            id: 'value',
            label: t('meterReads.properties.meterValue', { unit: EnergyFormatter.displayUnit })
        }
    ] as const;

    const rows = paginatedData.map(data => ({
        time: data[0],
        value: EnergyFormatter.format(data[1])
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
