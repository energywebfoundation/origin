import React from 'react';
import { Box, useTheme } from '@material-ui/core';
import { useSelector } from 'react-redux';
import {
    getCertificates,
    ICertificateViewItem,
    CertificateSource
} from '../../features/certificates';
import { getProducingDevices, getEnvironment, deviceById } from '../..';
import { GroupedCertificateList } from './GroupedCertificateList';

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
    const {
        typography: { fontSizeMd }
    } = useTheme();

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
                CERTIFICATES
            </Box>
            <GroupedCertificateList
                groups={certificatesByFacility()}
                selected={selected}
                setSelected={setSelected}
            />
        </Box>
    );
};
