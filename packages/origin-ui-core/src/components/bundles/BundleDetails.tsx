import React, { useState } from 'react';
import { Bundle } from '../../utils/exchange';
import {
    Dialog,
    DialogTitle,
    Grid,
    withStyles,
    Box,
    Typography,
    Slider,
    DialogContent,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { BundleContents } from './BundleContents';
import { useSelector, useDispatch } from 'react-redux';
import { getShowBundleDetails, showBundleDetails } from '../../features/bundles';
import { useTranslation, bundlePrice, formatCurrencyComplete } from '../../utils';

interface IOwnProps {
    bundle: Bundle;
}

const useDialogStyles = makeStyles(() =>
    createStyles({
        paper: {
            backgroundColor: '#434343'
        }
    })
);

const COUNT_OF_PRICE_MARKS = 11;

const BundleDetails = (props: IOwnProps) => {
    const { bundle } = props;
    let { splits } = bundle;
    const price = bundle.price;
    const showModal = useSelector(getShowBundleDetails);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const dialogStyles = useDialogStyles();

    const prices = splits.map(({ volume }) => bundlePrice({ volume, price })) ?? [0];
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 10) * 10 : 0;
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 10) * 10 : 100;

    const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice]);
    splits = splits.filter(
        ({ volume }) =>
            bundlePrice({ volume, price }) >= priceRange[0] &&
            bundlePrice({ volume, price }) <= priceRange[1]
    );
    const priceStep = Math.floor((maxPrice - minPrice) / (COUNT_OF_PRICE_MARKS - 1));

    const marks = Array.from(Array(COUNT_OF_PRICE_MARKS).keys()).map((i) => {
        const from = priceRange[0];
        const value = from + i * priceStep;
        return { value, label: String(value) };
    });
    return (
        <Dialog
            open={showModal}
            onClose={() => dispatch(showBundleDetails(false))}
            maxWidth="lg"
            fullWidth={true}
            scroll="paper"
            classes={{ paper: dialogStyles.paper }}
        >
            <DialogTitle>BUNDLE DETAILS</DialogTitle>
            <DialogContent>
                <Box mb={4}>
                    <Grid container justify="flex-end">
                        <Grid item xs={7}>
                            <Grid container direction="column">
                                <Typography>{t('certificate.info.selectPriceRange')}</Typography>
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
                                        valueLabelFormat={(label) => formatCurrencyComplete(label)}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>

                <Box width="97%">
                    <BundleContents splits={splits} bundle={bundle} />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const styles = {
    dialogPaper: {
        minHeight: '80vh',
        maxHeight: '80vh'
    }
};

export default withStyles(styles)(BundleDetails);
