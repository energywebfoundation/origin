import React, { useEffect, useState } from 'react';
import { useTranslation, EnergyFormatter, formatCurrencyComplete, moment } from '../../utils';
import { Order } from '../../utils/exchange';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    TableMaterial,
    checkRecordPassesFilters,
    ICustomFilterDefinition,
    CustomFilterInputType,
    FilterRules
} from '../Table';
import { useSelector } from 'react-redux';
import { getCurrencies, getConfiguration } from '../..';
import { BigNumber } from 'ethers/utils';
import { Remove, Visibility } from '@material-ui/icons';

const ORDERS_PER_PAGE = 25;

interface IOwnProsp {
    asks: Order[];
}

export const AsksTable = (props: IOwnProsp) => {
    const { asks } = props;
    const { t } = useTranslation();
    const [view, setView] = useState<Order>();
    const [remove, setRemove] = useState<Order>();
    const configuration = useSelector(getConfiguration);
    const deviceTypeService = configuration?.deviceTypeService;

    const columns = [
        { id: 'volume', label: t('order.properties.volume') },
        { id: 'price', label: t('order.properties.price') },
        { id: 'device_type', label: t('order.properties.device_type') },
        { id: 'generationFrom', label: t('order.properties.generation_start') },
        { id: 'generationTo', label: t('order.properties.generation_end') },
        { id: 'filled', label: t('order.properties.filled') }
    ];

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: Order) => new Date(record.product.generationFrom).getTime() / 1000,
            label: t('certificate.properties.generationDateStart'),
            input: {
                type: CustomFilterInputType.yearMonth,
                filterRule: FilterRules.FROM
            }
        },
        {
            property: (record: Order) => new Date(record.product.generationTo).getTime() / 1000,
            label: t('certificate.properties.generationDateEnd'),
            input: {
                type: CustomFilterInputType.yearMonth,
                filterRule: FilterRules.TO
            }
        },
        {
            property: (record: Order) => record.product.deviceType[0],
            label: t('certificate.properties.deviceType'),
            input: {
                type: CustomFilterInputType.deviceType,
                defaultOptions: []
            }
        }
    ];

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const filteredAsks = asks.filter((ask) => {
            return checkRecordPassesFilters(ask, requestedFilters, deviceTypeService);
        });
        return {
            paginatedData: filteredAsks.slice(offset, offset + requestedPageSize),
            total: filteredAsks.length
        };
    }

    const { paginatedData, loadPage, total, pageSize, setPageSize } = usePaginatedLoaderFiltered<
        Order
    >({
        getPaginatedData,
        initialPageSize: ORDERS_PER_PAGE
    });

    useEffect(() => {
        setPageSize(ORDERS_PER_PAGE);
        loadPage(1);
    }, [asks]);

    const [currency = 'USD'] = useSelector(getCurrencies);

    const rows = paginatedData.map((order) => {
        const {
            startVolume,
            currentVolume,
            price,
            product: { deviceType, generationFrom, generationTo }
        } = order;
        return {
            volume: EnergyFormatter.format(Number(currentVolume), true),
            price: formatCurrencyComplete(price / 100, currency),
            device_type: deviceType[0].split(';')[0],
            generationFrom: moment(generationFrom).format('MMM, YYYY'),
            generationTo: moment(generationTo).format('MMM, YYYY'),
            filled: `${
                new BigNumber(startVolume)
                    .sub(new BigNumber(currentVolume))
                    .mul(100)
                    .div(startVolume)
                    .toNumber() / 100
            }%`,
            askId: order.id
        };
    });

    const viewDetails = (rowIndex: number) => {
        const { askId } = rows[rowIndex];
        const ask = asks.find((o) => o.id === askId);
        setView(ask);
    };

    const removeAsk = (rowIndex: number) => {
        const { askId } = rows[rowIndex];
        const ask = asks.find((o) => o.id === askId);
        setRemove(ask);
    };

    const actions = [
        {
            icon: <Visibility />,
            name: 'View',
            onClick: (row: string) => viewDetails(parseInt(row, 10))
        },
        {
            icon: <Remove />,
            name: 'Remove',
            onClick: (row: string) => removeAsk(parseInt(row, 10))
        }
    ];

    return (
        <>
            <TableMaterial
                columns={columns}
                rows={rows}
                filters={filters}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                actions={actions}
            />
        </>
    );
};
