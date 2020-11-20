import React from 'react';
import { useSelector } from 'react-redux';
import { Dialog, Grid, IconButton, useTheme, Box, Divider, Button } from '@material-ui/core';
import { Close as CloseIcon, ArrowRightAlt as ArrowRightAltIcon } from '@material-ui/icons';
import { OrderSide } from '@energyweb/exchange-core';
import {
    moment,
    formatCurrencyComplete,
    getCurrencies,
    getEnvironment,
    getProducingDevices,
    EnergyFormatter,
    deviceById,
    useTranslation,
    DATE_FORMAT_INCLUDING_TIME,
    LightenColor
} from '@energyweb/origin-ui-core';
import { Order } from '../../utils/exchange';
import { IOriginTypography } from '../../types/typography';
import { useOriginConfiguration } from '../../utils/configuration';

interface IOwnProps {
    order: Order;
    close: () => void;
    showCancelOrder: (order: Order) => void;
}

export const OrderDetailsModal = (props: IOwnProps) => {
    const { t } = useTranslation();
    const anyOption = t('order.anyValue');
    const { order, close, showCancelOrder } = props;
    const {
        filled,
        asset,
        product: { generationFrom, generationTo, location, deviceType, gridOperator = anyOption }
    } = order;

    const spacing = useTheme().spacing;
    const textPrimary = useTheme().palette?.text?.primary;
    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;
    const fontSizeLg = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeLg;

    const configuration = useOriginConfiguration();
    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;

    const bgLighten = LightenColor(originBgColor, 2);
    const bgDarken = LightenColor(originBgColor, -2);

    const currency = useSelector(getCurrencies)[0];
    const primaryDeviceType = deviceType ? deviceType[0].split(';')[0] : anyOption;
    const region = location ? location[0].split(';')[1] : anyOption;
    const devices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);

    return (
        <Dialog
            open={order !== null}
            onClose={close}
            style={{ fontSize: fontSizeMd }}
            className="OrderModal"
            fullWidth={true}
        >
            <Grid container direction="column" style={{ alignItems: 'stretch' }} wrap="nowrap">
                <Grid
                    item
                    container
                    direction="column"
                    style={{ paddingLeft: spacing(2), paddingRight: spacing(2) }}
                >
                    <Grid item style={{ alignSelf: 'flex-end' }}>
                        <IconButton onClick={close}>
                            <CloseIcon style={{ color: textPrimary }} />
                        </IconButton>
                    </Grid>
                    <Grid item style={{ alignSelf: 'start' }}>
                        <Box pb={1} fontWeight="fontWeightLight">
                            {moment(order.validFrom).format(DATE_FORMAT_INCLUDING_TIME)}
                        </Box>
                    </Grid>
                    <Grid item container style={{ paddingBottom: spacing(1) }}>
                        <Grid item xs>
                            <Box color="text.secondary">Order No.</Box>
                            <Box fontWeight="fontWeightLight">{order.id}</Box>
                        </Grid>
                        <Grid item xs>
                            <Box
                                textAlign="right"
                                fontWeight="fontWeightBold"
                                fontSize={fontSizeLg}
                            >
                                {formatCurrencyComplete(order.price / 100, currency)}
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
                        paddingRight: spacing(2),
                        backgroundColor: bgLighten
                    }}
                    className="EnergySection"
                >
                    <Grid item>
                        <Box fontWeight="fontWeightBold" fontSize={fontSizeLg}>
                            {EnergyFormatter.format(order.currentVolume, true)}
                        </Box>
                        <Box style={{ textTransform: 'capitalize' }}>{primaryDeviceType}</Box>
                        {order.side === OrderSide.Ask && (
                            <Box>
                                {asset?.deviceId
                                    ? deviceById(asset.deviceId, environment, devices).facilityName
                                    : anyOption}
                            </Box>
                        )}
                    </Grid>
                    <Grid item>
                        <Box textAlign="right" color="text.secondary">
                            {moment(generationFrom).format('MMM, YYYY')}
                            <ArrowRightAltIcon />
                            {moment(generationTo).format('MMM, YYYY')}
                        </Box>
                    </Grid>
                </Grid>

                {order.side === OrderSide.Bid && (
                    <Box m={1}>
                        <Grid
                            container
                            style={{
                                padding: spacing(1),
                                backgroundColor: bgDarken
                            }}
                            className="DeviceSection"
                        >
                            <Grid item xs={4}>
                                <Box color="text.secondary">
                                    {t('device.properties.deviceType')}
                                </Box>
                                <Box
                                    fontWeight="fontWeightBold"
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {primaryDeviceType}
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box color="text.secondary">
                                    {t('device.properties.gridOperator')}
                                </Box>
                                <Box fontWeight="fontWeightBold">{gridOperator}</Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box textAlign="right" color="text.secondary">
                                    {t('device.properties.region')}
                                </Box>
                                <Box textAlign="right" fontWeight="fontWeightBold">
                                    {region}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                <Grid
                    item
                    className="FilledSection"
                    style={{
                        paddingTop: spacing(1),
                        paddingBottom: spacing(1),
                        paddingLeft: spacing(2),
                        paddingRight: spacing(2),
                        backgroundColor: bgLighten
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
                        paddingRight: spacing(1),
                        backgroundColor: bgLighten
                    }}
                    className="Action"
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => showCancelOrder(order)}
                    >
                        {t('order.actions.remove')}
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
};
