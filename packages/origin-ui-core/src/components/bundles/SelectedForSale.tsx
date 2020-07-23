import React, { useState } from 'react';
import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import {
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Grid,
    Checkbox,
    Button,
    FormControlLabel,
    Box,
    useTheme
} from '@material-ui/core';
import { ICertificateViewItem, reloadCertificates } from '../../features/certificates';
import {
    deviceById,
    getEnvironment,
    getProducingDevices,
    moment,
    energyImageByType,
    getCurrencies
} from '../..';
import { useSelector, useDispatch } from 'react-redux';
import { BigNumber } from 'ethers';
import { formatCurrencyComplete, useTranslation, EnergyFormatter, EnergyTypes } from '../../utils';
import { createBundle } from '../../features/bundles';
import { BundleItemDTO } from '../../utils/exchange';
import { Unit } from '@energyweb/utils-general';
import { BundleItemEdit, IBundledCertificate } from './BundleItemEdit';

interface IOwnProps {
    certificatesToBundle: ICertificateViewItem[];
    totalVolume: BigNumber;
    callback: () => void;
}

export const SelectedForSale = (props: IOwnProps) => {
    const { totalVolume, callback } = props;
    const certificatesToBundle: IBundledCertificate[] = props.certificatesToBundle.map((c) => ({
        ...c,
        energy: { ...c.energy, volumeToBundle: c.energy.publicVolume }
    }));
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const [price, setPrice] = useState(0);
    const [sellAsBundle, setSellAsBundle] = useState(false);
    const currency = useSelector(getCurrencies)[0];
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const {
        typography: { fontSizeMd }
    } = useTheme();

    async function requestCreateBundle() {
        const items: BundleItemDTO[] = [];
        for (const cert of certificatesToBundle) {
            const {
                assetId,
                energy: { privateVolume, publicVolume, volumeToBundle }
            } = cert;
            items.push({
                assetId,
                volume: volumeToBundle
            });
        }
        dispatch(
            createBundle({
                bundleDTO: {
                    price: Number((price * 100).toFixed(0)),
                    items
                },
                callback
            })
        );
        dispatch(reloadCertificates());
    }

    return (
        <Box p={2} fontSize={fontSizeMd}>
            <Box fontWeight="fontWeightBold" mb={1}>
                SELECTED FOR SALE
            </Box>

            {certificatesToBundle.length > 0 && (
                <List>
                    {certificatesToBundle.map((cert, index, arr) => {
                        const {
                            creationTime,
                            energy: { privateVolume, publicVolume }
                        } = cert;
                        const { province, deviceType, facilityName } = deviceById(
                            cert.deviceId,
                            environment,
                            devices
                        );
                        const type = deviceType.split(';')[0].toLowerCase() as EnergyTypes;
                        const energy = publicVolume.add(privateVolume);
                        return (
                            <Box
                                className="CertificateForSale"
                                mb={index === arr.length - 1 ? 0 : 1}
                                key={cert.id}
                            >
                                <ListItem>
                                    <Grid container>
                                        <Grid item xs={2}>
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={energyImageByType(type, true)}
                                                ></Avatar>
                                            </ListItemAvatar>
                                        </Grid>

                                        <Grid item xs={5}>
                                            <Box fontSize={fontSizeMd} fontWeight="fontWeightBold">
                                                {province}, {facilityName}
                                            </Box>
                                            <Box fontSize={fontSizeMd} color="text.secondary">
                                                {moment.unix(creationTime).format('MMM, YYYY')}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={5} style={{ textAlign: 'end' }}>
                                            <Box fontSize={fontSizeMd} color="text.secondary">
                                                {EnergyFormatter.format(energy, true)}
                                            </Box>
                                            <BundleItemEdit certificate={cert} />
                                        </Grid>
                                    </Grid>
                                </ListItem>
                            </Box>
                        );
                    })}
                </List>
            )}

            <Box my={2} mx={1}>
                <Grid container justify="space-between">
                    <Grid item>
                        <Box fontSize={fontSizeMd} color="text.secondary">
                            {t('bundle.properties.totalVolume')}
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box fontSize={fontSizeMd} color="text.primary" fontWeight="fontWeightBold">
                            {EnergyFormatter.format(totalVolume, true)}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <CurrencyTextField
                fullWidth
                variant="filled"
                required
                label={t('bundle.properties.price')}
                currencySymbol="$"
                outputFormat="number"
                value={price}
                onChange={(event, value) => setPrice(value)}
                minimumValue="0"
            />
            <Box display="flex" mt={2} mx={1} justifyContent="space-between">
                <Box color="text.secondary">Total Price</Box>
                <Box fontWeight="fontWeightBold">
                    {formatCurrencyComplete(
                        (totalVolume.toNumber() / Unit[EnergyFormatter.displayUnit]) * price,
                        currency
                    )}
                </Box>
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        color="primary"
                        checked={sellAsBundle}
                        onChange={() => setSellAsBundle(!sellAsBundle)}
                    />
                }
                label={
                    <Box color="text.secondary" fontSize={fontSizeMd}>
                        {t('bundle.actions.sellAsBundle')}
                    </Box>
                }
            ></FormControlLabel>
            <Button
                fullWidth
                color="primary"
                onClick={requestCreateBundle}
                variant="contained"
                disabled={!sellAsBundle || certificatesToBundle.length < 2 || price === 0}
            >
                {`${t('bundle.info.Sell')} ${certificatesToBundle.length} ${t(
                    'bundle.info.certificates'
                )}`}
            </Button>
        </Box>
    );
};
