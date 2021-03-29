import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Remove, Visibility, Search } from '@material-ui/icons';
import {
    EnergyFormatter,
    formatCurrencyComplete,
    moment,
    EnergyTypes,
    getCurrencies,
    getConfiguration,
    IPaginatedLoaderHooksFetchDataParameters,
    IPaginatedLoaderFetchDataReturnValues,
    usePaginatedLoaderFiltered,
    checkRecordPassesFilters,
    ICustomFilterDefinition,
    CustomFilterInputType,
    FilterRules,
    TableMaterial,
    useLinks
} from '@energyweb/origin-ui-core';
import { getEnvironment } from '../../features';
import { useDeviceDataLayer } from '../../deviceDataLayer';
import { Order, ANY_VALUE, ANY_OPERATOR } from '../../utils';
import { RemoveOrderConfirmation, OrderDetailsModal } from '../modal';

const ORDERS_PER_PAGE = 5;

interface IOwnProsp {
    bids: Order[];
}

export const BidsTable = (props: IOwnProsp): JSX.Element => {
    const { bids } = props;
    const { t } = useTranslation();
    const [bidToView, setToView] = useState<Order>();
    const [bidToRemove, setToRemove] = useState<Order>();
    const configuration = useSelector(getConfiguration);
    const deviceTypeService = configuration?.deviceTypeService;
    const environment = useSelector(getEnvironment);

    const deviceDataLayer = useDeviceDataLayer();
    const deviceClient = deviceDataLayer.deviceClient;
    const deviceSelector = deviceDataLayer.getAllDevices;
    const deviceFetcher = deviceDataLayer.fetchAllDevices;
    const devices = useSelector(deviceSelector) || [];

    const { getExchangeLink } = useLinks();
    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
        if (deviceClient) {
            dispatch(deviceFetcher());
        }
    }, [deviceClient]);

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
            property: ({ product: { deviceType } }: Order) => {
                return deviceType
                    ? deviceType
                          .filter((device) => !device.includes(';'))
                          .join(', ')
                          .toLowerCase()
                    : undefined;
            },
            label: t('certificate.properties.deviceType'),
            input: {
                type: CustomFilterInputType.multiselect,
                availableOptions: Object.values(EnergyTypes).map((type) => ({
                    label: `${type[0].toUpperCase()}${type.slice(1).toLowerCase()}`,
                    value: type
                })),
                defaultOptions: []
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

    const {
        paginatedData,
        loadPage,
        total,
        pageSize,
        setPageSize
    } = usePaginatedLoaderFiltered<Order>({
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
        const deviceTypeFormatted = (deviceArr: string[]): string =>
            deviceArr.filter((type) => !type.includes(';')).join(', ');
        return {
            volume: EnergyFormatter.format(Number(currentVolume), true),
            price: formatCurrencyComplete(price / 100, currency),
            device_type: deviceType ? deviceTypeFormatted(deviceType) : '-',
            generationFrom: generationFrom
                ? moment(generationFrom)
                      .utcOffset(Number(environment.MARKET_UTC_OFFSET))
                      .format('MMM, YYYY')
                : '-',
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

    const viewMarket = (rowIndex: number) => {
        const { bidId } = rows[rowIndex];
        const bid = bids.find((o) => o.id === bidId);
        history.push(`${getExchangeLink()}/view-market`, {
            redirectDeviceType: bid.product.deviceType || [ANY_VALUE],
            redirectLocation: bid.product.location || [ANY_VALUE],
            redirectGridOperator: bid.product.gridOperator || [ANY_OPERATOR],
            redirectGenerationFrom: bid.product.generationFrom,
            redirectGenerationTo: bid.product.generationTo
        });
    };

    const actions = [
        {
            icon: <Search />,
            name: t('order.actions.viewMarket'),
            onClick: (row: string) => viewMarket(parseInt(row, 10))
        },
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
                    devices={devices}
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
