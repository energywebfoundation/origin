import React, { useState, useEffect } from 'react';
import moment from 'moment';

import { ProducingDevice } from '@energyweb/device-registry';
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
import { showNotification, NotificationType } from '../../utils/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrencies, getExchangeClient } from '../../features/general/selectors';
import { setLoading } from '../../features/general/actions';
import BN from 'bn.js';
import { TransactionReceipt } from 'web3-core';
import { CommitmentStatus } from '@energyweb/origin-backend-core';
import { formatDate, EnergyFormatter, countDecimals } from '../../utils';
import { ITransfer } from '../../utils/exchange';
import { Certificate } from '@energyweb/issuer';
import { getUserOffchain, getActiveBlockchainAccountAddress } from '../../features/users/selectors';

interface IProps {
    certificate: Certificate.Entity;
    producingDevice: ProducingDevice.Entity;
    showModal: boolean;
    callback: () => void;
}

const DEFAULT_ENERGY_IN_BASE_UNIT = 1;

function assertIsTransactionReceipt(
    data: TransactionReceipt | CommitmentStatus
): asserts data is TransactionReceipt {
    if (typeof data === 'number' || !data.transactionHash) {
        throw new Error(`Data.transactionHash is not present`);
    }
}

export function PublishForSaleModal(props: IProps) {
    const { certificate, callback, producingDevice, showModal } = props;

    const currencies = useSelector(getCurrencies);
    const exchangeClient = useSelector(getExchangeClient);
    const user = useSelector(getUserOffchain);
    const activeAddress = useSelector(getActiveBlockchainAccountAddress);

    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );

    const energyInBaseUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
        energyInDisplayUnit
    );
    const [price, setPrice] = useState(1);
    const [currency, setCurrency] = useState(null);
    const [validation, setValidation] = useState({
        energyInDisplayUnit: true,
        price: true
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if (certificate) {
            setEnergyInDisplayUnit(
                EnergyFormatter.getValueInDisplayUnit(
                    certificate.ownedVolume(user.blockchainAccountAddress).publicVolume
                )
            );
        }
    }, [certificate, user]);

    useEffect(() => {
        if (currency === null && currencies && currencies[0]) {
            setCurrency(currencies[0]);
        }
    }, [currencies]);

    const isFormValid = validation.energyInDisplayUnit && validation.price;

    function handleClose() {
        callback();
    }

    async function publishForSale() {
        if (!isFormValid) {
            return;
        }

        if (
            !activeAddress ||
            user?.blockchainAccountAddress?.toLowerCase() !== activeAddress?.toLowerCase()
        ) {
            showNotification(
                `You need to select a blockchain account bound to the logged in user.`,
                NotificationType.Error
            );
            return;
        }

        dispatch(setLoading(true));
        const amountAsBN = new BN(energyInBaseUnit);
        const account = await exchangeClient.getAccount();

        const transferResult = await certificate.transfer(account.address, amountAsBN.toNumber());

        assertIsTransactionReceipt(transferResult);

        let transfer: ITransfer;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const transfers = await exchangeClient.getAllTransfers();

            transfer = transfers.find(
                (item) => item.transactionHash === transferResult.transactionHash
            );

            if (transfer) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));

        await exchangeClient.createAsk({
            assetId: transfer.asset.id,
            price: Math.round((price + Number.EPSILON) * 100),
            volume: amountAsBN.toString(),
            validFrom: moment().toISOString()
        });
        showNotification(`Certificate has been published for sale.`, NotificationType.Success);
        dispatch(setLoading(false));
        handleClose();
    }

    async function validateInputs(event) {
        switch (event.target.id) {
            case 'energyInDisplayUnitInput':
                const newEnergyInDisplayUnit = Number(event.target.value);
                const newEnergyInBaseValueUnit = EnergyFormatter.getBaseValueFromValueInDisplayUnit(
                    newEnergyInDisplayUnit
                );

                const ownedPublicVolume = certificate.ownedVolume(user.blockchainAccountAddress)
                    .publicVolume;

                const energyInDisplayUnitValid =
                    !isNaN(energyInDisplayUnit) &&
                    newEnergyInBaseValueUnit >= 1 &&
                    newEnergyInBaseValueUnit <= ownedPublicVolume &&
                    countDecimals(newEnergyInDisplayUnit) <= 6;

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
