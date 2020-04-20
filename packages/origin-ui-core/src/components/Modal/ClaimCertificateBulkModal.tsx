import React from 'react';
import { Certificate } from '@energyweb/issuer';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { EnergyFormatter } from '../../utils';
import { bigNumberify } from 'ethers/utils';
import { requestClaimCertificateBulk } from '../../features/certificates';

interface IProps {
    certificates: Certificate[];
    showModal: boolean;
    callback: () => void;
}

export function ClaimCertificateBulkModal(props: IProps) {
    const dispatch = useDispatch();

    function handleClose() {
        props.callback();
    }

    async function claimCertificates() {
        const certificateIds: number[] = props.certificates.map((cert) => cert.id);

        dispatch(
            requestClaimCertificateBulk({
                certificateIds
            })
        );

        handleClose();
    }

    const totalEnergy = EnergyFormatter.format(
        props.certificates.reduce((a, b) => {
            const energy = b.energy.publicVolume.add(b.energy.privateVolume);
            return a.add(energy);
        }, bigNumberify(0)),
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
