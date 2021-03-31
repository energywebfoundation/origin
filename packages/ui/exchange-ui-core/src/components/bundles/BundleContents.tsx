import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Typography,
    Paper,
    makeStyles,
    Theme,
    createStyles,
    Button,
    Box,
    IconButton,
    Avatar,
    useTheme
} from '@material-ui/core';
import {
    KeyboardArrowUp,
    KeyboardArrowDown,
    ArrowForward,
    ArrowBack,
    ArrowRightAlt
} from '@material-ui/icons';
import { UserStatus } from '@energyweb/origin-backend-core';
import {
    EnergyFormatter,
    EnergyTypes,
    energyImageByType,
    formatCurrencyComplete,
    fromGeneralSelectors,
    fromUsersSelectors
} from '@energyweb/origin-ui-core';
import { IOriginTypography } from '../../types/typography';
import { getEnvironment } from '../../features/general';
import { buyBundle } from '../../features/bundles';
import { Bundle, Split } from '../../utils/exchange';
import { bundlePrice } from '../../utils/bundles';
import { deviceById, deviceTypeChecker } from '../../utils/device';
import { useOriginConfiguration } from '../../utils/configuration';
import { AnyDevice } from '../../types';

import moment from 'moment';

interface IOwnProps {
    bundle: Bundle;
    owner: boolean;
    splits: Split[];
    devices: AnyDevice[];
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingLeft: theme.spacing(2),
            height: '100%'
        }
    })
);

const ROWS_COUNT = 5;
const COLUMNS_COUNT = 5;

const topGridTemplateRows = 'auto';
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
    const { bundle, splits, devices } = props;
    const { price, items, id } = bundle;

    const offerClasses = useStyles();
    const [selected, setSelected] = useState<Split>(null);
    const [firstItem, setFirstItem] = useState<number>(0);
    const [firstSplit, setFirstSplit] = useState<number>(0);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const environment = useSelector(getEnvironment);
    const currency = useSelector(fromGeneralSelectors.getCurrencies)[0];
    const configuration = useOriginConfiguration();
    const originSimpleTextColor = configuration?.styleConfig?.SIMPLE_TEXT_COLOR;

    const fontSize = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;

    const onBuyBundle = async () => {
        dispatch(buyBundle({ bundleDTO: { bundleId: id, volume: selected.volume.toString() } }));
    };

    const action = {
        onClick: onBuyBundle,
        label: 'certificate.actions.buy_bundle'
    };

    const fifthFromEnd = (arrayLength: number) => {
        return arrayLength < 5 ? 0 : arrayLength - 5;
    };

    useEffect(() => {
        if (firstSplit > fifthFromEnd(splits.length)) {
            setFirstSplit(fifthFromEnd(splits.length));
        }
    }, [splits]);

    const status = useSelector(fromUsersSelectors.getUserOffchain)?.status;
    const userIsActive = status === UserStatus.Active;

    return (
        <Box
            style={{
                position: 'relative',
                width: '100%',
                display: 'grid',
                gridTemplateRows: topGridTemplateRows
            }}
        >
            {splits.length > COLUMNS_COUNT && (
                <IconButton
                    disabled={firstSplit <= 0}
                    onClick={() => setFirstSplit(firstSplit - 1)}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '38%',
                        zIndex: 10,
                        color: originSimpleTextColor
                    }}
                    className="ScrollButton"
                    size="small"
                >
                    <ArrowBack />
                </IconButton>
            )}
            {splits.length > COLUMNS_COUNT && (
                <IconButton
                    disabled={firstSplit >= fifthFromEnd(splits.length)}
                    onClick={() => setFirstSplit(firstSplit + 1)}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '98%',
                        zIndex: 10,
                        color: originSimpleTextColor
                    }}
                    className="ScrollButton"
                    size="small"
                >
                    <ArrowForward />
                </IconButton>
            )}
            <Box
                style={{
                    ...rowStyle
                }}
            >
                <Box mr={0.5} display="flex" flexDirection="column" justifyContent="flex-end">
                    {items.length > ROWS_COUNT && (
                        <Button
                            className="ScrollButton"
                            style={{
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
                                className={selected === split ? 'SelectedCardHeader' : 'CardHeader'}
                                py={1}
                                key={bundlePrice({ volume, price })}
                                onClick={() => setSelected(split)}
                                style={{
                                    ...bundleStyle,
                                    borderRadius: '5% 5% 0 0',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box fontSize={fontSize}>
                                    <Typography
                                        variant="body2"
                                        align="center"
                                        color="textSecondary"
                                    >
                                        {t('bundle.properties.totalVolume')}
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
                        { id: itemId, asset: { deviceId, generationFrom, generationTo } },
                        itemIndex,
                        { length }
                    ) => {
                        const device = deviceById(deviceId, devices, environment);
                        return (
                            <Box
                                key={itemIndex}
                                style={{
                                    ...rowStyle,
                                    borderBottomStyle: itemIndex === length - 1 ? 'none' : 'solid',
                                    borderBottomWidth: 2
                                }}
                                className="BundleOffer"
                            >
                                <Box mr={0.5}>
                                    <Paper
                                        className="BundleOfferInfo"
                                        variant="outlined"
                                        classes={{ root: offerClasses.root }}
                                        elevation={1}
                                    >
                                        <Box
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '50% 50%',
                                                padding: '10px'
                                            }}
                                        >
                                            <Box>
                                                <Box
                                                    style={{
                                                        display: 'grid',
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
                                                            {t('device.properties.facility')}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        {device && (
                                                            <Typography variant="caption">
                                                                {deviceTypeChecker(device)
                                                                    ? device.facilityName
                                                                    : device.name}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        <Typography
                                                            color="textSecondary"
                                                            variant="body2"
                                                        >
                                                            {t('device.properties.location')}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        fontSize={fontSize}
                                                        fontWeight="fontWeightBold"
                                                    >
                                                        {device && (
                                                            <Typography>
                                                                {deviceTypeChecker(device)
                                                                    ? device.province
                                                                    : device.address}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box
                                                style={{ display: 'flex', flexDirection: 'column' }}
                                                ml={1}
                                            >
                                                <Box
                                                    fontSize={fontSize}
                                                    fontWeight="fontWeightBold"
                                                >
                                                    <Typography
                                                        color="textSecondary"
                                                        variant="body2"
                                                    >
                                                        {t('certificate.properties.generationDate')}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    fontSize={fontSize}
                                                    fontWeight="fontWeightBold"
                                                >
                                                    <Typography color="textPrimary" variant="body2">
                                                        {moment(generationFrom).format('MMM, YYYY')}
                                                        <ArrowRightAlt />
                                                        {moment(generationTo).format('MMM, YYYY')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>
                                <Box
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: bundlesGridTemplatesColumns
                                    }}
                                >
                                    {splits
                                        .slice(firstSplit, firstSplit + COLUMNS_COUNT)
                                        .map((split) => {
                                            const { volume } = split.items.find(
                                                ({ id: splitItemId }) => splitItemId === itemId
                                            );
                                            const type = device
                                                ? (device.deviceType
                                                      .split(';')[0]
                                                      .toLowerCase() as EnergyTypes)
                                                : EnergyTypes.SOLAR;
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
                                                    className={
                                                        selected === split
                                                            ? 'SelectedCardContent'
                                                            : 'CardContent'
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
                                                        color={
                                                            selected === split
                                                                ? 'text.primary'
                                                                : 'text.secondary'
                                                        }
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
                    {items.length > ROWS_COUNT && (
                        <Button
                            className="ScrollButton"
                            style={{
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
                                className={
                                    selected === split ? 'SelectedCardContent' : 'CardContent'
                                }
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
                                        {t('certificate.properties.totalPrice')}
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
                                    {!bundle.own && userIsActive && (
                                        <Button
                                            color="primary"
                                            variant="contained"
                                            onClick={action.onClick}
                                            disabled={!(selected === split)}
                                        >
                                            {t(action.label)}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};
