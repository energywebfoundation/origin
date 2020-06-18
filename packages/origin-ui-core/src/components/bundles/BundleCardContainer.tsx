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
    console.log('>>> bundles: ', bundles);

    return (
        <Grid container direction="row" alignItems="center" wrap="nowrap">
            <IconButton>
                    <ArrowBack />
                </IconButton>
            <Grid item xs={false} zeroMinWidth={true}>
                
            </Grid>
            {bundles.map((bundle) => (
                <Grid item xs={2} key={bundle.id}>
                    <BundleCard bundle={bundle} />
                </Grid>
            ))}
            <Grid item xs={false} zeroMinWidth={true}>
                <IconButton>
                    <ArrowForward />
                </IconButton>
            </Grid>
            <Grid item xs={3} />
        </Grid>
    );
};
