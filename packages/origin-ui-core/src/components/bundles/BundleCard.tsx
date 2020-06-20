import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Grid,
    Paper,
    ListItem,
    List,
    ListItemIcon,
    SvgIcon,
    CardMedia,
    withStyles,
    makeStyles
} from '@material-ui/core';
import { Bundle } from '../../utils/exchange';
import {
    EnergyFormatter,
    deviceById,
    energyImageByType,
    getEnvironment,
    getProducingDevices,
    energyByType
} from '../..';
import { useSelector } from 'react-redux';
import { EnergyTypes } from '../../utils';

interface IOwnProps {
    bundle: Bundle;
}

const useCardClasses = makeStyles({
    root: {
        backgroundColor: '#282828',
        width: '100%'
    }
});

const ENERGY_TYPES_TO_DISPLAY = [
    EnergyTypes.SOLAR,
    EnergyTypes.WIND,
    EnergyTypes.HYDRO,
    EnergyTypes.LIQUID,
    EnergyTypes.SOLID
];

export const BundleCard = (props: IOwnProps) => {
    const { bundle } = props;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);

    const energy = Object.entries(
        energyByType(bundle, environment, devices, ENERGY_TYPES_TO_DISPLAY)
    );
    const cardClasses = useCardClasses();

    return (
        <Card>
            <CardHeader
                title="Total Volume"
                subheader={EnergyFormatter.format(bundle.volume, true)}
                titleTypographyProps={{ variant: 'body2', align: 'center', color: 'textSecondary' }}
                subheaderTypographyProps={{
                    variant: 'caption',
                    align: 'center',
                    color: 'textPrimary'
                }}
            />
            <CardContent>
                <List>
                    {energy
                        .filter(([type]) => !['total', 'other'].includes(type))
                        .map(([type, volume]) => {
                            return (
                                <ListItem key={type} disableGutters >
                                    <Card classes={{ root: cardClasses.root }}>
                                        <CardMedia
                                            src={energyImageByType(type as EnergyTypes)}
                                            component="img"
                                        />
                                        <CardContent>
                                            <Typography>
                                                {EnergyFormatter.format(volume, true)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </ListItem>
                            );
                        })}
                </List>
            </CardContent>
        </Card>
    );
};
