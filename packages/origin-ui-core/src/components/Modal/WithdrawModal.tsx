import { ProducingDevice } from '@energyweb/device-registry';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@material-ui/core';
import { bigNumberify } from 'ethers/utils';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { resyncCertificate, requestWithdrawCertificate } from '../../features/certificates';
import { ICertificateViewItem } from '../../features/certificates/types';
import { getExchangeClient } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { EnergyFormatter, formatDate } from '../../utils';

interface IProps {
    certificate: ICertificateViewItem;
    producingDevice: ProducingDevice.Entity;
    showModal: boolean;
    callback: () => void;
}
const DEFAULT_ENERGY_IN_BASE_UNIT = bigNumberify(Number(process.env.DEFAULT_ENERGY_IN_BASE_UNIT));

export function WithdrawModal(props: IProps) {
    const { certificate, callback, producingDevice, showModal } = props;

    const user = useSelector(getUserOffchain);

    const [energyInDisplayUnit, setEnergyInDisplayUnit] = useState(
        EnergyFormatter.getValueInDisplayUnit(DEFAULT_ENERGY_IN_BASE_UNIT)
    );

    const dispatch = useDispatch();

    const exchangeClient = useSelector(getExchangeClient);

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

    async function withdraw() {
        const account = await exchangeClient.getAccount();
        const assetId = certificate.assetId;
        const address = user.blockchainAccountAddress;
        const amount = account.balances.available.find((balance) => balance.asset.id === assetId)
            .amount;
        dispatch(
            requestWithdrawCertificate({
                assetId,
                address,
                amount,
                callback
            })
        );
    }

    const certificateId = certificate ? certificate.id : '';
    const facilityName = producingDevice ? producingDevice.facilityName : '';

    let creationTime: string;

    try {
        creationTime = certificate && formatDate(moment.unix(certificate.creationTime), true);
    } catch (error) {
        console.error('Error: Can not get creation time', error);
    }

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Withdraw #${certificateId}`}</DialogTitle>
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
                    className="mt-4"
                    id="energyInDisplayUnitInput"
                    fullWidth
                    disabled
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={withdraw} color="primary">
                    Withdraw
                </Button>
            </DialogActions>
        </Dialog>
    );
}
