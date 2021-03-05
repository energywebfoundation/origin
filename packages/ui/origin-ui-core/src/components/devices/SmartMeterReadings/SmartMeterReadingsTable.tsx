import React, { useEffect } from 'react';
import { BigNumber } from 'ethers';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { TableMaterial } from '../../Table/TableMaterial';
import {
    usePaginatedLoader,
    IPaginatedLoaderHooksFetchDataParameters
} from '../../Table/PaginatedLoaderHooks';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { formatDate } from '../../../utils/time';
import { IOriginDevice } from '../../../types';

interface IProps {
    device: IOriginDevice;
}

type TRecord = [string, number];

export function SmartMeterReadingsTable(props: IProps) {
    const { device } = props;
    const { t } = useTranslation();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        const readings = device.smartMeterReads;
        const deviceTimezone = device.timezone;

        const data = [];
        let currentSmartMeterState = BigNumber.from(0);

        for (let i = 0; i < readings.length; i++) {
            currentSmartMeterState = currentSmartMeterState.add(readings[i].meterReading);

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
    }, [device]);

    const columns = [
        {
            id: 'time',
            label: t('meterReads.properties.time', {
                timezone: device.timezone
            })
        },
        {
            id: 'value',
            label: t('meterReads.properties.meterValue', { unit: EnergyFormatter.displayUnit })
        }
    ] as const;

    const rows = paginatedData.map((data) => ({
        time: data[0],
        value: EnergyFormatter.format(BigNumber.from(data[1]))
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
