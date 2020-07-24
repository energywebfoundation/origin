import React, { useState, useEffect } from 'react';
import {
    Box,
    useTheme,
    Grid,
    ListItemAvatar,
    Avatar,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    Input,
    InputAdornment
} from '@material-ui/core';
import { ICertificateViewItem } from '../../features/certificates';
import { ICertificateEnergy } from '../../../../issuer/src';
import { BigNumber } from 'ethers';
import {
    energyImageByType,
    moment,
    EnergyFormatter,
    deviceById,
    getEnvironment,
    getProducingDevices,
    EnergyTypes
} from '../..';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../utils';
import { Edit, HighlightOff } from '@material-ui/icons';

export interface IBundledCertificateEnergy extends ICertificateEnergy {
    volumeToBundle: BigNumber;
}

export interface IBundledCertificate extends ICertificateViewItem {
    energy: IBundledCertificateEnergy;
}

interface IOwnProps {
    certificate: IBundledCertificate;
    totalVolume: () => BigNumber;
    onChange: (cert: IBundledCertificate) => void;
}

export const BundleItemEdit = (props: IOwnProps) => {
    const { t } = useTranslation();
    const { onChange } = props;
    let totalVolume = props.totalVolume;
    const [certificate, setCertificate] = useState<IBundledCertificate>(props.certificate);
    const {
        creationTime,
        deviceId,
        energy: { volumeToBundle }
    } = certificate;
    const [selected, setSelected] = useState<boolean>(false);
    const {
        typography: { fontSizeSm, fontSizeMd },
        spacing
    } = useTheme();
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);

    useEffect(() => {
        setCertificate(certificate);
        totalVolume = props.totalVolume;
    }, [props.certificate, props.totalVolume]);

    const handleChange = (event) => {
        setCertificate({
            ...certificate,
            energy: { ...certificate.energy, volumeToBundle: BigNumber.from(event.target.value) }
        });
    };

    const resetVolumeToBundle = () => {
        setCertificate({
            ...certificate,
            energy: {
                ...certificate.energy,
                volumeToBundle: BigNumber.from(props.certificate.energy.publicVolume)
            }
        });
    };

    const setToZero = () => {
        setCertificate({
            ...certificate,
            energy: { ...certificate.energy, volumeToBundle: BigNumber.from(0) }
        });
    };

    const { province, deviceType, facilityName } = deviceById(deviceId, environment, devices);
    const type = deviceType.split(';')[0].toLowerCase() as EnergyTypes;

    return (
        <Grid container direction="column">
            <Grid item>
                <Grid container>
                    <Grid item xs={2}>
                        <ListItemAvatar>
                            <Avatar src={energyImageByType(type, true)}></Avatar>
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
                    <Grid item xs={!selected ? 4 : 3} style={{ textAlign: 'end' }}>
                        <Box fontSize={fontSizeMd} color="text.secondary">
                            {EnergyFormatter.format(volumeToBundle, true)}
                        </Box>
                        <Box fontSize={fontSizeMd}>
                            {(
                                (100 * props.certificate.energy.volumeToBundle.toNumber()) /
                                totalVolume().toNumber()
                            ).toFixed(0)}
                            %
                        </Box>
                    </Grid>

                    {!selected ? (
                        <Grid item xs={1} style={{ textAlign: 'center' }}>
                            <IconButton onClick={() => setSelected(true)}>
                                <Edit color="primary" />
                            </IconButton>
                        </Grid>
                    ) : (
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Button
                                onClick={() => {
                                    setSelected(false);
                                    resetVolumeToBundle();
                                }}
                                style={{ fontSize: fontSizeSm }}
                            >
                                {t('general.actions.cancel')}
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {selected && (
                <Grid item container>
                    <Grid item style={{ flexGrow: 1 }}>
                        <FormControl style={{ width: '100%' }}>
                            <InputLabel>{t('bundle.info.editBundleVolume')}</InputLabel>
                            <Input
                                type="text"
                                value={volumeToBundle}
                                onChange={handleChange}
                                endAdornment={
                                    <InputAdornment position="end" style={{ margin: spacing(1) }}>
                                        <IconButton onClick={setToZero}>
                                            <HighlightOff />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={2} style={{ textAlign: 'center' }}>
                        <Button
                            onClick={() => {
                                setSelected(false);
                                onChange(certificate);
                            }}
                            variant="contained"
                            color="primary"
                        >
                            {t('user.actions.save')}
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Grid>
    );
};
