import React, { useState, useEffect } from 'react';
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
    Theme,
    createStyles
} from '@material-ui/core';
import { BundleContents } from './BudleContents';
import { useSelector, useDispatch } from 'react-redux';
import { getShowBundleDetails, showBundleDetails } from '../../features/bundles';
import { useTranslation, bundlePrice, formatCurrencyComplete } from '../../utils';
import { BigNumber } from 'ethers/utils';

interface IOwnProps {
    bundle: Bundle;
    classes;
}

const testSplit = (bundle: Bundle, n: number) => ({
    ...bundle,
    items: bundle.items.map((i) => ({
        ...i,
        currentVolume: i.currentVolume.div(n)
    }))
});

const useDialogStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            backgroundColor: '#434343'
        }
    })
);

const COUNT_OF_PRICE_MARKS = 11;

const BundleDetails = (props: IOwnProps) => {
    const { bundle } = props;
    const showModal = useSelector(getShowBundleDetails);
    const [selected, setSelected] = useState<Bundle>(null);
    const dispatch = useDispatch();
    let combinations = [bundle, testSplit(bundle, 2), testSplit(bundle, 3)].map((bndl) => ({
        ...bndl,
        volume: bndl.items.reduce((total, i) => total.add(i.currentVolume), new BigNumber(0))
    })); // splitCombinations(bundle)
    const { t } = useTranslation();
    const dialogStyles = useDialogStyles();

    const prices = combinations.map((bndl) => bundlePrice(bndl)) ?? [0];
    const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 10) * 10 : 0;
    const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices) / 10) * 10 : 100;

    const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice]);
    combinations = combinations.filter(
        (bndl) => bundlePrice(bndl) >= priceRange[0] && bundlePrice(bndl) <= priceRange[1]
    );
    const priceStep = Math.floor((maxPrice - minPrice) / (COUNT_OF_PRICE_MARKS - 1));

    const marks = Array.from(Array(COUNT_OF_PRICE_MARKS).keys()).map((i) => {
        const from = priceRange[0];
        const value = from + i * priceStep;
        return { value, label: String(value) };
    });
    console.log('>>> price range:', priceRange);
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
                                {selected && (
                                    <div>
                                        <Typography>{selected.id}</Typography>
                                    </div>
                                )}
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
                    <BundleContents combinations={combinations} bundle={selected || props.bundle} />
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
