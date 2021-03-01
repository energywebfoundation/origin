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
import { getEnvironment } from '../../features/general';
import { deviceById, deviceTypeChecker } from '../../utils/device';
import { IOriginTypography } from '../../types/typography';
import { MyDevice } from '../../types';

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
            const device = deviceById(cert.deviceId, devices, environment);
            const deviceName = deviceTypeChecker(device) ? device.facilityName : device.name;
            grouped[deviceName] = grouped[deviceName]?.concat([cert]) || [cert];
            return grouped;
        }, {});
    };

    return (
        <Box p={2}>
            <Box fontWeight="fontWeightBold" fontSize={fontSizeMd}>
                {t('certificate.info.certificates')}
            </Box>
            <GroupedCertificateList
                groups={certificatesByFacility()}
                selected={selected}
                setSelected={setSelected}
            />
        </Box>
    );
};
