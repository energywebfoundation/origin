import React, { useState } from 'react';
import { Grid, Paper } from '@material-ui/core';
import { Certificates } from './Certificates';
import { SelectedForSale } from './SelectedForSale';
import { ICertificateViewItem } from '../../features/certificates';
import { BigNumber } from 'ethers/utils';
import { useHistory } from 'react-router-dom';
import { useLinks } from '../../utils';

export const CreateBundleForm = () => {
    const [selected, setSelected] = useState<ICertificateViewItem[]>([]);
    const history = useHistory();
    const { getCertificatesLink } = useLinks();

    const totalVolume = (): BigNumber => {
        return selected.reduce(
            (total, { energy: { publicVolume, privateVolume } }) =>
                total.add(publicVolume).add(privateVolume),
            new BigNumber(0)
        );
    };

    return (
        <Paper>
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Certificates selected={selected} setSelected={setSelected} />
                    </Grid>
                    <Grid item xs={6}>
                        <SelectedForSale
                            selected={selected}
                            totalVolume={totalVolume()}
                            callback={() => history.push(`${getCertificatesLink()}/bundles`)}
                        />
                    </Grid>
                </Grid>
            </div>
        </Paper>
    );
};
