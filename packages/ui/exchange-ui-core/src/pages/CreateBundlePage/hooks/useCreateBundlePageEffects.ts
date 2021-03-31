import { useEffect, useState } from 'react';
import { ICertificateViewItem, LightenColor, useLinks } from '@energyweb/origin-ui-core';
import { useHistory } from 'react-router-dom';
import { useOriginConfiguration } from '../../../utils/configuration';
import { useDispatch, useSelector } from 'react-redux';
import { useDeviceDataLayer } from '../../../deviceDataLayer';
import { MyDevice } from '../../../types';
import { LocationState, History } from 'history';

type UseCreateBundlePageEffectsReturnType = {
    bgColorDarker: string;
    myDevices: MyDevice[];
    setSelectedCertificateViewItem: (
        value:
            | ((prevState: ICertificateViewItem[]) => ICertificateViewItem[])
            | ICertificateViewItem[]
    ) => void;
    exchangePageUrl: string;
    history: History<LocationState>;
    selectedCertificateViewItem: ICertificateViewItem[];
};

export const useCreateBundlePageEffects = (): UseCreateBundlePageEffectsReturnType => {
    const { exchangePageUrl } = useLinks();
    const [selectedCertificateViewItem, setSelectedCertificateViewItem] = useState<
        ICertificateViewItem[]
    >([]);
    const history = useHistory<History>();
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

    const originBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const bgColorDarker = LightenColor(originBgColor, -2);
    return {
        history,
        bgColorDarker,
        selectedCertificateViewItem,
        setSelectedCertificateViewItem,
        myDevices,
        exchangePageUrl
    };
};
