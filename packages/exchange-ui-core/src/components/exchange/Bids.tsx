import React, { useEffect } from 'react';
import { Typography } from '@material-ui/core';
import {
    useTranslation,
    EnergyFormatter,
    TableMaterial,
    ICustomRow,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoaderFiltered
} from '@energyweb/origin-ui-core';
import { IOrderBookOrderDTO } from '../../utils/exchange';

export interface IBidsProps {
    data: IOrderBookOrderDTO[];
    currency: string;
    title: string;
    highlightOrdersUserId: string;
    handleRowClick?: (order: IOrderBookOrderDTO) => void;
    customRow?: ICustomRow<any>;
}

export function Bids(props: IBidsProps) {
    const { currency, data, title, highlightOrdersUserId, handleRowClick, customRow } = props;

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
        let isMounted = true;

        const checkIsMounted = () => isMounted;

        loadPage(1, null, checkIsMounted);

        return () => {
            isMounted = false;
        };
    }, [props.data]);

    const columns = [
        { id: 'volume', label: t('exchange.info.volume', { unit: EnergyFormatter.displayUnit }) },
        {
            id: 'price',
            label: t('exchange.info.price', { currency, energyUnit: EnergyFormatter.displayUnit })
        }
    ] as const;

    const highlightedRowsIndexes = [];
    const rows = paginatedData.map(({ id, price, volume, userId }, index) => {
        if (typeof userId !== 'undefined' && userId !== null && userId === highlightOrdersUserId) {
            highlightedRowsIndexes.push(index);
        }

        return {
            id,
            volume: EnergyFormatter.format(volume),
            price: (price / 100).toFixed(2)
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
                highlightedRowsIds={highlightedRowsIndexes}
                handleRowClick={
                    handleRowClick
                        ? (id: string) => {
                              handleRowClick(paginatedData?.find((r) => r.id === id));
                          }
                        : null
                }
                customRow={customRow}
            />
        </>
    );
}
