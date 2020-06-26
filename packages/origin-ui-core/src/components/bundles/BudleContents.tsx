import React, { useState } from 'react';
import {
    Grid,
    Typography,
    Paper,
    makeStyles,
    Theme,
    createStyles,
    Button,
    Box,
    IconButton,
    Avatar
} from '@material-ui/core';
import { Bundle } from '../../utils/exchange';
import { useSelector, useDispatch } from 'react-redux';
import {
    getEnvironment,
    getProducingDevices,
    deviceById,
    moment,
    EnergyFormatter,
    bundlePrice,
    EnergyTypes,
    energyImageByType,
    formatCurrencyComplete,
    useTranslation,
    getCurrencies
} from '../..';
import {
    KeyboardArrowUp,
    KeyboardArrowDown,
    NavigateBeforeOutlined,
    NavigateNextOutlined,
    ArrowForward,
    ArrowBack
} from '@material-ui/icons';
import { buyBundle } from '../../features/bundles';
import React from 'react';

interface IOwnProps {
    bundle: Bundle;
    combinations: Bundle[];
}

const useOfferClasses = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingLeft: theme.spacing(2),
            backgroundColor: '#4c4c4c',
            height: '100%'
        }
    })
);

const ROWS_COUNT = 5;
const COLUMNS_COUNT = 5;
const ITEMS_WIDTH = '40%';
const cardSelectedColor = '#3a1c47';
const cardColor = '#3e3e3e';
const cardHeaderColor = '#3b3b3b';
const cardHeaderSelectedColor = '#9b00c8';
const fontSize = 7;

const topGridTemplateRows = `10% ${'15% '.repeat(6)}`;
const topGridTemplateColumns = '40% 60%';
const bundlesGridTemplatesColumns = '20% '.repeat(5);

const bundleStyle = {
    cursor: 'pointer',
    marginRight: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const rowStyle = {
    display: 'grid',
    gridTemplateColumns: topGridTemplateColumns
};

export const BundleContents = (props: IOwnProps) => {
    const { bundle, combinations } = props;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const offerClasses = useOfferClasses();
    const [selected, setSelected] = useState<Bundle>(null);
    const [firstItem, setFirstItem] = useState<number>(0);
    const [firstBundle, setFirstBundle] = useState<number>(0);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currency = useSelector(getCurrencies)[0];

    const onBuyBundle = async () => {
        dispatch(
            buyBundle({ bundleDTO: { bundleId: bundle.id, volume: bundle.volume.toString() } })
        );
    };

    return (
        <Box
            style={{
                position: 'relative',
                width: '100%',
                display: 'grid',
                gridTemplateRows: topGridTemplateRows
            }}
        >
            {combinations.length > 4 && (
                <IconButton
                    disabled={firstBundle <= 0}
                    onClick={() => setFirstBundle(firstBundle - 1)}
                    style={{
                        backgroundColor: '#5a5a5a',
                        position: 'absolute',
                        top: '50%',
                        left: '37%',
                        zIndex: 10
                    }}
                    size="medium"
                >
                    <ArrowBack />
                </IconButton>
            )}
            {combinations.length > 4 && (
                <IconButton
                    disabled={firstBundle + COLUMNS_COUNT >= combinations.length}
                    onClick={() => setFirstBundle(firstBundle + 1)}
                    style={{
                        backgroundColor: '#5a5a5a',
                        position: 'absolute',
                        top: '50%',
                        left: '102%',
                        zIndex: 10
                    }}
                >
                    <ArrowForward />
                </IconButton>
            )}
            <Box
                style={{
                    ...rowStyle
                }}
            >
                <Box mr={0.5} display="flex" flexDirection="column" justifyContent="end">
                    {bundle.items.length > 4 && (
                        <Button
                            style={{
                                backgroundColor: '#5a5a5a',
                                width: '100%'
                            }}
                            onClick={() => setFirstItem(firstItem - 1)}
                            disabled={firstItem === 0}
                        >
                            <KeyboardArrowUp />
                        </Button>
                    )}
                </Box>
                <Box
                    style={{
                        display: 'grid',
                        gridTemplateColumns: bundlesGridTemplatesColumns
                    }}
                >
                    {combinations.slice(firstBundle, firstBundle + COLUMNS_COUNT).map((comb) => (
                        <Box
                            py={1}
                            key={bundlePrice(comb)}
                            onClick={() => setSelected(comb)}
                            style={{
                                ...bundleStyle,
                                borderRadius: '5% 5% 0 0'
                            }}
                            bgcolor={selected === comb ? cardHeaderSelectedColor : cardHeaderColor}
                        >
                            <Typography variant="body2" align="center" color="textSecondary">
                                Total Volume
                            </Typography>
                            <Typography variant="caption" align="center" color="textPrimary">
                                <Box fontWeight="fontWeightBold">
                                    {EnergyFormatter.format(comb.volume, true)}
                                </Box>
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {bundle.items
                .slice(firstItem, firstItem + ROWS_COUNT)
                .map(
                    (
                        { asset: { deviceId, generationFrom, generationTo }, currentVolume },
                        itemIndex,
                        { length }
                    ) => {
                        const device = deviceById(deviceId, environment, devices);
                        return (
                            <Box
                                key={JSON.stringify(`${deviceId}${generationFrom}${generationTo}`)}
                                style={{
                                    ...rowStyle
                                }}
                            >
                                <Box mr={0.5}>
                                    <Paper
                                        variant="outlined"
                                        classes={{ root: offerClasses.root }}
                                        elevation={1}
                                    >
                                        <Box
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '50% 50%'
                                            }}
                                        >
                                            <Box>
                                                <Box
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                >
                                                    <Typography
                                                        color="textSecondary"
                                                        variant="body2"
                                                    >
                                                        Facility
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        <Box
                                                            fontSize={fontSize}
                                                            fontWeight="fontWeightBold"
                                                        >
                                                            {device.facilityName}
                                                        </Box>
                                                    </Typography>
                                                    <Typography
                                                        color="textSecondary"
                                                        variant="body2"
                                                    >
                                                        Location
                                                    </Typography>
                                                    <Typography>{device.province}</Typography>
                                                </Box>
                                            </Box>
                                            <Box
                                                style={{ display: 'flex', flexDirection: 'column' }}
                                            >
                                                <Typography color="textSecondary" variant="body2">
                                                    Generation Date
                                                </Typography>
                                                <Typography>
                                                    {`${moment(generationFrom).format(
                                                        'MMM, YYYY'
                                                    )}->${moment(generationTo).format(
                                                        'MMM, YYYY'
                                                    )}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                                <Box
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: bundlesGridTemplatesColumns,
                                        borderBottomStyle:
                                            itemIndex === length - 1 ? 'none' : 'solid',
                                        borderBottomColor: '#434343',
                                        borderBottomWidth: 2
                                    }}
                                >
                                    {combinations
                                        .slice(firstBundle, firstBundle + COLUMNS_COUNT)
                                        .map((comb) => {
                                            const type = deviceById(deviceId, environment, devices)
                                                .deviceType.split(';')[0]
                                                .toLowerCase();
                                            return (
                                                <Box
                                                    style={{
                                                        ...bundleStyle
                                                    }}
                                                    key={comb.price}
                                                    onClick={() => setSelected(comb)}
                                                    bgcolor={
                                                        selected === comb
                                                            ? cardSelectedColor
                                                            : cardColor
                                                    }
                                                >
                                                    <Avatar
                                                        src={energyImageByType(type as EnergyTypes)}
                                                    />
                                                    <Typography>
                                                        <Box fontWeight="fontWeightBold">
                                                            {EnergyFormatter.format(
                                                                currentVolume,
                                                                true
                                                            )}
                                                        </Box>
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                </Box>
                            </Box>
                        );
                    }
                )}
            <Box
                style={{
                    ...rowStyle
                }}
            >
                <Box mr={0.5} display="flex" flexDirection="column" justifyItems="start">
                    {bundle.items.length > 4 && (
                        <Button
                            style={{
                                backgroundColor: '#5a5a5a',
                                width: '100%'
                            }}
                            onClick={() => setFirstItem(firstItem + 1)}
                            disabled={firstItem + ROWS_COUNT >= bundle.items.length}
                        >
                            <KeyboardArrowDown />
                        </Button>
                    )}
                </Box>
                <Box
                    style={{
                        display: 'grid',
                        gridTemplateColumns: bundlesGridTemplatesColumns
                    }}
                >
                    {combinations.map((comb) => (
                        <Box
                            style={{ ...bundleStyle, borderRadius: '0 0 5% 5%' }}
                            key={comb.price}
                            onClick={() => setSelected(comb)}
                            bgcolor={selected === comb ? cardSelectedColor : cardColor}
                            mr={1}
                            pb={1}
                        >
                            <Box display="flex" flexDirection="column">
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                    noWrap
                                    align="center"
                                >
                                    Total price
                                </Typography>
                                <Typography color="textPrimary" variant="caption" align="center">
                                    <Box fontWeight="fontWeightBold">
                                        {formatCurrencyComplete(bundlePrice(bundle), currency)}
                                    </Box>
                                </Typography>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={onBuyBundle}
                                    disabled={!(selected === comb)}
                                >
                                    {t('certificate.actions.buy_bundle')}
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
