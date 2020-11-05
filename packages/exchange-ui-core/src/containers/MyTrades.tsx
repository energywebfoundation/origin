import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import { useTranslation, useIntervalFetch } from '@energyweb/origin-ui-core';
import { getExchangeClient } from '../features/orders';
import { ITradeDTO } from '../utils/exchange';
import { Trades } from '../components/trades';

interface IProps {
    currency: string;
    refreshInterval?: number;
}

export function MyTrades(props: IProps) {
    const { currency, refreshInterval } = { refreshInterval: 10000, ...props };

    const exchangeClient = useSelector(getExchangeClient);
    const { t } = useTranslation();

    const [data, setData] = useState<ITradeDTO[]>([]);

    const fetchData = async (checkIsMounted: () => boolean) => {
        const fetchedData = (await exchangeClient?.getTrades()) ?? [];

        if (checkIsMounted()) {
            setData(fetchedData);
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
