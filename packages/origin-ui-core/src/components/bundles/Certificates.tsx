import React from 'react';
import {
    Paper,
    List,
    ListSubheader,
    ListItem,
    ListItemIcon,
    Checkbox,
    ListItemText,
    Grid,
    Typography,
    ListItemAvatar,
    Avatar
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { getCertificates, ICertificateViewItem } from '../../features/certificates';
import {
    getProducingDevices,
    getEnvironment,
    deviceById,
    PowerFormatter,
    energyImageByType
} from '../..';

interface IOwnProps {
    selected: ICertificateViewItem[];
    setSelected: (certIds: ICertificateViewItem[]) => void;
}

export const Certificates = (props: IOwnProps) => {
    const { selected, setSelected } = props;
    const certificates = useSelector(getCertificates);
    const devices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);

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

    const isAllSelected = (): boolean => {
        if (certificates.length === 0) {
            return false;
        }
        for (const cert of certificates) {
            if (!selected.find((s) => s.id === cert.id)) {
                return false;
            }
        }
        return true;
    };

    const toggleSelectAll = () => {
        if (isAllSelected()) {
            return setSelected([]);
        }
        const newSelected = [];
        for (const c of certificates) {
            newSelected.push(c);
        }
        return setSelected(newSelected);
    };

    const isSelected = (cert: ICertificateViewItem) => {
        return (selected.find((s) => s.id === cert.id) && true) || false;
    };

    return (
        <Paper>
            <List subheader={<ListSubheader component="div">CERTIFICATES</ListSubheader>}>
                <ListItem button onClick={toggleSelectAll}>
                    <ListItemIcon>
                        <Checkbox checked={isAllSelected()} />
                    </ListItemIcon>
                    <ListItemText primary="Select All" />
                </ListItem>
                {certificates.map((cert) => {
                    const {
                        creationTime,
                        energy: { privateVolume, publicVolume }
                    } = cert;
                    const device = deviceById(cert.deviceId, environment, devices);
                    const type = device.deviceType.split(';')[0];
                    const energy = publicVolume.add(privateVolume);
                    return (
                        <ListItem button key={cert.id} onClick={() => toggleSelect(cert)}>
                            <ListItemIcon>
                                <Checkbox checked={isSelected(cert)} />
                            </ListItemIcon>
                            <ListItemAvatar>
                                <Avatar src={energyImageByType(type)}></Avatar>
                            </ListItemAvatar>
                            <Grid container>
                                <Grid item xs={4}>
                                    <ListItemText
                                        primary={
                                            <div>
                                                <Typography>{type}</Typography>
                                                <Typography>
                                                    {PowerFormatter.format(energy.toNumber(), true)}
                                                </Typography>
                                            </div>
                                        }
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <ListItemText
                                        primary={
                                            <div>
                                                <Typography>Certification Date</Typography>
                                                <Typography>
                                                    {moment(new Date(creationTime)).format(
                                                        'MMM, YYYY'
                                                    )}
                                                </Typography>
                                            </div>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
};
