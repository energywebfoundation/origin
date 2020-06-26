import React, { useState } from 'react';
import {
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
import { Bundle, Split } from '../../utils/exchange';
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
import { KeyboardArrowUp, KeyboardArrowDown, ArrowForward, ArrowBack } from '@material-ui/icons';
import { buyBundle } from '../../features/bundles';

interface IOwnProps {
    bundle: Bundle;
    splits: Split[];
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
const cardSelectedColor = '#3a1c47';
const cardColor = '#3e3e3e';
const cardHeaderColor = '#3b3b3b';
const cardHeaderSelectedColor = '#9b00c8';
const fontSize = 12;

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
    const {
        bundle: { price, items, id },
        splits
    } = props;
    const environment = useSelector(getEnvironment);
    const devices = useSelector(getProducingDevices);
    const offerClasses = useOfferClasses();
    const [selected, setSelected] = useState<Split>(null);
    const [firstItem, setFirstItem] = useState<number>(0);
    const [firstSplit, setFirstSplit] = useState<number>(0);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currency = useSelector(getCurrencies)[0];

    const onBuyBundle = async () => {
        dispatch(buyBundle({ bundleDTO: { bundleId: id, volume: selected.volume.toString() } }));
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
            {splits.length > 5 && (
                <IconButton
                    disabled={firstSplit <= 0}
                    onClick={() => setFirstSplit(firstSplit - 1)}
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
            {splits.length > 5 && (
                <IconButton
                    disabled={firstSplit + COLUMNS_COUNT >= splits.length}
                    onClick={() => setFirstSplit(firstSplit + 1)}
                    style={{
                        backgroundColor: '#5a5a5a',
                        position: 'absolute',
                        top: '50%',
                        left: '97%',
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
                    {items.length > 5 && (
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
                    {splits.slice(firstSplit, firstSplit + COLUMNS_COUNT).map((split) => {
                        const { volume } = split;
                        return (
                            <Box
                                py={1}
                                key={bundlePrice({ volume, price })}
                                onClick={() => setSelected(split)}
                                style={{
                                    ...bundleStyle,
                                    borderRadius: '5% 5% 0 0',
                                    flexDirection: 'column'
                                }}
                                bgcolor={
                                    selected === split ? cardHeaderSelectedColor : cardHeaderColor
                                }
                            >
                                <Box fontSize={fontSize}>
                                    <Typography
                                        variant="body2"
                                        align="center"
                                        color="textSecondary"
                                    >
                                        Total Volume
                                    </Typography>
                                </Box>
                                <Box fontWeight="fontWeightBold">
                                    <Typography
                                        variant="caption"
                                        align="center"
                                        color="textPrimary"
                                    >
                                        {EnergyFormatter.format(split.volume, true)}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {items
                .slice(firstItem, firstItem + ROWS_COUNT)
                .map(
                    (
                        { asset: { deviceId, generationFrom, generationTo } },
                        itemIndex,
                        { length }
                    ) => {
                        const device = deviceById(deviceId, environment, devices);
                        return (
                            <Box
                                key={itemIndex}
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
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        <Typography
                                                            color="textSecondary"
                                                            variant="body2"
                                                        >
                                                            Facility
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        <Typography variant="caption">
                                                            {device.facilityName}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        <Typography
                                                            color="textSecondary"
                                                            variant="body2"
                                                        >
                                                            Location
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        <Typography>{device.province}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box
                                                style={{ display: 'flex', flexDirection: 'column' }}
                                            >
                                                <Box
                                                    fontSize={fontSize}
                                                    fontWeight="fontWeightBold"
                                                >
                                                    <Typography
                                                        color="textSecondary"
                                                        variant="body2"
                                                    >
                                                        Generation Date
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    fontSize={fontSize}
                                                    fontWeight="fontWeightBold"
                                                >
                                                    <Typography>
                                                        {`${moment(generationFrom).format(
                                                            'MMM, YYYY'
                                                        )}->${moment(generationTo).format(
                                                            'MMM, YYYY'
                                                        )}`}
                                                    </Typography>
                                                </Box>
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
                                    {splits
                                        .slice(firstSplit, firstSplit + COLUMNS_COUNT)
                                        .map((split) => {
                                            const { volume } = split.items[firstItem + itemIndex];
                                            const type = deviceById(deviceId, environment, devices)
                                                .deviceType.split(';')[0]
                                                .toLowerCase();
                                            return (
                                                <Box
                                                    style={{
                                                        ...bundleStyle,
                                                        flexDirection: 'column'
                                                    }}
                                                    key={bundlePrice({
                                                        price,
                                                        volume: split.volume
                                                    })}
                                                    onClick={() => setSelected(split)}
                                                    bgcolor={
                                                        selected === split
                                                            ? cardSelectedColor
                                                            : cardColor
                                                    }
                                                >
                                                    <Avatar
                                                        src={energyImageByType(
                                                            type as EnergyTypes,
                                                            selected === split
                                                        )}
                                                    />
                                                    <Box
                                                        fontWeight="fontWeightBold"
                                                        fontSize={fontSize}
                                                    >
                                                        <Typography>
                                                            {EnergyFormatter.format(volume, true)}
                                                        </Typography>
                                                    </Box>
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
                    {items.length > 5 && (
                        <Button
                            style={{
                                backgroundColor: '#5a5a5a',
                                width: '100%'
                            }}
                            onClick={() => setFirstItem(firstItem + 1)}
                            disabled={firstItem + ROWS_COUNT >= items.length}
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
                    {splits.slice(firstSplit, firstSplit + COLUMNS_COUNT).map((split) => {
                        const { volume } = split;
                        const splitPrice = bundlePrice({ volume, price });
                        return (
                            <Box
                                style={{
                                    ...bundleStyle,
                                    borderRadius: '0 0 5% 5%',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                                key={splitPrice}
                                onClick={() => setSelected(split)}
                                bgcolor={selected === split ? cardSelectedColor : cardColor}
                                mr={1}
                                pb={1}
                            >
                                <Box display="flex" flexDirection="column" fontSize={fontSize}>
                                    <Typography
                                        color="textSecondary"
                                        variant="body2"
                                        noWrap
                                        align="center"
                                    >
                                        Total price
                                    </Typography>
                                    <Box
                                        fontWeight="fontWeightBold"
                                        fontSize={fontSize}
                                        textAlign="center"
                                    >
                                        <Typography
                                            color="textPrimary"
                                            variant="caption"
                                            align="center"
                                        >
                                            {formatCurrencyComplete(splitPrice, currency)}
                                        </Typography>
                                    </Box>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={onBuyBundle}
                                        disabled={!(selected === split)}
                                    >
                                        {t('certificate.actions.buy_bundle')}
                                    </Button>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};
