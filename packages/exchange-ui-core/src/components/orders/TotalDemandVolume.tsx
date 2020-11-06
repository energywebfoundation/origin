import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Typography } from '@material-ui/core';
import { EnergyFormatter, useTranslation, getExchangeClient } from '@energyweb/origin-ui-core';
import { Demand, calculateTotalVolume } from '../../utils/exchange';

interface IProps {
    demand: Demand;
}

export const TotalDemandVolume = (props: IProps) => {
    const { demand } = props;
    const { t } = useTranslation();
    const exchangeClient = useSelector(getExchangeClient);

    const [totalVolume, setTotalVolume] = useState<string>('');

    useEffect(() => {
        const setVolume = async () => {
            const volume = await calculateTotalVolume(exchangeClient, {
                volume: demand.volumePerPeriod,
                period: demand.periodTimeFrame,
                start: demand.start,
                end: demand.end
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
