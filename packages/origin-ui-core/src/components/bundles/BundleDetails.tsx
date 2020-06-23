import React, { useState, useEffect } from 'react';
import { Bundle } from '../../utils/exchange';
import { Dialog, DialogTitle, Grid, withStyles, Box, Typography, Slider } from '@material-ui/core';
import { BundleContents } from './BudleContents';
import { BundleCardContainer } from './BundleCardContainer';
import { useSelector, useDispatch } from 'react-redux';
import { getShowBundleDetails, showBundleDetails, getBundles } from '../../features/bundles';
import { useTranslation, bundlePrice } from '../../utils';

interface IOwnProps {
    selected: Bundle;
    classes;
}

const COUNT_OF_PRICE_MARKS = 11;

const BundleDetails = (props: IOwnProps) => {
    const showModal = useSelector(getShowBundleDetails);
    const [selected, setSelected] = useState<Bundle>(props.selected);
    const dispatch = useDispatch();
    const bundles = useSelector(getBundles);
    const { t } = useTranslation();

    const prices = bundles.map((bundle) => bundlePrice(bundle));
    const maxPrice = Math.ceil(Math.max(...prices) / 10) * 10;
    const minPrice = Math.floor(Math.min(...prices) / 10) * 10;

    const [priceRange, setPriceRange] = useState<number[]>([minPrice ?? 0, maxPrice ?? 0]);
    const priceStep = Math.floor((maxPrice - minPrice) / (COUNT_OF_PRICE_MARKS - 1));

    useEffect(() => {
        setPriceRange([minPrice, maxPrice]);
    }, [bundles]);

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
        >
            <DialogTitle>BUNDLE DETAILS</DialogTitle>
            <div>
                <Box mb={4}>
                    <Grid container justify="flex-end">
                        <Grid item xs={8}>
                            <Grid container direction="column">
                                <Typography>{t('certificate.info.selectPriceRange')}</Typography>
                                <Box pt={4}>
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
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
                <Grid container>
                    <Grid item xs={4} style={{ alignSelf: 'stretch' }}>
                        <BundleContents bundle={selected || props.selected} />
                    </Grid>
                    <Grid item xs={8}>
                        <BundleCardContainer
                            selected={selected || props.selected}
                            setSelected={setSelected}
                            priceRange={priceRange}
                        />
                    </Grid>
                </Grid>
            </div>
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
