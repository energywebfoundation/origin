import { ProducingDevice } from '@energyweb/device-registry';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FilledInput,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@material-ui/core';
import { BigNumber } from 'ethers';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { requestPublishForSale, resyncCertificate } from '../../features/certificates';
import { ICertificateViewItem } from '../../features/certificates/types';
import { getCurrencies } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { countDecimals, EnergyFormatter, formatDate } from '../../utils';
import { getEnvironment } from '../../features';
import { IEnvironment } from '../../features/general';

interface IProps {
    certificate: ICertificateViewItem;
    producingDevice: ProducingDevice.Entity;
    showModal: boolean;
    callback: () => void;
}

export function PublishForSaleModal(props: IProps) {
    const { certificate, callback, producingDevice, showModal } = props;

    const currencies = useSelector(getCurrencies);
    const user = useSelector(getUserOffchain);
    const environment: IEnvironment = useSelector(getEnvironment);

    const DEFAULT_ENERGY_IN_BASE_UNIT = BigNumber.from(
        Number(environment?.DEFAULT_ENERGY_IN_BASE_UNIT || 1)
    );
    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );

    const energyInBaseUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
        energyInDisplayUnit
    );
    const [price, setPrice] = useState('1');
    const [currency, setCurrency] = useState(null);
    const [validation, setValidation] = useState({
        energyInDisplayUnit: true,
        price: true
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if (certificate) {
            setEnergyInDisplayUnit(
                EnergyFormatter.getValueInDisplayUnit(certificate.energy.publicVolume)
            );
        }
    }, [certificate, user]);

    useEffect(() => {
        if (currency === null && currencies && currencies[0]) {
            setCurrency(currencies[0]);
        }
    }, [currencies]);

    const isFormValid = validation.energyInDisplayUnit && validation.price;

    async function handleClose() {
        dispatch(resyncCertificate(certificate));
        callback();
    }

    async function publishForSale() {
        if (!isFormValid) {
            return;
        }

        dispatch(
            requestPublishForSale({
                certificateId: certificate.id,
                amount: energyInBaseUnit,
                price: Math.round((parseFloat(price) + Number.EPSILON) * 100),
                callback: () => {
                    handleClose();
                },
                source: certificate.source,
                assetId: certificate.assetId
            })
        );
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
            case 'priceInput':
                const newPrice = Number(event.target.value);
                const priceValid = !isNaN(newPrice) && newPrice > 0 && countDecimals(newPrice) <= 2;

                setPrice(event.target.value);
                setValidation({
                    ...validation,
                    price: priceValid
                });
                break;
        }
    }

    const certificateId = certificate ? certificate.id : '';
    const facilityName = producingDevice ? producingDevice.facilityName : '';

    let creationTime: string;

    try {
        creationTime = certificate && formatDate(moment.unix(certificate.creationTime), true);
    } catch (error) {
        console.error('Error in PublishForSaleModal', error);
    }

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Publish certificate #${certificateId} for sale`}</DialogTitle>
            <DialogContent>
                <TextField label="Facility" value={facilityName} fullWidth disabled />

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
                    value={energyInDisplayUnit}
                    type="number"
                    placeholder="1"
                    onChange={(e) => validateInputs(e)}
                    className="mt-4"
                    id="energyInDisplayUnitInput"
                    fullWidth
                />

                <TextField
                    label="Price"
                    value={price}
                    type="number"
                    placeholder="1"
                    onChange={(e) => validateInputs(e)}
                    className="mt-4"
                    id="priceInput"
                    fullWidth
                />

                <FormControl fullWidth={true} variant="filled" className="mt-4">
                    <InputLabel>Currency</InputLabel>
                    <Select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as string)}
                        fullWidth
                        variant="filled"
                        input={<FilledInput />}
                    >
                        {currencies?.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <div className="text-danger">
                    {!validation.price && <div>Price is invalid</div>}
                    {!validation.energyInDisplayUnit && (
                        <div>{EnergyFormatter.displayUnit} value is invalid</div>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={publishForSale} color="primary" disabled={!isFormValid}>
                    Publish for sale
                </Button>
            </DialogActions>
        </Dialog>
    );
}
