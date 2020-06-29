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
import { ICertificateViewItem } from '../../features/certificates';
import {
    deviceById,
    getEnvironment,
    getProducingDevices,
    moment,
    energyImageByType,
    getCurrencies
} from '../..';
import { useSelector, useDispatch } from 'react-redux';
import { BigNumber } from 'ethers/utils';
import { formatCurrencyComplete, useTranslation, EnergyFormatter, EnergyTypes } from '../../utils';
import { createBundle } from '../../features/bundles';
import { BundleItemDTO } from '../../utils/exchange';
import { Unit } from '@energyweb/utils-general';

interface IOwnProps {
    selected: ICertificateViewItem[];
    totalVolume: BigNumber;
    callback: () => void;
}

export const SelectedForSale = (props: IOwnProps) => {
    const { selected, totalVolume, callback } = props;
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
        for (const cert of selected) {
            const {
                assetId,
                energy: { privateVolume, publicVolume }
            } = cert;
            items.push({
                assetId,
                volume: privateVolume.add(publicVolume).toString()
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
    }

    return (
        <Box p={2} fontSize={fontSizeMd}>
            <Box fontWeight="fontWeightBold" mb={1}>
                SELECTED FOR SALE
            </Box>

            {selected.length > 0 && (
                <List>
                    {selected.map((cert, index, arr) => {
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
                                            <Box fontSize={fontSizeMd}>
                                                {(
                                                    (100 * energy.toNumber()) /
                                                    totalVolume.toNumber()
                                                ).toFixed(0)}
                                                %
                                            </Box>
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
                            Total Volume
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
                        Sell as bundle
                    </Box>
                }
            ></FormControlLabel>
            <Button
                fullWidth
                color="primary"
                onClick={requestCreateBundle}
                variant="contained"
                disabled={!sellAsBundle || selected.length < 2 || price === 0}
            >
                Sell {selected.length} certificates
            </Button>
        </Box>
    );
};
