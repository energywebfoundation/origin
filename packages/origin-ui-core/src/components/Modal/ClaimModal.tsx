import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { bigNumberify } from 'ethers/utils';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    FilledInput,
    MenuItem,
    Select,
    DialogContentText
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { Certificate } from '@energyweb/issuer';
import { getUserOffchain } from '../../features/users/selectors';
import { requestClaimCertificate, requestClaimCertificateBulk } from '../../features/certificates';
import { EnergyFormatter } from '../../utils';

interface IProps {
    certificates: Certificate[];
    showModal: boolean;
    callback: () => void;
}

export function ClaimModal(props: IProps) {
    const { certificates, callback, showModal } = props;

    const isBulkClaim = certificates.length > 1;
    const certificateIds: number[] = certificates.map((cert) => cert.id);

    const user = useSelector(getUserOffchain);
    const countries = moment.tz.countries();

    const [zipCode, setZipCode] = useState(null);
    const [region, setRegion] = useState(null);
    const [country, setCountry] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (country === null && countries && countries[0]) {
            setCountry(countries[0]);
        }
    }, [countries]);

    async function handleClose() {
        setZipCode(null);
        setRegion(null);
        setCountry(null);
        callback();
    }

    async function claim() {
        const action = isBulkClaim
            ? requestClaimCertificateBulk({ certificateIds })
            : requestClaimCertificate({ certificateId: certificateIds[0] });

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
                    value={user?.organization?.name ?? ''}
                    className="mt-4"
                    fullWidth
                />
                <TextField
                    label="Address"
                    value={user?.organization?.address ?? ''}
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
                        value={country ?? countries[0]}
                        onChange={(e) => setCountry(e.target.value as string)}
                        fullWidth
                        variant="filled"
                        input={<FilledInput />}
                    >
                        {countries?.map((item) => (
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
