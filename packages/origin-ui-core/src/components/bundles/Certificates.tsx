import React from 'react';
import { Paper, Box, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getCertificates, ICertificateViewItem } from '../../features/certificates';
import { getProducingDevices, getEnvironment, deviceById } from '../..';
import { GroupedCertificateList } from './GroupedCertificateList';

interface IOwnProps {
    selected: ICertificateViewItem[];
    setSelected: (certIds: ICertificateViewItem[]) => void;
}

export const Certificates = (props: IOwnProps) => {
    const { selected, setSelected } = props;
    const certificates = useSelector(getCertificates);
    const devices = useSelector(getProducingDevices);
    const environment = useSelector(getEnvironment);

    const certificatesByFacility = () => {
        return certificates.reduce((grouped, cert) => {
            const { facilityName } = deviceById(cert.deviceId, environment, devices);
            grouped[facilityName] = grouped[facilityName]?.concat([cert]) || [cert];
            return grouped;
        }, {});
    };

    return (
        <Paper>
            <Box m={1}>
                <Typography variant="h5">CERTIFICATES</Typography>
            </Box>
            <GroupedCertificateList
                groups={certificatesByFacility()}
                selected={selected}
                setSelected={setSelected}
            />
        </Paper>
    );
};
