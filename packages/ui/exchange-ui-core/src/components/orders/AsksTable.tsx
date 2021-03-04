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
    getEnvironment,
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
import { useDeviceDataLayer } from '../../deviceDataLayer';
import { getDeviceName, deviceTypeChecker } from '../../utils/device';
import { Order, ANY_VALUE, ANY_OPERATOR } from '../../utils/exchange';
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
    const deviceDataLayer = useDeviceDataLayer();
    const deviceClient = deviceDataLayer.deviceClient;
    const deviceSelector = deviceDataLayer.getMyDevices;
    const deviceFetcher = deviceDataLayer.fetchMyDevices;
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
        { id: 'facilityName', label: t('device.properties.facilityName') },
        { id: 'generationFrom', label: t('order.properties.generation_start') },
        { id: 'generationTo', label: t('order.properties.generation_end') },
        { id: 'filled', label: t('order.properties.filled') }
    ];

    const getTableFilters = (): ICustomFilterDefinition[] => [
        {
            property: (record: Order) => getDeviceName(record.asset.deviceId, devices, environment),
            label: t('device.properties.facilityName'),
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: devices.map((device) => ({
                    label: deviceTypeChecker(device) ? device?.facilityName : device?.name,
                    value: deviceTypeChecker(device) ? device?.facilityName : device?.name
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
        if (asks.length > 0) {
            setPageSize(ORDERS_PER_PAGE);
            loadPage(1);
        }
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
            facilityName: getDeviceName(deviceId, devices, environment),
            device_type: deviceType[0].split(';')[0],
            generationFrom: moment(generationFrom)
                .utcOffset(Number(environment.MARKET_UTC_OFFSET))
                .format('MMM, YYYY'),
            generationTo: moment(generationTo).format('MMM, YYYY'),
            filled: `${filled * 100}%`,
            askId: order.id
        };
    });

    function prepareRedirectFilters(
        ask: Order
    ): { deviceType: string[]; location: string[]; gridOperator: string[] } {
        const newType = [ask.product.deviceType[0]];
        const separatedTypes = ask.product.deviceType[0].split(';');
        if (separatedTypes.length === 2) {
            newType.unshift(separatedTypes[0]);
        }
        if (separatedTypes.length === 3) {
            newType.unshift(separatedTypes.slice(0, -1).join(';'));
            newType.unshift(separatedTypes[0]);
        }

        const deviceType = ask.product.deviceType[0].length > 1 ? newType : [ANY_VALUE];

        const isEmptyLocation = ask.product.location[0].split(';')[1].length < 1;
        const upperLevel = ask.product.location[0].split(';').slice(0, -1).join(';');
        const lowerLevel = ask.product.location[0];
        const location = isEmptyLocation ? [ANY_VALUE] : [upperLevel, lowerLevel];

        const gridOperator =
            ask.product.gridOperator[0].length > 0 ? ask.product.gridOperator : [ANY_OPERATOR];

        return {
            deviceType,
            location,
            gridOperator
        };
    }

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
    const viewMarket = (rowIndex: number) => {
        const { askId } = rows[rowIndex];
        const ask = asks.find((o) => o.id === askId);
        const prepared = prepareRedirectFilters(ask);
        history.push(`${getExchangeLink()}/view-market`, {
            redirectDeviceType: prepared.deviceType,
            redirectLocation: prepared.location,
            redirectGridOperator: prepared.gridOperator,
            redirectGenerationFrom: ask.product.generationFrom,
            redirectGenerationTo: ask.product.generationTo
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
            onClick: (row: string) => cancelAsk(parseInt(row, 10))
        }
    ];

    return (
        <>
            <TableMaterial
                handleRowClick={(row: string) => viewDetails(parseInt(row, 10))}
                columns={columns}
                rows={rows}
                filters={getTableFilters()}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                actions={actions}
                caption={t('order.captions.open_asks')}
            />
            {askToView && (
                <OrderDetailsModal
                    devices={devices}
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
