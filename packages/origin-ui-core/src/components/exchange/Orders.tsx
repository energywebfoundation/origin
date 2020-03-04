import React, { useEffect } from 'react';
import { TableMaterial } from '../Table/TableMaterial';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoaderFiltered
} from '../Table/PaginatedLoaderHooks';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { Typography } from '@material-ui/core';
import { IOrderBookOrderDTO } from './order-book-order.dto';
import { useTranslation } from '../../utils';

interface IProps {
    data: IOrderBookOrderDTO[];
    currency: string;
    title: string;
    highlightOrdersUserId: string;
}

export function Orders(props: IProps) {
    const { currency, data, title, highlightOrdersUserId } = props;

    const { t } = useTranslation();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        let newPaginatedData = data;

        const newTotal = newPaginatedData.length;

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<
        IOrderBookOrderDTO
    >({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [props.data]);

    const columns = [
        { id: 'volume', label: t('exchange.info.volume', { unit: EnergyFormatter.displayUnit }) },
        {
            id: 'price',
            label: t('exchange.info.price', { currency, energyUnit: EnergyFormatter.displayUnit })
        }
    ] as const;

    const highlightedRowsIndexes = [];
    const rows = paginatedData.map(({ price, volume, userId }, index) => {
        if (typeof userId !== 'undefined' && userId !== null && userId === highlightOrdersUserId) {
            highlightedRowsIndexes.push(index);
        }

        return {
            volume: EnergyFormatter.format(volume),
            price: (price / 100).toString()
        };
    });

    return (
        <>
            <Typography variant="h3" gutterBottom>
                {title}
            </Typography>
            <TableMaterial
                columns={columns}
                rows={rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                highlightedRowsIndexes={highlightedRowsIndexes}
            />
        </>
    );
}
