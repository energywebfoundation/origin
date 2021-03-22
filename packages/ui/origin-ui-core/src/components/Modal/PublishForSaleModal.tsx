import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import moment from 'moment';
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
import {
    requestPublishForSale,
    resyncCertificate,
    ICertificateViewItem
} from '../../features/certificates';
import { getCurrencies, IEnvironment, getEnvironment } from '../../features/general';
import { getUserOffchain } from '../../features/users';
import { formatDate } from '../../utils/time';
import { countDecimals } from '../../utils/helper';
import { EnergyFormatter } from '../../utils/EnergyFormatter';
import { IOriginDevice } from '../../types';

interface IProps {
    certificate: ICertificateViewItem;
    device: IOriginDevice;
    showModal: boolean;
    callback: () => void;
}

export function PublishForSaleModal(props: IProps) {
    const { certificate, callback, device, showModal } = props;

    const { t } = useTranslation();

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
                    newEnergyInBaseValueUnit.lte(ownedPublicVolume) &&
                    countDecimals(newEnergyInDisplayUnit) === 0;

                setEnergyInDisplayUnit(event.target.value);

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
    const facilityName = device ? device.facilityName : '';

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
                    onBlur={(e) => {
                        const parsedValue = parseFloat((e.target as any)?.value);

                        if (!isNaN(parsedValue) && parsedValue > 0) {
                            setPrice(parsedValue.toFixed(2));
                        }
                    }}
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
                    {t('general.actions.cancel')}
                </Button>
                <Button onClick={publishForSale} color="primary" disabled={!isFormValid}>
                    {t('certificate.actions.publishForSale')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
