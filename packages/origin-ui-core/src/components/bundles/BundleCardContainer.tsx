import React, { useState } from 'react';
import { Grid, IconButton } from '@material-ui/core';
import {
    ArrowBack,
    ArrowForward,
    ArrowBackIosOutlined,
    NavigateBeforeOutlined,
    NavigateNextOutlined
} from '@material-ui/icons';
import { Bundle } from '../../utils/exchange';
import { BundleCard } from './BundleCard';
import { useSelector } from 'react-redux';
import { getBundles } from '../../features/bundles';

interface IOwnProps {
    selected: Bundle;
    setSelected: (bundle: Bundle) => void;
}

const BUNDLE_LIST_SIZE = 5;

export const BundleCardContainer = (props: IOwnProps) => {
    const bundles = useSelector(getBundles);
    const { selected, setSelected } = props;

    const initialDisplayFrom = () => {
        if (bundles.length <= 5) {
            return 0;
        }
        const initial = bundles.indexOf(selected);
        const diff = initial + BUNDLE_LIST_SIZE - bundles.length;
        return diff < 0 ? initial : initial - diff;
    };

    const [displayFrom, setDisplayFrom] = useState<number>(initialDisplayFrom());
    const bundlesToDisplay: Bundle[] = bundles.slice(displayFrom, displayFrom + BUNDLE_LIST_SIZE);

    return (
        <Grid container direction="row" wrap="nowrap" spacing={1}>
            {/* {displayFrom > 0 && ( */}
            {/* <Grid item style={{ alignSelf: 'center' }}> */}
            <div style={{ position: 'relative' }}>
                <IconButton
                    disabled={displayFrom <= 0}
                    // edge="start"
                    onClick={() => setDisplayFrom(displayFrom - 1)}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: -30,
                        zIndex: 10
                    }}
                    size="medium"
                >
                    <NavigateBeforeOutlined fontSize="large" />
                </IconButton>
            </div>
            {/* </Grid> */}
            {/* )} */}
            {bundlesToDisplay.map((bundle) => (
                <Grid item xs={2} key={bundle.id} onClick={() => setSelected(bundle)}>
                    <BundleCard bundle={bundle} isSelected={bundle.id === selected.id} />
                </Grid>
            ))}
            {/* {displayFrom + BUNDLE_LIST_SIZE <= bundles.length - 1 && ( */}
            <div style={{ position: 'relative' }}>
                <IconButton
                    disabled={displayFrom + BUNDLE_LIST_SIZE >= bundles.length}
                    // edge="end"
                    onClick={() => setDisplayFrom(displayFrom + 1)}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: -30,
                        zIndex: 10
                    }}
                >
                    <NavigateNextOutlined fontSize="large" />
                </IconButton>
            </div>
            {/* )} */}
        </Grid>
    );
};
