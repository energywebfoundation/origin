import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    getCertificates,
    ICertificateViewItem,
    CertificateSource
} from '@energyweb/origin-ui-core';
import { Box, useTheme } from '@material-ui/core';
import { GroupedCertificateList } from './GroupedCertificateList';
import { getEnvironment } from '../../features';
import { getDeviceName } from '../../utils';
import { MyDevice, IOriginTypography } from '../../types';

interface IOwnProps {
    selected: ICertificateViewItem[];
    setSelected: (certIds: ICertificateViewItem[]) => void;
    devices: MyDevice[];
}

export const Certificates = (props: IOwnProps) => {
    const { selected, setSelected, devices } = props;
    const certificates = useSelector(getCertificates).filter(
        (cert) => cert.source === CertificateSource.Exchange
    );

    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;
    const { t } = useTranslation();
    const environment = useSelector(getEnvironment);

    const certificatesByFacility = () => {
        return certificates.reduce((grouped, cert) => {
            const deviceName = getDeviceName(cert.deviceId, devices, environment);
            grouped[deviceName] = grouped[deviceName]?.concat([cert]) || [cert];
            return grouped;
        }, {});
    };

    const groups = devices.length === 0 ? {} : certificatesByFacility();

    return (
        <Box p={2}>
            <Box fontWeight="fontWeightBold" fontSize={fontSizeMd}>
                {t('certificate.info.certificates')}
            </Box>
            <GroupedCertificateList
                groups={groups}
                selected={selected}
                setSelected={setSelected}
                devices={devices}
            />
        </Box>
    );
};
