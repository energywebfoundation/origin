import React, { useEffect, useState } from 'react';
import {
    useTranslation,
    EnergyFormatter,
    formatCurrencyComplete,
    moment,
    deviceById,
    EnergyTypes
} from '../../utils';
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
import { getCurrencies, getConfiguration, getEnvironment, getProducingDevices } from '../..';
import { Remove, Visibility } from '@material-ui/icons';
import { RemoveOrderConfirmation } from '../Modal/RemoveOrderConfirmation';
import { OrderDetailsModal } from '../Modal/OrderDetailslModal';

const ORDERS_PER_PAGE = 5;

interface IOwnProsp {
    bids: Order[];
}

export const BidsTable = (props: IOwnProsp) => {
    const { bids } = props;
    const { t } = useTranslation();
    const [bidToView, setToView] = useState<Order>();
    const [bidToRemove, setToRemove] = useState<Order>();
    const configuration = useSelector(getConfiguration);
    const deviceTypeService = configuration?.deviceTypeService;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);

    const columns = [
        { id: 'volume', label: t('order.properties.volume') },
        { id: 'price', label: t('order.properties.price') },
        { id: 'device_type', label: t('order.properties.device_type') },
        { id: 'generationFrom', label: t('order.properties.generation_start') },
        { id: 'generationTo', label: t('order.properties.generation_end') },
        { id: 'filled', label: t('order.properties.filled') }
    ];

    const getFilters = (): ICustomFilterDefinition[] => [
        {
            property: (order: Order) =>
                order.asset?.deviceId
                    ? deviceById(order.asset.deviceId, environment, devices).facilityName
                    : undefined,
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
            property: ({ product: { deviceType } }: Order) =>
                deviceType ? deviceType[0].split(';')[0].toLowerCase() : undefined,
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
        const filteredAsks = bids.filter((ask) => {
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
    }, [bids]);

    const [currency = 'USD'] = useSelector(getCurrencies);

    const rows = paginatedData.map((bid) => {
        const {
            currentVolume,
            price,
            product: { deviceType, generationFrom, generationTo },
            filled
        } = bid;
        return {
            volume: EnergyFormatter.format(Number(currentVolume), true),
            price: formatCurrencyComplete(price / 100, currency),
            device_type: deviceType ? deviceType[0].split(';')[0] : '-',
            generationFrom: generationFrom ? moment(generationFrom).format('MMM, YYYY') : '-',
            generationTo: generationTo ? moment(generationTo).format('MMM, YYYY') : '-',
            filled: `${filled * 100}%`,
            bidId: bid.id
        };
    });

    const viewDetails = (rowIndex: number) => {
        const { bidId } = rows[rowIndex];
        const bid = bids.find((o) => o.id === bidId);
        setToView(bid);
    };

    const removeBid = (rowIndex: number) => {
        const { bidId } = rows[rowIndex];
        const bid = bids.find((o) => o.id === bidId);
        setToRemove(bid);
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
            onClick: (row: string) => removeBid(parseInt(row, 10))
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
                caption={t('order.captions.open_bids')}
            />
            {bidToView && (
                <OrderDetailsModal
                    order={bidToView}
                    close={() => setToView(null)}
                    showCancelOrder={(bid: Order) => {
                        setToView(null);
                        setToRemove(bid);
                    }}
                />
            )}
            {bidToRemove && (
                <RemoveOrderConfirmation order={bidToRemove} close={() => setToRemove(null)} />
            )}
        </>
    );
};
