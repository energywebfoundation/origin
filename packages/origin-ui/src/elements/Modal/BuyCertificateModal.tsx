import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Certificate } from '@energyweb/origin';
import { ProducingAsset } from '@energyweb/asset-registry';
import { Erc20TestToken } from '@energyweb/erc-test-contracts';
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

interface IProps {
    producingAsset: ProducingAsset.Entity;
    certificate: Certificate.Entity;
    showModal: boolean;
    callback: () => void;
}

export function BuyCertificateModal(props: IProps) {
    const { callback, certificate, producingAsset, showModal } = props;

    const configuration = useSelector(getConfiguration);
    const dispatch = useDispatch();

    const [kwh, setKwh] = useState(0.001);
    const [validation, setValidation] = useState({
        kwh: false
    });

    useEffect(() => {
        if (!certificate) {
            return;
        }

        setKwh(certificate.energy / 1000);
        setValidation({
            kwh: true
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

        if (
            ((certificate.acceptedToken as any) as string) !==
            '0x0000000000000000000000000000000000000000'
        ) {
            const erc20TestToken = new Erc20TestToken(
                configuration.blockchainProperties.web3,
                (certificate.acceptedToken as any) as string
            );

            await erc20TestToken.approve(certificate.owner, certificate.onChainDirectPurchasePrice);
        }

        await certificate.buyCertificate(kwh * 1000);

        dispatch(setLoading(false));

        showNotification(`Certificates for ${kwh} kWh have been bought.`, NotificationType.Success);

        handleClose();
    }

    function validateInputs(event) {
        const countDecimals = value => (value % 1 ? value.toString().split('.')[1].length : 0);

        switch (event.target.id) {
            case 'kwhInput':
                const newKwh = Number(event.target.value);
                const kwhValid =
                    !isNaN(newKwh) &&
                    newKwh >= 0.001 &&
                    newKwh <= certificate.energy / 1000 &&
                    countDecimals(newKwh) <= 3;

                setKwh(event.target.value);

                setValidation({
                    kwh: kwhValid
                });
                break;
        }
    }

    const isFormValid = Object.keys(validation).every(property => validation[property] === true);

    const certificateId = certificate?.id || '';
    const date = certificate ? moment.unix(certificate.creationTime).format('YYYY-MM-DD') : '';
    const facilityName = producingAsset?.offChainProperties?.facilityName || '';

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>Buy certificate #{certificateId}</DialogTitle>
            <DialogContent>
                <TextField label="Facility" value={facilityName} fullWidth disabled />

                <TextField label="Date" value={date} fullWidth disabled className="mt-4" />

                <TextField
                    label="kWh"
                    value={kwh}
                    type="number"
                    placeholder="1"
                    onChange={e => validateInputs(e)}
                    className="mt-4"
                    id="kwhInput"
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
