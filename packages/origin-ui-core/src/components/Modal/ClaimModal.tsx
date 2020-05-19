import { IClaimData } from '@energyweb/issuer';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FilledInput,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@material-ui/core';
import { bigNumberify } from 'ethers/utils';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    ICertificateViewItem,
    requestClaimCertificate,
    requestClaimCertificateBulk
} from '../../features/certificates';
import { getUserOffchain } from '../../features/users/selectors';
import { EnergyFormatter } from '../../utils';

interface IProps {
    certificates: ICertificateViewItem[];
    showModal: boolean;
    callback: () => void;
}

export function ClaimModal(props: IProps) {
    const { certificates, callback, showModal } = props;

    const isBulkClaim = certificates.length > 1;
    const certificateIds: number[] = certificates.map((cert) => cert.id);

    const user = useSelector(getUserOffchain);
    const countryCodes = moment.tz.countries();

    const [beneficiary, setBeneficiary] = useState(user?.organization?.name);
    const [address, setAddress] = useState(user?.organization?.address);
    const [zipCode, setZipCode] = useState(null);
    const [region, setRegion] = useState(null);
    const [countryCode, setCountryCode] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (countryCode === null && countryCodes && countryCodes[0]) {
            setCountryCode(countryCodes[0]);
        }
    }, [countryCodes]);

    async function handleClose() {
        callback();
    }

    async function claim() {
        const claimData: IClaimData = {
            beneficiary,
            address,
            region,
            zipCode,
            countryCode
        };

        const action = isBulkClaim
            ? requestClaimCertificateBulk({ certificateIds, claimData })
            : requestClaimCertificate({ certificateId: certificateIds[0], claimData });

        dispatch(action);

        handleClose();
    }

    const title = `Claiming certificate${isBulkClaim ? 's' : ''} ${certificateIds?.join(
        ', '
    )} in the name of:`;

    const totalEnergy = EnergyFormatter.format(
        props.certificates.reduce((a, b) => {
            const energy = b.energy.publicVolume.add(b.energy.privateVolume);
            return a.add(energy);
        }, bigNumberify(0)),
        true
    );

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {isBulkClaim && (
                    <DialogContentText>
                        You selected a total of {totalEnergy} worth of certificates.
                    </DialogContentText>
                )}

                <TextField
                    label="Beneficiary"
                    value={beneficiary ?? ''}
                    onChange={(e) => setBeneficiary(e.target.value as string)}
                    className="mt-4"
                    fullWidth
                />
                <TextField
                    label="Address"
                    value={address ?? ''}
                    onChange={(e) => setAddress(e.target.value as string)}
                    className="mt-4"
                    fullWidth
                />
                <TextField
                    label="Region"
                    value={region ?? ''}
                    onChange={(e) => setRegion(e.target.value as string)}
                    className="mt-4"
                    fullWidth
                />
                <TextField
                    label="ZIP"
                    value={zipCode ?? ''}
                    onChange={(e) => setZipCode(e.target.value as string)}
                    className="mt-4"
                    fullWidth
                />

                <FormControl fullWidth={true} variant="filled" className="mt-4">
                    <InputLabel>Country</InputLabel>
                    <Select
                        value={countryCode ?? countryCodes[0]}
                        onChange={(e) => setCountryCode(e.target.value as string)}
                        fullWidth
                        variant="filled"
                        input={<FilledInput />}
                    >
                        {countryCodes?.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={claim} color="primary">
                    Claim
                </Button>
            </DialogActions>
        </Dialog>
    );
}
