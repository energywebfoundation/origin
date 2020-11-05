import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Remove, Visibility } from '@material-ui/icons';
import {
    useTranslation,
    EnergyFormatter,
    formatCurrencyComplete,
    moment,
    deviceById,
    EnergyTypes,
    getCurrencies,
    getConfiguration,
    getEnvironment,
    getProducingDevices,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    checkRecordPassesFilters,
    ICustomFilterDefinition,
    CustomFilterInputType,
    FilterRules,
    TableMaterial
} from '@energyweb/origin-ui-core';
import { Order } from '../../utils/exchange';
import { RemoveOrderConfirmation, OrderDetailsModal } from '../modal';

const ORDERS_PER_PAGE = 5;

interface IOwnProsp {
    asks: Order[];
}

export const AsksTable = (props: IOwnProsp) => {
    const { asks } = props;
    const { t } = useTranslation();
    const [askToView, setToView] = useState<Order>();
    const [askToRemove, setToRemove] = useState<Order>();
    const configuration = useSelector(getConfiguration);
    const deviceTypeService = configuration?.deviceTypeService;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);

    const columns = [
        { id: 'volume', label: t('order.properties.volume') },
        { id: 'price', label: t('order.properties.price') },
        { id: 'facilityName', label: t('device.properties.facilityName') },
        { id: 'generationFrom', label: t('order.properties.generation_start') },
        { id: 'generationTo', label: t('order.properties.generation_end') },
        { id: 'filled', label: t('order.properties.filled') }
    ];

    const getFilters = (): ICustomFilterDefinition[] => [
        {
            property: (record: Order) =>
                deviceById(record.asset.deviceId, environment, devices).facilityName,
            label: t('device.properties.facilityName'),
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: devices.map((device) => ({
                    label: device.facilityName,
                    value: device.facilityName
                }))
            }
        },
        {
            property: (record: Order) => record.product.deviceType[0].split(';')[0].toLowerCase(),
            label: t('certificate.properties.deviceType'),
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: Object.values(EnergyTypes).map((type) => ({
                    label: `${type[0].toUpperCase()}${type.slice(1).toLowerCase()}`,
                    value: type
                })),
                defaultOptions: []
            }
        },
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
        }
    ];

    async function getPaginatedData({
        requestedPageSize,
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const filteredBids = asks.filter((bid) => {
            return checkRecordPassesFilters(bid, requestedFilters, deviceTypeService);
        });
        return {
            paginatedData: filteredBids.slice(offset, offset + requestedPageSize),
            total: filteredBids.length
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
            currentVolume,
            price,
            filled,
            asset: { deviceId },
            product: { deviceType, generationFrom, generationTo }
        } = order;
        return {
            volume: EnergyFormatter.format(Number(currentVolume), true),
            price: formatCurrencyComplete(price / 100, currency),
            facilityName: deviceById(deviceId, environment, devices).facilityName,
            device_type: deviceType[0].split(';')[0],
            generationFrom: moment(generationFrom).format('MMM, YYYY'),
            generationTo: moment(generationTo).format('MMM, YYYY'),
            filled: `${filled * 100}%`,
            askId: order.id
        };
    });

    const viewDetails = (rowIndex: number) => {
        const { askId } = rows[rowIndex];
        const ask = asks.find((o) => o.id === askId);
        setToView(ask);
    };

    const cancelAsk = (rowIndex: number) => {
        const { askId } = rows[rowIndex];
        const ask = asks.find((o) => o.id === askId);
        setToRemove(ask);
    };

    const actions = [
        {
            icon: <Visibility />,
            name: t('order.actions.view'),
            onClick: (row: string) => viewDetails(parseInt(row, 10))
        },
        {
            icon: <Remove />,
            name: t('order.actions.remove'),
            onClick: (row: string) => cancelAsk(parseInt(row, 10))
        }
    ];

    return (
        <>
            <TableMaterial
                handleRowClick={(row: string) => viewDetails(parseInt(row, 10))}
                columns={columns}
                rows={rows}
                filters={getFilters()}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                actions={actions}
                caption={t('order.captions.open_asks')}
            />
            {askToView && (
                <OrderDetailsModal
                    order={askToView}
                    close={() => setToView(null)}
                    showCancelOrder={(ask: Order) => {
                        setToView(null);
                        setToRemove(ask);
                    }}
                />
            )}
            {askToRemove && (
                <RemoveOrderConfirmation order={askToRemove} close={() => setToRemove(null)} />
            )}
        </>
    );
};
