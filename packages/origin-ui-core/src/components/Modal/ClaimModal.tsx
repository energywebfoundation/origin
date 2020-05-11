import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
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
    Select
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { Certificate } from '@energyweb/issuer';
import { getUserOffchain } from '../../features/users/selectors';
import { requestClaimCertificate } from '../../features/certificates';

interface IProps {
    certificateId: Certificate['id'];
    showModal: boolean;
    callback: () => void;
}

export function ClaimModal(props: IProps) {
    const { certificateId, callback, showModal } = props;

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
        callback();
    }

    async function claim() {
        dispatch(
            requestClaimCertificate({
                certificateId
            })
        );
    }

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Claiming certificate #${certificateId} in the name of:`}</DialogTitle>
            <DialogContent>
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
                        value={country}
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
