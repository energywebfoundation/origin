import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { BigNumber } from 'ethers';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    resyncCertificate,
    requestDepositCertificate,
    getEnvironment,
    ICertificateViewItem,
    getUserOffchain,
    EnergyFormatter,
    formatDate,
    countDecimals,
    IEnvironment
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '../../types';

interface IProps {
    certificate: ICertificateViewItem;
    device: ComposedPublicDevice;
    showModal: boolean;
    callback: () => void;
}

export function DepositModal(props: IProps) {
    const { certificate, callback, device, showModal } = props;
    const user = useSelector(getUserOffchain);
    const environment: IEnvironment = useSelector(getEnvironment);
    const DEFAULT_ENERGY_IN_BASE_UNIT = BigNumber.from(
        Number(environment?.DEFAULT_ENERGY_IN_BASE_UNIT || 1)
    );
    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );
    const [validation, setValidation] = useState({
        energyInDisplayUnit: true
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if (certificate) {
            setEnergyInDisplayUnit(
                EnergyFormatter.getValueInDisplayUnit(certificate.energy.publicVolume)
            );
        }
    }, [certificate, user]);

    async function handleClose() {
        dispatch(resyncCertificate(certificate));
        callback();
    }

    async function validateInputs(event) {
        switch (event.target.id) {
            case 'energyInDisplayUnitInput':
                const newEnergyInDisplayUnit = Number(event.target.value);
                const newEnergyInBaseValueUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    newEnergyInDisplayUnit
                );

                const ownedPublicVolume = certificate.energy.publicVolume;

                const energyInDisplayUnitValid =
                    newEnergyInBaseValueUnit.gte(1) &&
                    newEnergyInBaseValueUnit.lt(ownedPublicVolume) &&
                    countDecimals(newEnergyInDisplayUnit) === 0;

                setEnergyInDisplayUnit(newEnergyInDisplayUnit);

                setValidation({
                    ...validation,
                    energyInDisplayUnit: energyInDisplayUnitValid
                });
                break;
        }
    }

    const isFormValid = validation.energyInDisplayUnit;

    async function deposit() {
        if (!isFormValid) {
            return;
        }
        const amount = EnergyFormatter.getBaseValueFromValueInDisplayUnit(energyInDisplayUnit);
        dispatch(
            requestDepositCertificate({
                certificateId: certificate.id,
                amount,
                callback
            })
        );
    }

    const certificateId = certificate ? certificate.id : '';
    const deviceName = device ? device.name : '';

    let creationTime: string;

    try {
        creationTime = certificate && formatDate(moment.unix(certificate.creationTime), true);
    } catch (error) {
        console.error('Error: Can not get creation time', error);
    }

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Deposit #${certificateId}`}</DialogTitle>
            <DialogContent>
                <TextField label="Facility" value={deviceName} fullWidth disabled />

                {creationTime && (
                    <>
                        <TextField
                            label="Creation time"
                            value={creationTime}
                            fullWidth
                            disabled
                            className="mt-4"
                        />
                    </>
                )}

                <TextField
                    label={EnergyFormatter.displayUnit}
                    type="number"
                    value={energyInDisplayUnit}
                    className="mt-4"
                    id="energyInDisplayUnitInput"
                    onChange={(e) => validateInputs(e)}
                    placeholder="1"
                    fullWidth
                />
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
                <Button onClick={deposit} color="primary" disabled={!isFormValid}>
                    Deposit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
