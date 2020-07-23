import React from 'react';
import { Box } from '@material-ui/core';
import { ICertificateViewItem } from '../../features/certificates';
import { ICertificateEnergy } from '../../../../issuer/src';
import { BigNumber } from 'ethers';

export interface IBundledCertificateEnergy extends ICertificateEnergy {
    volumeToBundle: BigNumber;
}

export interface IBundledCertificate extends ICertificateViewItem {
    energy: IBundledCertificateEnergy;
}

interface IOwnProps {
    certificate: IBundledCertificate;
}

export const BundleItemEdit = (props: IOwnProps) => {
    const {
        certificate: {
            
            energy: { publicVolume, volumeToBundle }
        }
    } = props;

    return (
        <Box fontSize={fontSizeMd}>
            {((100 * volumeToBundle.toNumber()) / totalVolume.toNumber()).toFixed(0)}%
        </Box>
    );
};
