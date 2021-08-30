import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { EnergyFormatter, fromGeneralSelectors, moment } from '@energyweb/origin-ui-core';
import { Demand, calculateTotalVolume } from '../../utils/exchange';

interface IProps {
    demand: Demand;
}

export const TotalDemandVolume = (props: IProps) => {
    const { demand } = props;
    const { t } = useTranslation();
    const exchangeClient = useSelector(fromGeneralSelectors.getExchangeClient);

    const [totalVolume, setTotalVolume] = useState<string>('');

    useEffect(() => {
        const setVolume = async () => {
            const volume = await calculateTotalVolume(exchangeClient.demandClient, {
                volume: demand.volumePerPeriod,
                period: demand.periodTimeFrame,
                start: moment(demand.start),
                end: moment(demand.end)
            });
            setTotalVolume(volume);
        };
        setVolume();
    }, [demand]);

    return (
        <>
            <Typography align="center">{t('demand.captions.totalVolume')}</Typography>
            <Typography align="center" variant="h5" className="Calculated">
                {`${totalVolume} ${EnergyFormatter.displayUnit}`}
            </Typography>
        </>
    );
};
