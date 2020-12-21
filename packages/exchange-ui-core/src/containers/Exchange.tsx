import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid } from '@material-ui/core';
import { ProductFilterDTO, Filter } from '@energyweb/exchange-irec-client';
import { UserStatus } from '@energyweb/origin-backend-core';
import {
    EnergyFormatter,
    moment,
    useTranslation,
    useIntervalFetch,
    getCountry,
    getUserOffchain,
    setLoading,
    getCurrencies
} from '@energyweb/origin-ui-core';
import { getEnvironment, getExchangeClient } from '../features/general';
import { createBid, createDemand, directBuyOrder } from '../features/orders';
import {
    ExchangeClient,
    TOrderBook,
    ANY_VALUE,
    ANY_OPERATOR,
    getOrdersTotalVolume,
    IOrdersTotalVolume
} from '../utils/exchange';
import { Asks, Bids, Market, IMarketFormValues } from '../components/exchange';

export function Exchange() {
    const currencies = useSelector(getCurrencies);
    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';

    const refreshInterval = 3000;
    const currency = defaultCurrency;

    const user = useSelector(getUserOffchain);
    const exchangeClient: ExchangeClient = useSelector(getExchangeClient);
    const country = useSelector(getCountry);
    const environment = useSelector(getEnvironment);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [data, setData] = useState<TOrderBook>({
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

    const orderbookFilter: ProductFilterDTO = {
        deviceTypeFilter: deviceType.length > 0 ? Filter.Specific : Filter.Unspecified,
        locationFilter: location.length > 0 ? Filter.Specific : Filter.Unspecified,
        gridOperatorFilter: gridOperator.length > 0 ? Filter.Specific : Filter.Unspecified,
        generationTimeFilter:
            generationDateStart && generationDateEnd ? Filter.Specific : Filter.Unspecified,
        deviceVintageFilter: Filter.Unspecified,
        deviceType: deviceType.length > 0 ? deviceType : undefined,
        location: location.length > 0 ? location : undefined,
        gridOperator: gridOperator.length > 0 ? gridOperator : undefined,
        generationFrom: generationDateStart ?? undefined,
        generationTo: generationDateEnd ?? undefined
    };

    const fetchData = async (checkIsMounted: () => boolean) => {
        const orderBookData =
            user && user?.status === UserStatus.Active && exchangeClient?.accessToken
                ? await exchangeClient?.orderbookClient.getByProduct(orderbookFilter)
                : await exchangeClient?.orderbookClient.getByProductPublic(orderbookFilter);

        const fetchedData = orderBookData?.data;

        const orderBookTotalOrders = await getOrdersTotalVolume(exchangeClient, user);

        if (checkIsMounted()) {
            setData(
                (fetchedData as TOrderBook) ?? {
                    asks: [],
                    bids: [],
                    lastTradedPrice: null
                }
            );
            setTotalOrders(orderBookTotalOrders);
        }
    };

    useIntervalFetch(fetchData, refreshInterval, [
        deviceType,
        location,
        gridOperator,
        generationDateStart,
        generationDateEnd,
        exchangeClient
    ]);

    async function onBid(values: IMarketFormValues, oneTimePurchase: boolean) {
        dispatch(setLoading(true));
        if (oneTimePurchase) {
            dispatch(
                createBid({
                    price: parseFloat(values.price) * 100,
                    product: {
                        deviceType: values.deviceType?.includes(ANY_VALUE)
                            ? undefined
                            : values.deviceType,
                        gridOperator: values.gridOperator?.includes(ANY_OPERATOR)
                            ? undefined
                            : values.gridOperator,
                        location: values.location?.includes(ANY_VALUE)
                            ? undefined
                            : values.location?.map((l) => `${country};${l}`),
                        generationFrom: generationDateStart,
                        generationTo: generationDateEnd
                    },
                    validFrom: moment().toISOString(),
                    volume: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                        parseFloat(values.energy)
                    ).toString()
                })
            );
        } else {
            dispatch(
                createDemand({
                    price: parseFloat(values.price) * 100,
                    volumePerPeriod: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                        parseFloat(values.demandVolume)
                    ).toString(),
                    periodTimeFrame: values.demandPeriod,
                    start: values.demandDateStart.toISOString(),
                    end: values.demandDateEnd.toISOString(),
                    product: {
                        deviceType: values.deviceType?.includes(ANY_VALUE)
                            ? undefined
                            : values.deviceType,
                        gridOperator: values.gridOperator?.includes(ANY_OPERATOR)
                            ? undefined
                            : values.gridOperator,
                        location: values.location?.includes(ANY_VALUE)
                            ? undefined
                            : values.location?.map((l) => `${country};${l}`)
                    },
                    boundToGenerationTime: false,
                    excludeEnd: false
                })
            );
        }
        dispatch(setLoading(false));
    }

    function handleMarketValuesChange(values: IMarketFormValues): void {
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
    }

    async function buyDirect(orderId: string, volume: string, price: number) {
        if (
            typeof orderId === 'undefined' ||
            typeof volume === 'undefined' ||
            typeof price === 'undefined'
        ) {
            throw new Error(`Can't buy direct order with undefined parameters passed`);
        }

        dispatch(directBuyOrder({ askId: orderId, volume, price }));
    }

    return (
        <div>
            <Grid container>
                <Grid item xs={9}>
                    <Market
                        onBid={onBid}
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onNotify={() => {}}
                        onChange={(values) => handleMarketValuesChange(values)}
                        energyUnit={EnergyFormatter.displayUnit}
                        currency={currency}
                        disableBidding={!user}
                    />
                    <br />
                    <br />
                </Grid>
                <Grid item xs={3}></Grid>
                <Grid container>
                    <Grid item xs={9}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Asks
                                    data={data.asks}
                                    currency={currency}
                                    title={t('exchange.info.asks')}
                                    highlightOrdersUserId={user?.id?.toString()}
                                    displayAssetDetails={true}
                                    buyDirect={buyDirect}
                                    energyUnit={EnergyFormatter.displayUnit}
                                    ordersTotalVolume={totalOrders?.totalAsks}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Bids
                                    data={data.bids}
                                    currency={currency}
                                    title={t('exchange.info.bids')}
                                    highlightOrdersUserId={user?.id?.toString()}
                                    ordersTotalVolume={totalOrders?.totalBids}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3}></Grid>
                </Grid>
            </Grid>
        </div>
    );
}
