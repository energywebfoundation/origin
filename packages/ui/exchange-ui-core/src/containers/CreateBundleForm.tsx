import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import {
    useLinks,
    ICertificateViewItem,
    LightenColor,
    usePermissions,
    Requirements,
    TableFallback
} from '@energyweb/origin-ui-core';
import { Certificates, SelectedForSale } from '../components/bundles';
import { useOriginConfiguration } from '../utils/configuration';
import { useDeviceDataLayer } from '../deviceDataLayer';

export const CreateBundleForm = () => {
    const [selected, setSelected] = useState<ICertificateViewItem[]>([]);
    const history = useHistory();
    const { getExchangeLink } = useLinks();
    const configuration = useOriginConfiguration();
    const dispatch = useDispatch();

    const dataLayer = useDeviceDataLayer();
    const deviceSelector = dataLayer.getMyDevices;
    const myDevices = useSelector(deviceSelector);
    const deviceClient = dataLayer.deviceClient;
    const deviceFetcher = dataLayer.fetchMyDevices;

    useEffect(() => {
        if (deviceClient) {
            dispatch(deviceFetcher());
        }
    }, [deviceClient]);

    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }

    if (myDevices === null) {
        return <TableFallback />;
    }

    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgColorDarker = LightenColor(originBgColor, -2);

    return (
        <Box className="CreateBundleForm" display="grid" style={{ gridTemplateColumns: '60% 40%' }}>
            <Box className="Certificates" mr={2} style={{ backgroundColor: bgColorDarker }}>
                <Certificates devices={myDevices} selected={selected} setSelected={setSelected} />
            </Box>
            <Box className="Certificates" style={{ backgroundColor: bgColorDarker }}>
                <SelectedForSale
                    devices={myDevices}
                    certificatesToBundle={selected}
                    callback={() => history.push(`${getExchangeLink()}/bundles`)}
                />
            </Box>
        </Box>
    );
};
