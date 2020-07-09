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
        product: { generationFrom, generationTo, externalDeviceId, location }
    } = ask;
    const {
        spacing,
        palette: {
            text: { primary: textPrimary }
        },
        typography: { fontSizeSm, fontSizeLg }
    } = useTheme();
    const currency = useSelector(getCurrencies)[0];
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const deviceType = deviceById(externalDeviceId.id, environment, devices)
        .deviceType.split(';')[0]
        .toLowerCase();
    const { t } = useTranslation();

    return (
        <Dialog
            open={ask !== null}
            onClose={close}
            style={{ fontSize: fontSizeSm }}
            className="OrderModal"
            fullWidth={true}
        >
            <Grid container direction="column" style={{ alignItems: 'stretch' }}>
                <Grid
                    item
                    container
                    direction="column"
                    style={{ paddingLeft: spacing(2), paddingRight: spacing(2) }}
                >
                    <Grid item style={{ alignSelf: 'end' }}>
                        <IconButton onClick={close}>
                            <CloseIcon style={{ color: textPrimary }} />
                        </IconButton>
                    </Grid>
                    <Grid item style={{ alignSelf: 'start' }}>
                        <Box pb={1} fontWeight="fontWeightLight">
                            {moment(ask.validFrom).format('MMM Do, YYYY h:mm:ss a')}
                        </Box>
                    </Grid>
                    <Grid item container style={{ paddingBottom: spacing(1) }}>
                        <Grid item xs>
                            <Box color="text.secondary">Order No.</Box>
                            <Box fontWeight="fontWeightLight">{ask.id}</Box>
                        </Grid>
                        <Grid item xs>
                            <Box
                                textAlign="right"
                                fontWeight="fontWeightBold"
                                fontSize={fontSizeLg}
                            >
                                {formatCurrencyComplete(ask.price / 100, currency)}
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    style={{
                        paddingTop: spacing(1),
                        paddingBottom: spacing(1),
                        paddingLeft: spacing(2),
                        paddingRight: spacing(2)
                    }}
                    className="EnergySection"
                >
                    <Grid item>
                        <Box fontWeight="fontWeightBold" fontSize={fontSizeLg}>
                            {EnergyFormatter.format(ask.currentVolume, true)}
                        </Box>
                        <Box style={{ textTransform: 'capitalize' }}>{deviceType}</Box>
                    </Grid>
                    <Grid item>
                        <Box textAlign="right" color="text.secondary">
                            {moment(generationFrom).format('MMM, YYYY')}
                            <ArrowRightAltIcon />
                            {moment(generationTo).format('MMM, YYYY')}
                        </Box>
                    </Grid>
                </Grid>

                <Box mx={1} my={1}>
                    <Grid
                        container
                        style={{
                            paddingTop: spacing(1),
                            paddingBottom: spacing(1),
                            paddingLeft: spacing(1),
                            paddingRight: spacing(1)
                        }}
                        className="DeviceSection"
                    >
                        <Grid item xs={4}>
                            <Box color="text.secondary">{t('device.properties.deviceType')}</Box>
                            <Box
                                fontWeight="fontWeightBold"
                                style={{ textTransform: 'capitalize' }}
                            >
                                {deviceType}
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box color="text.secondary">{t('device.properties.gridOperator')}</Box>
                            <Box fontWeight="fontWeightBold">{ask.product.gridOperator}</Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box textAlign="right" color="text.secondary">
                                {t('device.properties.region')}
                            </Box>
                            <Box textAlign="right" fontWeight="fontWeightBold">
                                {location[0].split(';')[1]}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Grid
                    item
                    className="FilledSection"
                    style={{
                        paddingTop: spacing(1),
                        paddingBottom: spacing(1),
                        paddingLeft: spacing(2),
                        paddingRight: spacing(2)
                    }}
                >
                    <Box color="text.secondary">{t('order.properties.filled')}</Box>
                    <Box color="text.secondary">{filled || '-'}</Box>
                </Grid>
                <Divider />
                <Grid
                    item
                    style={{
                        textAlign: 'end',
                        paddingTop: spacing(1),
                        paddingBottom: spacing(1),
                        paddingRight: spacing(1)
                    }}
                    className="Action"
                >
                    <Button variant="contained" color="primary" onClick={() => cancelAsk(ask)}>
                        {t('order.actions.remove')}
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
};
