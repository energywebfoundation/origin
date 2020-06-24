import React, { useState } from 'react';
import { Grid, IconButton } from '@material-ui/core';
import { NavigateBeforeOutlined, NavigateNextOutlined } from '@material-ui/icons';
import { Bundle } from '../../utils/exchange';
import { BundleCard } from './BundleCard';
import { useSelector } from 'react-redux';
import { getBundles } from '../../features/bundles';
import { bundlePrice } from '../..';

interface IOwnProps {
    selected: Bundle;
    setSelected: (bundle: Bundle) => void;
    priceRange: number[];
}

const BUNDLE_LIST_SIZE = 5;

export const BundleCardContainer = (props: IOwnProps) => {
    let bundles = useSelector(getBundles);
    const { selected, setSelected, priceRange } = props;
    bundles = bundles.filter(
        (bundle) => bundlePrice(bundle) >= priceRange[0] && bundlePrice(bundle) <= priceRange[1]
    );
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
        <>
            <Grid
                container
                direction="row"
                wrap="nowrap"
                spacing={1}
                style={{ position: 'relative' }}
            >
                <IconButton
                    disabled={displayFrom <= 0}
                    onClick={() => setDisplayFrom(displayFrom - 1)}
                    style={{
                        backgroundColor: '#5a5a5a',
                        position: 'absolute',
                        top: '50%',
                        left: '-3%',
                        zIndex: 10
                    }}
                    size="medium"
                >
                    <NavigateBeforeOutlined />
                </IconButton>
                <IconButton
                    disabled={displayFrom + BUNDLE_LIST_SIZE >= bundles.length}
                    onClick={() => setDisplayFrom(displayFrom + 1)}
                    style={{
                        backgroundColor: '#5a5a5a',
                        position: 'absolute',
                        top: '50%',
                        left: '95%',
                        zIndex: 10
                    }}
                >
                    <NavigateNextOutlined />
                </IconButton>
                {bundlesToDisplay.map((bundle) => (
                    <Grid
                        item
                        style={{ width: '20%' }}
                        key={bundle.id}
                        onClick={() => setSelected(bundle)}
                    >
                        <BundleCard bundle={bundle} isSelected={bundle.id === selected.id} />
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
