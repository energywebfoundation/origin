import React from 'react';
import { Dialog, Grid, IconButton, useTheme, Box, Divider, Button } from '@material-ui/core';
import { Order } from '../../utils/exchange';
import { Close as CloseIcon, ArrowRightAlt as ArrowRightAltIcon } from '@material-ui/icons';
import {
    moment,
    formatCurrencyComplete,
    getCurrencies,
    getEnvironment,
    getProducingDevices
} from '../..';
import { useSelector } from 'react-redux';
import { EnergyFormatter, deviceById, useTranslation } from '../../utils';

interface IOwnProps {
    ask: Order;
    close: () => void;
    cancelAsk: (ask: Order) => void;
}

export const AskDetailsModal = (props: IOwnProps) => {
    const { ask, close, cancelAsk } = props;
    const {
        filled,
        product: { generationFrom, generationTo, externalDeviceId }
    } = ask;
    const {
        spacing,
        palette: {
            text: { primary: textPrimary }
        },
        typography: { fontSizeSm }
    } = useTheme();
    const currency = useSelector(getCurrencies)[0];
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const deviceType = deviceById(externalDeviceId.id, environment, devices)
        .deviceType.split(';')[0]
        .toLowerCase();
    const { t } = useTranslation();

    return (
        <Dialog open={ask !== null} onClose={close} style={{ fontSize: fontSizeSm }}>
            <Grid container direction="column" style={{ padding: spacing(2) }}>
                <Grid item style={{ alignSelf: 'end' }}>
                    <IconButton onClick={close}>
                        <CloseIcon style={{ color: textPrimary }} />
                    </IconButton>
                </Grid>
                <Grid item style={{ alignSelf: 'start' }}>
                    <Box color="text.primary">
                        {moment(ask.validFrom).format('MMM Do, YYYY h:mm:ss a')}
                    </Box>
                </Grid>
                <Grid item container style={{ paddingBottom: spacing(1) }}>
                    <Grid item>
                        <Box>Order No.</Box>
                        <Box>{ask.id}</Box>
                    </Grid>
                    <Grid item>
                        <Box>{formatCurrencyComplete(ask.price / 100, currency)}</Box>
                    </Grid>
                </Grid>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    style={{ paddingTop: spacing(1), paddingBottom: spacing(1) }}
                >
                    <Grid item>
                        <Box>{EnergyFormatter.format(ask.currentVolume, true)}</Box>
                        <Box>{deviceType}</Box>
                    </Grid>
                    <Grid item>
                        <Box>
                            {moment(generationFrom).format('MMM, YYYY')}
                            <ArrowRightAltIcon />
                            {moment(generationTo).format('MMM, YYYY')}
                        </Box>
                    </Grid>
                </Grid>
                <Grid container style={{ paddingTop: spacing(1), paddingBottom: spacing(1) }}>
                    <Grid item>
                        <Box>{t('device.properties.deviceType')}</Box>
                        <Box fontWeight="fontWeightBold">{deviceType}</Box>
                    </Grid>
                    <Grid item>
                        <Box>{t('device.properties.gridOperator')}</Box>
                        <Box fontWeight="fontWeightBold">{ask.product.gridOperator}</Box>
                    </Grid>
                    <Grid item></Grid>
                </Grid>
                <Grid item style={{ alignSelf: 'start' }}>
                    <Box>{t('order.properties.filled')}</Box>
                    <Box>{filled || '-'}</Box>
                </Grid>
                <Divider />
                <Grid item style={{ alignSelf: 'end' }}>
                    <Button variant="contained" color="primary" onClick={() => cancelAsk(ask)}>
                        {t('order.actions.remove')}
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
};
