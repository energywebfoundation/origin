import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import {
    useLinks,
    ICertificateViewItem,
    LightenColor,
    useDevicePermissions
} from '@energyweb/origin-ui-core';
import { Certificates, SelectedForSale } from '../components/bundles';
import { useOriginConfiguration } from '../utils/configuration';
import { Requirements } from '@energyweb/origin-ui-core/dist/src/components/Requirements';

export const CreateBundleForm = () => {
    const [selected, setSelected] = useState<ICertificateViewItem[]>([]);
    const history = useHistory();
    const { getExchangeLink } = useLinks();
    const configuration = useOriginConfiguration();
    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgColorDarker = LightenColor(originBgColor, -2);

    const { canCreateDevice } = useDevicePermissions();

    if (!canCreateDevice?.value) {
        return <Requirements />;
    }

    return (
        <Box className="CreateBundleForm" display="grid" style={{ gridTemplateColumns: '60% 40%' }}>
            <Box className="Certificates" mr={2} style={{ backgroundColor: bgColorDarker }}>
                <Certificates selected={selected} setSelected={setSelected} />
            </Box>
            <Box className="Certificates" style={{ backgroundColor: bgColorDarker }}>
                <SelectedForSale
                    certificatesToBundle={selected}
                    callback={() => history.push(`${getExchangeLink()}/bundles`)}
                />
            </Box>
        </Box>
    );
};
