import React from 'react';
import { Grid, IconButton } from '@material-ui/core';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { Bundle } from '../../utils/exchange';
import { BundleCard } from './BundleCard';
import { useSelector } from 'react-redux';
import { getBundles } from '../../features/bundles';

interface IOwnProps {}

export const BundleCardContainer = (props: IOwnProps) => {
    const bundles = useSelector(getBundles);

    const showScrollButtons = bundles.length > 5;

    return (
        <Grid container direction="row" alignItems="stretch" wrap="nowrap" spacing={1}>
            {showScrollButtons && (
                <IconButton>
                    <ArrowBack />
                </IconButton>
            )}
            {bundles.map((bundle) => (
                <Grid item xs={2} key={bundle.id}>
                    <BundleCard bundle={bundle} />
                </Grid>
            ))}
            {showScrollButtons && (
                <Grid item xs={false} zeroMinWidth={true}>
                    <IconButton>
                        <ArrowForward />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};
