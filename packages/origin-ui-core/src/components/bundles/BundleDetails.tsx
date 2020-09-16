import React, { useState } from 'react';
import { Bundle } from '../../utils/exchange';
import {
    Dialog,
    DialogTitle,
    Grid,
    Box,
    Typography,
    Slider,
    DialogContent,
    makeStyles,
    createStyles,
    Tooltip,
    IconButton,
    Theme
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { BundleContents } from './BundleContents';
import { useSelector, useDispatch } from 'react-redux';
import { getShowBundleDetails, showBundleDetails } from '../../features/bundles';
import { useTranslation, bundlePrice, formatCurrencyComplete } from '../../utils';

interface IOwnProps {
    bundle: Bundle;
    owner: boolean;
}

const useDialogStyles = makeStyles((theme: Theme) =>
    createStyles({
        closeButton: {
            position: 'absolute',
            top: theme.spacing(1),
            right: theme.spacing(1)
        },
        tooltip: {
            backgroundColor: theme.palette.primary.main
        }
    })
);

const COUNT_OF_PRICE_MARKS = 11;

function SliderLabel(props) {
    const { children, open, value } = props;
    const styles = useDialogStyles();

    return (
        <Tooltip
            open={open}
            enterTouchDelay={0}
            placement="top"
            title={value}
            classes={{ tooltip: styles.tooltip }}
        >
            {children}
        </Tooltip>
    );
}

const BundleDetails = (props: IOwnProps) => {
    const dispatch = useDispatch();
    const showModal = useSelector(getShowBundleDetails);
    const { t } = useTranslation();
    const { bundle, owner } = props;
    let { splits } = bundle;
    const { price } = bundle;
    const prices = splits.map(({ volume }) => bundlePrice({ volume, price }));
    const maxPrice = Math.ceil(Math.max(...prices) / 10) * 10;
    const minPrice = Math.floor(Math.min(...prices) / 10) * 10;
    const styles = useDialogStyles();

    const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice]);

    splits = splits.filter(
        ({ volume }) =>
            bundlePrice({ volume, price }) >= priceRange[0] &&
            bundlePrice({ volume, price }) <= priceRange[1]
    );
    const priceStep = Math.floor((maxPrice - minPrice) / (COUNT_OF_PRICE_MARKS - 1));

    const marks = Array.from(Array(COUNT_OF_PRICE_MARKS).keys()).map((i) => {
        const from = minPrice;
        const value = from + i * priceStep;
        return { value, label: String(value) };
    });
    return (
        <Dialog
            className="BundleDetails"
            open={showModal}
            onClose={() => dispatch(showBundleDetails(false))}
            maxWidth="lg"
            fullWidth={true}
            scroll="paper"
        >
            <DialogTitle>
                {t('bundle.info.bundleDetails')}
                <IconButton
                    className={`${styles.closeButton} closeButton`}
                    onClick={() => dispatch(showBundleDetails(false))}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {prices.length > 1 && (
                    <Box mb={2}>
                        <Grid container justify="flex-end">
                            <Grid item xs={7}>
                                <Grid container direction="column">
                                    <Typography>
                                        {t('certificate.info.selectPriceRange')}
                                    </Typography>
                                    <Box pt={5}>
                                        <Slider
                                            defaultValue={[minPrice, maxPrice]}
                                            value={priceRange}
                                            onChange={(event, value) =>
                                                setPriceRange(value as number[])
                                            }
                                            marks={marks}
                                            min={minPrice}
                                            max={maxPrice}
                                            step={priceStep}
                                            valueLabelDisplay="on"
                                            valueLabelFormat={(label) =>
                                                formatCurrencyComplete(label)
                                            }
                                            ValueLabelComponent={SliderLabel}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                )}
                <Box width="97%">
                    <BundleContents splits={splits} bundle={bundle} owner={owner} />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default BundleDetails;
