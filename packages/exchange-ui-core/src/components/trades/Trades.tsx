import React, { useEffect } from 'react';
import { Typography } from '@material-ui/core';
import {
    EnergyFormatter,
    useTranslation,
    formatDate,
    moment,
    formatCurrencyComplete,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoaderFiltered,
    TableMaterial
} from '@energyweb/origin-ui-core';
import { ITradeDTO, calculateTotalPrice } from '../../utils/exchange';

interface IProps {
    data: ITradeDTO[];
    currency: string;
    title: string;
}

export function Trades(props: IProps) {
    const { currency, data, title } = props;

    const { t } = useTranslation();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        let newPaginatedData = data;

        const newTotal = newPaginatedData.length;

        newPaginatedData = newPaginatedData
            .sort((a, b) => moment(b.created).unix() - moment(a.created).unix())
            .slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<ITradeDTO>({
        getPaginatedData
    });

    useEffect(() => {
        let isMounted = true;

        const checkIsMounted = () => isMounted;

        loadPage(1, null, checkIsMounted);

        return () => {
            isMounted = false;
        };
    }, [props.data]);

    const columns = [
        { id: 'date', label: t('exchange.info.date') },
        { id: 'side', label: t('exchange.info.side') },
        { id: 'volume', label: t('exchange.info.volume', { unit: EnergyFormatter.displayUnit }) },
        {
            id: 'price',
            label: t('exchange.info.price', { currency, energyUnit: EnergyFormatter.displayUnit })
        },
        {
            id: 'total',
            label: t('exchange.info.total')
        }
    ] as const;

    const rows = paginatedData.map(({ price, volume, created, bidId }) => {
        const priceInDisplayUnit = (price / 100).toString();

        return {
            date: formatDate(created, true),
            side: bidId ? t('exchange.info.buy') : t('exchange.info.sell'),
            volume: EnergyFormatter.format(volume),
            price: priceInDisplayUnit,
            total: `${formatCurrencyComplete(
                calculateTotalPrice(priceInDisplayUnit, EnergyFormatter.format(volume)),
                currency
            )}`
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
            />
        </>
    );
}
