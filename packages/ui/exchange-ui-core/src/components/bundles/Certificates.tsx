import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    getProducingDevices,
    getEnvironment,
    deviceById,
    getCertificates,
    ICertificateViewItem,
    CertificateSource
} from '@energyweb/origin-ui-core';
import { Box, useTheme } from '@material-ui/core';
import { GroupedCertificateList } from './GroupedCertificateList';
import { IOriginTypography } from '../../types/typography';

interface IOwnProps {
    selected: ICertificateViewItem[];
    setSelected: (certIds: ICertificateViewItem[]) => void;
}

export const Certificates = (props: IOwnProps) => {
    const { selected, setSelected } = props;
    const certificates = useSelector(getCertificates).filter(
        (cert) => cert.source === CertificateSource.Exchange
    );
    const devices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);
    const fontSizeMd = ((useTheme().typography as unknown) as IOriginTypography)?.fontSizeMd;
    const { t } = useTranslation();

    const certificatesByFacility = () => {
        return certificates.reduce((grouped, cert) => {
            const { facilityName } = deviceById(cert.deviceId, environment, devices);
            grouped[facilityName] = grouped[facilityName]?.concat([cert]) || [cert];
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
