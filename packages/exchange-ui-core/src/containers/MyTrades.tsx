import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import { useTranslation, useIntervalFetch, getCurrencies } from '@energyweb/origin-ui-core';
import { getExchangeClient } from '../features/general';
import { ITradeDTO } from '../utils/exchange';
import { Trades } from '../components/trades';

export function MyTrades() {
    const currencies = useSelector(getCurrencies);
    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';

    const refreshInterval = 10000;
    const currency = defaultCurrency;

    const exchangeClient = useSelector(getExchangeClient);
    const { t } = useTranslation();

    const [data, setData] = useState<ITradeDTO[]>([]);

    const fetchData = async (checkIsMounted: () => boolean) => {
        const trades = await exchangeClient?.tradeClient.getAll();
        const fetchedData = trades?.data;

        if (checkIsMounted()) {
            setData(fetchedData ?? []);
        }
    };

    useIntervalFetch(fetchData, refreshInterval);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Trades currency={currency} data={data} title={t('exchange.info.myTrades')} />
                </Grid>
            </Grid>
        </div>
    );
}
