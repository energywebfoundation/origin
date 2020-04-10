import React, { useState } from 'react';
import { Market, IMarketFormValues } from './Market';
import { EnergyFormatter, moment, useTranslation, useIntervalFetch } from '../../utils';
import { Asks, Orders } from '.';
import { Grid } from '@material-ui/core';
import { getUserOffchain } from '../../features/users/selectors';
import { getExchangeClient, getCountry } from '../../features/general/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { TOrderBook } from '../../utils/exchange';
import { setLoading } from '../../features/general/actions';

interface IProps {
    currency: string;
    refreshInterval?: number;
}

export function Exchange(props: IProps) {
    const { currency, refreshInterval } = { refreshInterval: 5000, ...props };

    const user = useSelector(getUserOffchain);
    const exchangeClient = useSelector(getExchangeClient);
    const country = useSelector(getCountry);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [data, setData] = useState<TOrderBook>({
        asks: [],
        bids: []
    });
    const [deviceType, setDeviceType] = useState<string[]>([]);
    const [location, setLocation] = useState<string[]>([]);

    const fetchData = async (checkIsMounted: () => boolean) => {
        const fetchedData = (await exchangeClient?.search(deviceType, location)) ?? {
            asks: [],
            bids: []
        };

        if (checkIsMounted()) {
            setData(fetchedData);
        }
    };

    useIntervalFetch(fetchData, refreshInterval, [deviceType, location]);

    async function onBid(values: IMarketFormValues) {
        dispatch(setLoading(true));

        await exchangeClient.createBid({
            price: parseFloat(values.price) * 100,
            product: {
                deviceType: values.deviceType?.length > 0 ? values.deviceType : undefined,
                location:
                    values.location?.length > 0
                        ? values.location?.map((l) => `${country};${l}`)
                        : undefined,
                generationFrom: null,
                generationTo: null
            },
            validFrom: moment().toISOString(),
            volume: EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                parseFloat(values.energy)
            ).toString()
        });

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

        await exchangeClient.directBuy({
            askId: orderId,
            volume,
            price
        });

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
