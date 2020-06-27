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
    const { facilityName, gpsLatitude, gpsLongitude, gridOperator } = deviceById(
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
            {/* <Box bgcolor="#373737" display="flex" alignItems="center"> */}
            <Grid
                container
                style={{ backgroundColor: '#373737', fontSize: fontSizeMd }}
                alignItems="center"
            >
                <Grid item xs={6}>
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
                                {facilityName}
                            </Box>
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    {/* <Box fontSize={fontSizeMd}> */}
                    {gridOperator} ({gpsLongitude}, {gpsLatitude}){/* </Box> */}
                </Grid>
            </Grid>
            {/* </Box> */}
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
                                backgroundColor: isSelected(cert) ? '#3a2146' : 'inherit'
                            }}
                            divider
                        >
                            <ListItemIcon>
                                <Checkbox color="primary" checked={isSelected(cert)} />
                            </ListItemIcon>
                            <ListItemAvatar>
                                <Avatar src={energyImageByType(type, isSelected(cert))}></Avatar>
                            </ListItemAvatar>
                            <Grid container>
                                <Grid item xs={4}>
                                    <Box fontSize={fontSizeMd}>{type}</Box>
                                    <Box fontSize={fontSizeMd} fontWeight="fontWeightBold">
                                        {EnergyFormatter.format(energy, true)}
                                    </Box>
                                </Grid>
                                <Grid item xs={8}>
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
