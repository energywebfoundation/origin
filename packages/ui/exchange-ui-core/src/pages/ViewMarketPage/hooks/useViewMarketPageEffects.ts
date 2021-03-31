import { useDefaultCurrency } from './useDefaultCurrency';
import { useDispatch, useSelector } from 'react-redux';
import {
    fromGeneralSelectors,
    fromUsersSelectors,
    getConfiguration,
    useIntervalFetch
} from '@energyweb/origin-ui-core';
import {
    ExchangeClient,
    getOrdersTotalVolume,
    IOrdersTotalVolume,
    TOrderBook
} from '../../../utils';
import { directBuyOrder, getEnvironment, getExchangeClient } from '../../../features';
import { useCallback, useState } from 'react';
import { Filter, ProductFilterDTO } from '@energyweb/exchange-irec-client';
import { UserStatus } from '@energyweb/origin-backend-core';
import { IMarketFormValues } from '../../../components';
import { BuyDirectParams, OrderBookFilterConfig } from '../types';
import { useBidHandler } from './useBidHandler';

const REFRESH_INTERVAL_MS = 3000;

const getOrderbookFilterConfig = ({
    deviceType,
    gridOperator,
    generationDateStart,
    generationDateEnd,
    location
}: OrderBookFilterConfig): ProductFilterDTO => {
    return {
        deviceTypeFilter: deviceType ? Filter.Specific : Filter.Unspecified,
        locationFilter: location ? Filter.Specific : Filter.Unspecified,
        gridOperatorFilter: gridOperator ? Filter.Specific : Filter.Unspecified,
        generationTimeFilter:
            generationDateStart && generationDateEnd ? Filter.Specific : Filter.Unspecified,
        deviceVintageFilter: Filter.Unspecified,
        deviceType: deviceType || undefined,
        location: location || undefined,
        gridOperator: gridOperator || undefined,
        generationFrom: generationDateStart || undefined,
        generationTo: generationDateEnd || undefined
    };
};

const buyDirect = async ({ dispatch, orderId, price, volume }: BuyDirectParams) => {
    if ([orderId, volume, price].every((v) => typeof v !== 'undefined')) {
        dispatch(directBuyOrder({ askId: orderId, volume, price }));
    } else {
        throw new Error(`Can't buy direct order with undefined parameters passed`);
    }
};
import { Configuration } from '@energyweb/device-registry';
export const useViewMarketPageEffects = (): {
    bidHandler: (values: IMarketFormValues, oneTimePurchase: boolean) => () => void;
    exchangeAddress: string;
    configuration: Configuration.Entity;
    marketValuesChangeHandler: (values: IMarketFormValues) => void;
    orderbookData: TOrderBook;
    currency: string;
    buyDirect: (orderId: string, volume: string, price: number) => Promise<void>;
    totalOrders: IOrdersTotalVolume;
} => {
    const currency = useDefaultCurrency();
    const dispatch = useDispatch();

    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const exchangeClient: ExchangeClient = useSelector(getExchangeClient);
    const exchangeAddress = useSelector(fromUsersSelectors.getExchangeDepositAddress);
    const country = useSelector(fromGeneralSelectors.getCountry);
    const environment = useSelector(getEnvironment);

    const configuration = useSelector(getConfiguration);
    const [orderbookData, setOrderbookData] = useState<TOrderBook>({
        asks: [],
        bids: [],
        lastTradedPrice: null
    });
    const [totalOrders, setTotalOrders] = useState<IOrdersTotalVolume>(null);
    const [deviceType, setDeviceType] = useState<string[]>([]);
    const [location, setLocation] = useState<string[]>([]);
    const [gridOperator, setGridOperator] = useState<string[]>([]);
    const [generationDateStart, setGenerationDateStart] = useState<string>();
    const [generationDateEnd, setGenerationDateEnd] = useState<string>();

    const orderBookFilterConfig = getOrderbookFilterConfig({
        location,
        deviceType,
        generationDateEnd,
        generationDateStart,
        gridOperator
    });
    const handleDataFetch = async (checkIsMounted: () => boolean) => {
        const orderBookData =
            user?.status === UserStatus.Active && exchangeClient?.accessToken
                ? await exchangeClient?.orderbookClient.getByProduct(orderBookFilterConfig)
                : await exchangeClient?.orderbookClient.getByProductPublic(orderBookFilterConfig);

        const fetchedData = orderBookData?.data;

        const orderBookTotalOrders = await getOrdersTotalVolume(exchangeClient, user);
        if (checkIsMounted()) {
            setOrderbookData(
                (fetchedData as TOrderBook) ?? {
                    asks: [],
                    bids: [],
                    lastTradedPrice: null
                }
            );
            setTotalOrders(orderBookTotalOrders);
        }
    };

    useIntervalFetch(handleDataFetch, REFRESH_INTERVAL_MS, [
        deviceType,
        location,
        gridOperator,
        generationDateStart,
        generationDateEnd,
        exchangeClient
    ]);
    const marketValuesChangeHandler = (values: IMarketFormValues): void => {
        if (JSON.stringify(values.deviceType) !== JSON.stringify(deviceType)) {
            setDeviceType(values.deviceType);
        }
        const newLocation = values.location.map((l) => `${country};${l}`);
        if (JSON.stringify(newLocation) !== JSON.stringify(location)) {
            setLocation(newLocation);
        }
        const newGridOperator = values.gridOperator;
        if (JSON.stringify(newGridOperator) !== JSON.stringify(gridOperator)) {
            setGridOperator(newGridOperator);
        }
        const newGenerationDateStart = values.generationDateStart
            ?.utcOffset(Number(environment.MARKET_UTC_OFFSET), true)
            .startOf('month')
            .toISOString();
        if (JSON.stringify(newGenerationDateStart) !== JSON.stringify(generationDateStart)) {
            setGenerationDateStart(newGenerationDateStart);
        }
        const newGenerationDateEnd = values.generationDateEnd
            ?.utcOffset(Number(environment.MARKET_UTC_OFFSET), true)
            .endOf('month')
            .toISOString();
        if (JSON.stringify(newGenerationDateEnd) !== JSON.stringify(generationDateEnd)) {
            setGenerationDateEnd(newGenerationDateEnd);
        }
    };

    return {
        bidHandler: useCallback(
            (values: IMarketFormValues, oneTimePurchase: boolean) =>
                useBidHandler({ generationDateStart, generationDateEnd, oneTimePurchase, values }),
            [generationDateStart, generationDateEnd]
        ),
        buyDirect: useCallback((orderId: string, volume: string, price: number) => {
            return buyDirect({ dispatch, orderId, price, volume });
        }, []),
        marketValuesChangeHandler,
        totalOrders,
        currency,
        exchangeAddress,
        configuration,
        orderbookData
    };
};
