import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { Bundle } from '../../utils/exchange';

interface IOwnProps {
    bundle: Bundle;
}

export const BundleCard = (props: IOwnProps) => {
    const { bundle } = props;

    return (
        <Card >
            <CardContent>{bundle.volume.toNumber()}</CardContent>
        </Card>
    );
};
