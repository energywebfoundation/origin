import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import CurrencyTextField from '@unicef/material-ui-currency-textfield';
import {
    List,
    ListItem,
    Grid,
    Checkbox,
    Button,
    FormControlLabel,
    Box,
    useTheme
} from '@material-ui/core';
import { Unit } from '@energyweb/utils-general';
import {
    getCurrencies,
    ICertificateViewItem,
    reloadCertificates,
    formatCurrencyComplete,
    EnergyFormatter
} from '@energyweb/origin-ui-core';
import { getEnvironment } from '../../features/general';
import { createBundle } from '../../features/bundles';
import { BundleItemDTO } from '../../utils/exchange';
import { BundleItemEdit, IBundledCertificate } from './BundleItemEdit';
import { IOriginTypography } from '../../types/typography';
import { MyDevice } from '../../types';
import { useOriginConfiguration } from '../../utils/configuration';
import { deviceById } from '../../utils/device';

interface IOwnProps {
    certificatesToBundle: ICertificateViewItem[];
    callback: () => void;
    devices: MyDevice[];
}

export const SelectedForSale = (props: IOwnProps) => {
    const { callback, devices } = props;
    const [certificatesToBundle, setCertificatesToBundle] = useState<IBundledCertificate[]>([]);
    const [price, setPrice] = useState(0);
    const [sellAsBundle, setSellAsBundle] = useState(false);
    const environment = useSelector(getEnvironment);
    const currency = useSelector(getCurrencies)[0];
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const configuration = useOriginConfiguration();
    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;

    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;

    const totalVolume = () =>
        certificatesToBundle.reduce(
            (total, { energy: { volumeToBundle } }) => total.add(volumeToBundle),
            BigNumber.from(0)
        );

    useEffect(() => {
        setCertificatesToBundle(
            props.certificatesToBundle.map((c) => ({
                ...c,
                energy: { ...c.energy, volumeToBundle: c.energy.publicVolume }
            }))
        );
    }, [props.certificatesToBundle]);

    const handleItemEdit = (cert: IBundledCertificate) => {
        setCertificatesToBundle(certificatesToBundle.map((c) => (c.id === cert.id ? cert : c)));
    };

    async function requestCreateBundle() {
        const items: BundleItemDTO[] = [];
        for (const cert of certificatesToBundle) {
            const {
                assetId,
                energy: { volumeToBundle }
            } = cert;
            items.push({
                assetId,
                volume: volumeToBundle.toString()
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
                        return (
                            <Box
                                className="CertificateForSale"
                                mb={index === arr.length - 1 ? 0 : 1}
                                key={cert.id}
                            >
                                <ListItem style={{ backgroundColor: originBgColor }}>
                                    <BundleItemEdit
                                        device={deviceById(cert.deviceId, devices, environment)}
                                        certificate={cert}
                                        totalVolume={totalVolume}
                                        onChange={handleItemEdit}
                                    />
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
                            {EnergyFormatter.format(totalVolume(), true)}
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
                        (totalVolume().toNumber() / Unit[EnergyFormatter.displayUnit]) * price,
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
