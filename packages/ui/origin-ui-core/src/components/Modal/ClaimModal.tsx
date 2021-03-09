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
import { BigNumber } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Countries } from '@energyweb/utils-general';

import {
    ICertificateViewItem,
    requestClaimCertificate,
    requestClaimCertificateBulk
} from '../../features/certificates';
import { getUserOffchain } from '../../features/users/selectors';
import { EnergyFormatter, countDecimals } from '../../utils';
import { getEnvironment } from '../../features';
import { IEnvironment } from '../../features/general';

interface IProps {
    certificates: ICertificateViewItem[];
    showModal: boolean;
    callback: () => void;
}

export function ClaimModal(props: IProps) {
    const { certificates, callback, showModal } = props;

    const environment: IEnvironment = useSelector(getEnvironment);
    const DEFAULT_ENERGY_IN_BASE_UNIT = BigNumber.from(
        Number(environment?.DEFAULT_ENERGY_IN_BASE_UNIT || 1)
    );

    const isBulkClaim = certificates.length > 1;
    const certificateIds: number[] = certificates.map((cert) => cert.id);

    const getCountryCodeFromId = (code: string) =>
        Countries.find((country) => country.code === code)?.code;

    const user = useSelector(getUserOffchain);
    const countryCodes = Countries.map((country) => country.code);

    const [beneficiary, setBeneficiary] = useState(user?.organization?.name);
    const [address, setAddress] = useState(user?.organization?.address);
    const [zipCode, setZipCode] = useState(user?.organization?.zipCode);
    const [region, setRegion] = useState(null);
    const [countryCode, setCountryCode] = useState(
        getCountryCodeFromId(user?.organization?.country)
    );

    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );

    const energyInBaseUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
        energyInDisplayUnit
    );

    const [validation, setValidation] = useState({
        energyInDisplayUnit: true
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if (certificates.length > 0) {
            setEnergyInDisplayUnit(
                EnergyFormatter.getValueInDisplayUnit(certificates[0]?.energy.publicVolume)
            );
        }
    }, [certificates, user]);

    useEffect(() => {
        if (user?.organization) {
            setBeneficiary(user.organization.name);
            setAddress(user.organization.address);
            setCountryCode(getCountryCodeFromId(user.organization.country));
            setZipCode(user.organization.zipCode);
        }
    }, [user]);

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
            : requestClaimCertificate({
                  certificateId: certificateIds[0],
                  claimData,
                  amount: energyInBaseUnit,
                  callback: handleClose
              });

        dispatch(action);
    }

    async function validateInputs(event) {
        switch (event.target.id) {
            case 'energyInDisplayUnitInput':
                const newEnergyInDisplayUnit = Number(event.target.value);
                const newEnergyInBaseValueUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    newEnergyInDisplayUnit
                );

                const ownedPublicVolume = certificates[0]?.energy.publicVolume;

                const energyInDisplayUnitValid =
                    newEnergyInBaseValueUnit.gte(1) &&
                    newEnergyInBaseValueUnit.lte(ownedPublicVolume) &&
                    countDecimals(newEnergyInDisplayUnit) <= 6;

                setEnergyInDisplayUnit(newEnergyInDisplayUnit);

                setValidation({
                    ...validation,
                    energyInDisplayUnit: energyInDisplayUnitValid
                });
                break;
        }
    }

    const title = `Claiming certificate${isBulkClaim ? 's' : ''} ${certificateIds?.join(
        ', '
    )} in the name of:`;

    const totalEnergy = EnergyFormatter.format(
        props.certificates.reduce((a, b) => {
            const energy = b.energy.publicVolume.add(b.energy.privateVolume);
            return a.add(energy);
        }, BigNumber.from(0)),
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
                    label={EnergyFormatter.displayUnit}
                    value={energyInDisplayUnit}
                    type="number"
                    placeholder="1"
                    onChange={(e) => validateInputs(e)}
                    className="mt-4"
                    id="energyInDisplayUnitInput"
                    fullWidth
                />

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

                <div className="text-danger">
                    {!validation.energyInDisplayUnit && (
                        <div>{EnergyFormatter.displayUnit} value is invalid</div>
                    )}
                </div>
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
