import { useSelector } from 'react-redux';
import { fromGeneralSelectors, useIntervalFetch } from '@energyweb/origin-ui-core';
import { getExchangeClient } from '../../../features';
import { useState } from 'react';
import { ITradeDTO } from '../../../utils';

export const useMyTradesPageEffects = () => {
    const currencies = useSelector(fromGeneralSelectors.getCurrencies);
    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';

    const refreshInterval = 10000;
    const currency = defaultCurrency;

    const exchangeClient = useSelector(getExchangeClient);

    const [tradeData, setTradeData] = useState<ITradeDTO[]>([]);

    const fetchData = async (checkIsMounted: () => boolean) => {
        const trades = await exchangeClient?.tradeClient.getAll();
        const fetchedData = trades?.data;

        if (checkIsMounted()) {
            setTradeData(fetchedData ?? []);
        }
    };

    useIntervalFetch(fetchData, refreshInterval);

    return { currency, tradeData };
};
