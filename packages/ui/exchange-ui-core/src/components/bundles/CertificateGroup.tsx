import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    FormControlLabel,
    Checkbox,
    List,
    ListItemIcon,
    ListItemAvatar,
    Grid,
    Avatar,
    ListItem,
    Box,
    useTheme,
    makeStyles,
    Theme
} from '@material-ui/core';
import {
    energyImageByType,
    moment,
    EnergyFormatter,
    EnergyTypes,
    ICertificateViewItem,
    LightenColor
} from '@energyweb/origin-ui-core';
import { getEnvironment } from '../../features/general';
import { IOriginTypography } from '../../types/typography';
import { deviceById, deviceTypeChecker } from '../../utils/device';
import { useOriginConfiguration } from '../../utils/configuration';
import { MyDevice } from '../../types';

interface IOwnProps {
    certificates: ICertificateViewItem[];
    selected: ICertificateViewItem[];
    setSelected: (certs: ICertificateViewItem[]) => void;
    devices: MyDevice[];
}

const useStyles = makeStyles((theme: Theme) => ({
    icons: {
        fill: theme.palette.error.light
    }
}));

export const CertificateGroup = (props: IOwnProps) => {
    const styles = useStyles();
    const { certificates, selected, setSelected, devices } = props;
    const environment = useSelector(getEnvironment);

    const device = deviceById(certificates[0]?.deviceId, devices, environment);

    const configuration = useOriginConfiguration();
    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgColorLight = LightenColor(originBgColor, 2);
    const bgColorLighten = LightenColor(originBgColor, 4);

    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;
    const fontSizeSm = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeSm;
    const spacing = useTheme()?.spacing;

    const { t } = useTranslation();

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
        <Box className="CertificateGroup" boxShadow={2}>
            <Grid
                className="Header"
                container
                style={{
                    fontSize: fontSizeMd,
                    backgroundColor: bgColorLight
                }}
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
                            device ? (
                                <Box mb={0} fontSize={fontSizeMd} fontWeight="fontWeightBold">
                                    {deviceTypeChecker(device) ? device.province : device.address},
                                    {deviceTypeChecker(device) ? device.facilityName : device.name}
                                </Box>
                            ) : (
                                <></>
                            )
                        }
                    />
                </Grid>
                {device && (
                    <Grid item xs={5}>
                        {device.gridOperator}(
                        {deviceTypeChecker(device) ? device.gpsLongitude : device.longitude},
                        {deviceTypeChecker(device) ? device.gpsLatitude : device.latitude})
                    </Grid>
                )}
            </Grid>
            <List style={{ padding: 0 }}>
                {certificates.map((cert) => {
                    const {
                        creationTime,
                        energy: { privateVolume, publicVolume }
                    } = cert;
                    const currentDevice = deviceById(cert.deviceId, devices, environment);
                    const type = currentDevice?.deviceType
                        ?.split(';')[0]
                        ?.toLowerCase() as EnergyTypes;
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
                                backgroundColor: bgColorLighten
                            }}
                            selected={isSelected(cert)}
                            divider
                        >
                            <Grid container>
                                <Grid item xs={7} container style={{ justifyItems: 'flex-start' }}>
                                    <Grid item style={{ marginRight: spacing(2) }}>
                                        <ListItemIcon>
                                            <Checkbox color="primary" checked={isSelected(cert)} />
                                        </ListItemIcon>
                                    </Grid>

                                    <Grid item style={{ marginRight: spacing(2) }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                src={energyImageByType(type, isSelected(cert))}
                                                className={styles.icons}
                                            ></Avatar>
                                        </ListItemAvatar>
                                    </Grid>

                                    <Grid item>
                                        <Box fontSize={fontSizeMd}>{type || '-'}</Box>
                                        <Box fontSize={fontSizeMd} fontWeight="fontWeightBold">
                                            {EnergyFormatter.format(energy, true)}
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid item xs={5}>
                                    <Box fontSize={fontSizeSm} color="text.secondary">
                                        {t('certificate.properties.certificationDate')}
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
