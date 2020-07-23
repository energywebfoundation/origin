import React, { useState } from 'react';
import { Box, useTheme, Grid, ListItemAvatar, Avatar } from '@material-ui/core';
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

export interface IBundledCertificateEnergy extends ICertificateEnergy {
    volumeToBundle: BigNumber;
}

export interface IBundledCertificate extends ICertificateViewItem {
    energy: IBundledCertificateEnergy;
}

interface IOwnProps {
    certificate: IBundledCertificate;
    totalVolume: BigNumber;
}

export const BundleItemEdit = (props: IOwnProps) => {
    const {
        certificate: {
            creationTime,
            deviceId,
            energy: { publicVolume, volumeToBundle }
        },
        totalVolume
    } = props;
    const [selected, setSelected] = useState<boolean>(false);
    const {
        typography: { fontSizeMd }
    } = useTheme();
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);

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
                    <Grid item xs={5} style={{ textAlign: 'end' }}>
                        <Box fontSize={fontSizeMd} color="text.secondary">
                            {EnergyFormatter.format(energy, true)}
                        </Box>
                    </Grid>
                </Grid>
                <Box fontSize={fontSizeMd}>
                    {((100 * volumeToBundle.toNumber()) / totalVolume.toNumber()).toFixed(0)}%
                </Box>
            </Grid>
            {selected && <Grid item></Grid>}
        </Grid>
    );
};
