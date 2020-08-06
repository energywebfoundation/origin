import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { Certificates } from './Certificates';
import { SelectedForSale } from './SelectedForSale';
import { ICertificateViewItem } from '../../features/certificates';
import { useHistory } from 'react-router-dom';
import { useLinks } from '../../utils';

export const CreateBundleForm = () => {
    const [selected, setSelected] = useState<ICertificateViewItem[]>([]);
    const history = useHistory();
    const { getCertificatesLink } = useLinks();

    return (
        <Box className="CreateBundleForm" display="grid" style={{ gridTemplateColumns: '60% 40%' }}>
            <Box className="Certificates" mr={2}>
                <Certificates selected={selected} setSelected={setSelected} />
            </Box>
            <Box className="Certificates">
                <SelectedForSale
                    certificatesToBundle={selected}
                    callback={() => history.push(`${getCertificatesLink()}/bundles`)}
                />
            </Box>
        </Box>
    );
};
