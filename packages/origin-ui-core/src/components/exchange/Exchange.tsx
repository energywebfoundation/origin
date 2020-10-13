import React, { useState } from 'react';
import { Market, IMarketFormValues } from './Market';
import {
    EnergyFormatter,
    moment,
    useTranslation,
    useIntervalFetch,
    showNotification
} from '../../utils';
import { Asks, Orders } from '.';
import { Grid } from '@material-ui/core';
import { getUserOffchain } from '../../features/users/selectors';
import { getExchangeClient, getCountry } from '../../features/general/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { TOrderBook, ANY_VALUE } from '../../utils/exchange';
import { setLoading } from '../../features/general/actions';
import { reloadCertificates } from '../../features/certificates';
import { createBid, createDemand } from '../../features/orders/actions';

interface IProps {
    currency: string;
    refreshInterval?: number;
}

export function Exchange(props: IProps) {
    const { currency, refreshInterval } = { refreshInterval: 3000, ...props };

    const user = useSelector(getUserOffchain);
    const exchangeClient = useSelector(getExchangeClient);
    const country = useSelector(getCountry);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [data, setData] = useState<TOrderBook>({
        asks: [],
        bids: [],
        lastTradedPrice: null
    });
    const [deviceType, setDeviceType] = useState<string[]>([]);
    const [location, setLocation] = useState<string[]>([]);
    const [gridOperator, setGridOperator] = useState<string[]>([]);
    const [generationDateStart, setGenerationDateStart] = useState<string>();
    const [generationDateEnd, setGenerationDateEnd] = useState<string>();

    const fetchData = async (checkIsMounted: () => boolean) => {
        const fetchedData = (await exchangeClient?.search(
            deviceType,
            location,
            gridOperator,
            generationDateStart,
            generationDateEnd
        )) ?? {
            asks: [],
            bids: [],
            lastTradedPrice: null
        };

        if (checkIsMounted()) {
            setData(fetchedData);
        }
    };

    useIntervalFetch(fetchData, refreshInterval, [
        deviceType,
        location,
        gridOperator,
        generationDateStart,
        generationDateEnd
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
                    start: values.demandDateStart,
                    end: values.demandDateEnd,
                    product: {
                        deviceType: values.deviceType?.includes(ANY_VALUE)
                            ? undefined
                            : values.deviceType,
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

    async function buyDirect(orderId: string, volume: string, price: number) {
        if (
            typeof orderId === 'undefined' ||
            typeof volume === 'undefined' ||
            typeof price === 'undefined'
        ) {
            throw new Error(`Can't buyDirect order with undefined parameters passed`);
        }

        dispatch(setLoading(true));

        const { success, status } = await exchangeClient.directBuy({
            askId: orderId,
            volume,
            price
        });

        dispatch(reloadCertificates());

        if (!success) {
            showNotification('Direct buy failed.');
            console.error(`Direct buy failed with status ${status}.`);
        }

        dispatch(setLoading(false));
    }

    return (
        <div>
            <Market
                onBid={onBid}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onNotify={() => {}}
                onChange={(values) => {
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
                        ?.startOf('month')
                        .toISOString();

                    if (
                        JSON.stringify(newGenerationDateStart) !==
                        JSON.stringify(generationDateStart)
                    ) {
                        setGenerationDateStart(newGenerationDateStart);
                    }

                    const newGenerationDateEnd = values.generationDateEnd
                        ?.endOf('month')
                        .toISOString();

                    if (
                        JSON.stringify(newGenerationDateEnd) !== JSON.stringify(generationDateEnd)
                    ) {
                        setGenerationDateEnd(newGenerationDateEnd);
                    }
                }}
                energyUnit={EnergyFormatter.displayUnit}
                currency={currency}
                disableBidding={!user}
            />
            <br />
            <br />
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
                    />
                </Grid>
                <Grid item xs={6}>
                    <Orders
                        data={data.bids}
                        currency={currency}
                        title={t('exchange.info.bids')}
                        highlightOrdersUserId={user?.id?.toString()}
                    />
                </Grid>
            </Grid>
        </div>
    );
}
