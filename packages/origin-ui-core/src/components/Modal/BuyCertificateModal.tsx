import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { PurchasableCertificate, Contracts as MarketContracts } from '@energyweb/market';
import { ProducingDevice } from '@energyweb/device-registry';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { getConfiguration } from '../../features/selectors';
import { setLoading } from '../../features/general/actions';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { countDecimals, formatDate } from '../../utils/helper';

interface IProps {
    producingDevice: ProducingDevice.Entity;
    certificate: PurchasableCertificate.Entity;
    showModal: boolean;
    callback: () => void;
}

const DEFAULT_ENERGY_IN_BASE_UNIT = 1;

export function BuyCertificateModal(props: IProps) {
    const { callback, certificate, producingDevice, showModal } = props;

    const configuration = useSelector(getConfiguration);
    const dispatch = useDispatch();

    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );

    const energyInBaseUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
        energyInDisplayUnit
    );

    const [validation, setValidation] = useState({
        energyInDisplayUnit: false
    });

    useEffect(() => {
        if (!certificate) {
            return;
        }

        setEnergyInDisplayUnit(
            EnergyFormatter.getValueInDisplayUnit(certificate.certificate.energy)
        );

        setValidation({
            energyInDisplayUnit: true
        });
    }, [certificate]);

    function handleClose() {
        callback();
    }

    async function buyCertificate() {
        if (!certificate) {
            showNotification(`Unable to buy certificates.`, NotificationType.Error);
            return;
        }

        dispatch(setLoading(true));

        if (certificate.acceptedToken !== '0x0000000000000000000000000000000000000000') {
            const erc20TestToken = new MarketContracts.Erc20TestToken(
                configuration.blockchainProperties.web3,
                certificate.acceptedToken
            );

            await erc20TestToken.approve(
                certificate.certificate.owner,
                certificate.onChainDirectPurchasePrice
            );
        }

        await certificate.buyCertificate(energyInBaseUnit);

        dispatch(setLoading(false));

        showNotification(
            `Certificates for ${EnergyFormatter.format(energyInBaseUnit, true)} have been bought.`,
            NotificationType.Success
        );

        handleClose();
    }

    function validateInputs(event) {
        switch (event.target.id) {
            case 'energyInDisplayUnitInput':
                const newEnergyInDisplayUnit = Number(event.target.value);
                const newEnergyInBaseValueUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    newEnergyInDisplayUnit
                );

                const energyInDisplayUnitValid =
                    !isNaN(energyInDisplayUnit) &&
                    newEnergyInBaseValueUnit >= 1 &&
                    newEnergyInBaseValueUnit <= certificate.certificate.energy &&
                    countDecimals(newEnergyInDisplayUnit) <= 6;

                setEnergyInDisplayUnit(newEnergyInDisplayUnit);

                setValidation({
                    energyInDisplayUnit: energyInDisplayUnitValid
                });
                break;
        }
    }

    const isFormValid = Object.keys(validation).every(property => validation[property] === true);

    const certificateId = certificate?.id || '';
    const date = certificate ? formatDate(moment.unix(certificate.certificate.creationTime)) : '';
    const facilityName = producingDevice?.offChainProperties?.facilityName || '';

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>Buy certificate #{certificateId}</DialogTitle>
            <DialogContent>
                <TextField label="Facility" value={facilityName} fullWidth disabled />

                <TextField label="Creation date" value={date} fullWidth disabled className="mt-4" />

                <TextField
                    label={EnergyFormatter.displayUnit}
                    value={energyInDisplayUnit}
                    type="number"
                    placeholder="1"
                    onChange={e => validateInputs(e)}
                    className="mt-4"
                    id="energyInDisplayUnitInput"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={buyCertificate} color="primary" disabled={!isFormValid}>
                    Buy
                </Button>
            </DialogActions>
        </Dialog>
    );
}
