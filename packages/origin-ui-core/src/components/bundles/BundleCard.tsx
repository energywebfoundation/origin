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
    makeStyles,
    Avatar,
    Theme,
    createStyles,
    ListItemAvatar,
    CardActions,
    Button,
    Box
} from '@material-ui/core';
import { Bundle } from '../../utils/exchange';
import {
    EnergyFormatter,
    deviceById,
    energyImageByType,
    getEnvironment,
    getProducingDevices,
    energyByType,
    useTranslation,
    getCurrencies
} from '../..';
import { useSelector, useDispatch } from 'react-redux';
import { EnergyTypes, formatCurrencyComplete } from '../../utils';
import { buyBundle } from '../../features/bundles';

interface IOwnProps {
    bundle: Bundle;
    isSelected: boolean;
}

const ENERGY_TYPES_TO_DISPLAY = [
    EnergyTypes.SOLAR,
    EnergyTypes.WIND,
    EnergyTypes.HYDRO,
    EnergyTypes.LIQUID,
    EnergyTypes.SOLID
];

const cardSelectedColor = '#3c2348';
const cardNotSelectedColor = '#404040';

export const BundleCard = (props: IOwnProps) => {
    const { bundle, isSelected } = props;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const { t } = useTranslation();
    const currency = useSelector(getCurrencies)[0];
    const dispatch = useDispatch();

    const energy = Object.entries(
        energyByType(bundle, environment, devices, ENERGY_TYPES_TO_DISPLAY)
    );

    const useImageClasses = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                width: theme.spacing(9),
                height: theme.spacing(9)
            }
        })
    );

    const onBuyBundle = async () => {
        dispatch(
            buyBundle({ bundleDTO: { bundleId: bundle.id, volume: bundle.volume.toString() } })
        );
    };

    const imageClasses = useImageClasses();

    return (
        <Card style={{ cursor: 'pointer' }}>
            <CardHeader
                title="Total Volume"
                subheader={EnergyFormatter.format(bundle.volume, true)}
                titleTypographyProps={{ variant: 'body2', align: 'center', color: 'textSecondary' }}
                subheaderTypographyProps={{
                    variant: 'caption',
                    align: 'center',
                    color: 'textPrimary'
                }}
                style={{ backgroundColor: isSelected ? '#9a00c7' : '#3d3d3d' }}
            />
            <CardContent style={{ padding: 0 }}>
                <List disablePadding>
                    {energy
                        .filter(([type]) => !['total', 'other'].includes(type))
                        .map(([type, volume]) => {
                            return (
                                <ListItem
                                    key={type}
                                    disableGutters
                                    style={{
                                        paddingBottom: 0,
                                        flexDirection: 'column',
                                        backgroundColor: isSelected
                                            ? cardSelectedColor
                                            : cardNotSelectedColor
                                    }}
                                    divider
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={energyImageByType(type as EnergyTypes)}
                                            classes={{ root: imageClasses.root }}
                                        ></Avatar>
                                    </ListItemAvatar>
                                    <Typography>{EnergyFormatter.format(volume, true)}</Typography>
                                </ListItem>
                            );
                        })}
                </List>

                <ListItem
                    style={{
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? cardSelectedColor : cardNotSelectedColor
                    }}
                >
                    <Typography color="textSecondary" variant="body2" noWrap>
                        Total price
                    </Typography>
                    <Typography color="textPrimary" variant="caption">
                        {formatCurrencyComplete(
                            (Number(EnergyFormatter.format(bundle.volume, false)) * bundle.price) /
                                100,
                            currency
                        )}
                    </Typography>
                    {isSelected && (
                        <Button color="primary" variant="contained" onClick={onBuyBundle}>
                            {t('certificate.actions.buy_bundle')}
                        </Button>
                    )}
                </ListItem>
            </CardContent>
        </Card>
    );
};
