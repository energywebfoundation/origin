import React from 'react';
import { Certificate } from '@energyweb/issuer';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getConfiguration } from '../../features/selectors';
import { EnergyFormatter } from '../../utils/EnergyFormatter';

interface IProps {
    certificates: Certificate.Entity[];
    showModal: boolean;
    callback: () => void;
}

export function ClaimCertificateBulkModal(props: IProps) {
    const configuration = useSelector(getConfiguration);

    function handleClose() {
        props.callback();
    }

    async function claimCertificates() {
        const certificateIds: number[] = props.certificates.map(cert => cert.id);

        await Certificate.claimCertificates(certificateIds, configuration);

        showNotification(`Certificates have been claimed.`, NotificationType.Success);
        handleClose();
    }

    const totalEnergy = EnergyFormatter.format(
        props.certificates.reduce((a, b) => a + Number(b.energy), 0),
        true
    );

    return (
        <Dialog open={props.showModal} onClose={handleClose}>
            <DialogTitle>Claim certificates</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You selected a total of {totalEnergy} worth of certificates.
                </DialogContentText>
                <DialogContentText>Would you like to proceed with claiming them?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={claimCertificates} color="primary">
                    Claim
                </Button>
            </DialogActions>
        </Dialog>
    );
}
