import React from 'react';
import { ICertificateViewItem } from '../../features/certificates';
import {
    Card,
    FormControlLabel,
    Checkbox,
    CardContent,
    List,
    ListItemIcon,
    ListItemAvatar,
    Grid,
    Typography,
    ListItemText,
    Avatar,
    ListItem,
    Box,
    useTheme,
    Button
} from '@material-ui/core';
import { getProducingDevices, getEnvironment } from '../..';
import { useSelector } from 'react-redux';
import { deviceById, energyImageByType, moment, EnergyFormatter, EnergyTypes } from '../../utils';

interface IOwnProps {
    certificates: ICertificateViewItem[];
    selected: ICertificateViewItem[];
    setSelected: (certs: ICertificateViewItem[]) => void;
}

export const CertificateGroup = (props: IOwnProps) => {
    const { certificates, selected, setSelected } = props;
    const devices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);
    const { facilityName, gpsLatitude, gpsLongitude, gridOperator, province } = deviceById(
        certificates[0]?.deviceId,
        environment,
        devices
    );
    const {
        typography: { fontSizeMd, fontSizeSm }
    } = useTheme();

    const isAllSelected = () => certificates.every((cert) => selected.includes(cert));

    const toggleSelectAll = () => {
        const allUnselected = selected.filter((c) => !certificates.includes(c));
        if (isAllSelected()) {
            setSelected(allUnselected);
        } else {
            setSelected(allUnselected.concat(certificates));
        }
    };

    const isSelected = (cert: ICertificateViewItem) => {
        return selected.map((s) => s.id).includes(cert.id);
    };

    const toggleSelect = (cert: ICertificateViewItem) => {
        const pos = selected.findIndex((c) => c.id === cert.id);
        const newSelected = [...selected];
        if (pos === -1) {
            newSelected.push(cert);
        } else {
            newSelected.splice(pos, 1);
        }
        setSelected(newSelected);
    };

    return (
        <Box boxShadow={2} bgcolor="#3b3b3b">
            <Grid
                container
                style={{ backgroundColor: '#373737', fontSize: fontSizeMd }}
                alignItems="center"
            >
                <Grid item xs={7}>
                    <FormControlLabel
                        style={{ marginBottom: 0, marginLeft: 0 }}
                        control={
                            <Checkbox
                                color="primary"
                                checked={isAllSelected()}
                                onClick={toggleSelectAll}
                            />
                        }
                        label={
                            <Box mb={0} fontSize={fontSizeMd} fontWeight="fontWeightBold">
                                {province}, {facilityName}
                            </Box>
                        }
                    />
                </Grid>
                <Grid item xs={5}>
                    {gridOperator} ({gpsLongitude}, {gpsLatitude})
                </Grid>
            </Grid>
            <List>
                {certificates.map((cert) => {
                    const {
                        creationTime,
                        energy: { privateVolume, publicVolume }
                    } = cert;
                    const device = deviceById(cert.deviceId, environment, devices);
                    const type = device.deviceType.split(';')[0].toLowerCase() as EnergyTypes;
                    const energy = publicVolume.add(privateVolume);
                    return (
                        <ListItem
                            button
                            key={cert.id}
                            onClick={() => toggleSelect(cert)}
                            style={{
                                textTransform: 'capitalize',
                                paddingLeft: 0,
                                paddingRight: 0,
                                backgroundColor: isSelected(cert) ? '#3a2146' : 'inherit'
                            }}
                            divider
                        >
                            <Grid container>
                                <Grid item xs={2}>
                                    <ListItemIcon>
                                        <Checkbox color="primary" checked={isSelected(cert)} />
                                    </ListItemIcon>
                                </Grid>

                                <Grid item xs={2}>
                                    <ListItemAvatar>
                                        <Avatar
                                            src={energyImageByType(type, isSelected(cert))}
                                        ></Avatar>
                                    </ListItemAvatar>
                                </Grid>

                                <Grid item xs={3}>
                                    <Box fontSize={fontSizeMd}>{type}</Box>
                                    <Box fontSize={fontSizeMd} fontWeight="fontWeightBold">
                                        {EnergyFormatter.format(energy, true)}
                                    </Box>
                                </Grid>
                                <Grid item xs={5}>
                                    <Box fontSize={fontSizeSm} color="text.secondary">
                                        Certification Date
                                    </Box>
                                    <Box fontSize={fontSizeMd}>
                                        {moment.unix(creationTime).format('MMM, YYYY')}
                                    </Box>
                                </Grid>
                            </Grid>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};
