import React, { useState } from 'react';
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
    totalVolume: BigNumber;
    onChange: (cert: IBundledCertificate) => void;
}

export const BundleItemEdit = (props: IOwnProps) => {
    const { t } = useTranslation();
    const { certificate, totalVolume, onChange } = props;
    const {
        creationTime,
        deviceId,
        energy: { publicVolume, volumeToBundle }
    } = certificate;
    const [selected, setSelected] = useState<boolean>(false);
    const {
        typography: { fontSizeMd }
    } = useTheme();
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);

    const handleChange = (event) => {
        certificate.energy.publicVolume = event.target.value;
        onChange(certificate);
    };

    const resetVolumeToBundle = () => {
        certificate.energy.publicVolume = BigNumber.from(0);
        onChange(certificate);
    };

    const { province, deviceType, facilityName } = deviceById(deviceId, environment, devices);
    const type = deviceType.split(';')[0].toLowerCase() as EnergyTypes;
    const energy = publicVolume;

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
                            {EnergyFormatter.format(energy, true)}
                        </Box>
                        <Box fontSize={fontSizeMd}>
                            {((100 * volumeToBundle.toNumber()) / totalVolume.toNumber()).toFixed(
                                0
                            )}
                            %
                        </Box>
                    </Grid>

                    {!selected ? (
                        <Grid item xs={1}>
                            <IconButton onClick={() => setSelected(true)}>
                                <Edit />
                            </IconButton>
                        </Grid>
                    ) : (
                        <Grid item xs={1}>
                            <Button onClick={() => setSelected(false)}>
                                {t('general.actions.cancel')}
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {selected && (
                <Grid item container>
                    <Grid item xs={8}>
                        <FormControl>
                            <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                            <Input
                                type="text"
                                value={publicVolume}
                                onChange={handleChange}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton onClick={resetVolumeToBundle}>
                                            <HighlightOff />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            onClick={() => setSelected(false)}
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
