import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    MenuItem
} from '@material-ui/core';
import { getEnvironment } from '../../features/general';
import { createSupply, updateSupply } from '../../features/supply';
import { IDeviceWithSupply } from '../../types';
import { SupplyStatus } from '../../containers/SupplyTable';

interface IProps {
    showModal: boolean;
    setShowModal: (value: React.SetStateAction<boolean>) => void;
    entity: IDeviceWithSupply;
    setEntity: (value: React.SetStateAction<IDeviceWithSupply>) => void;
}

export function UpdateSupplyModal(props: IProps) {
    const { showModal, setShowModal, entity, setEntity } = props;
    const { t } = useTranslation();
    const environment = useSelector(getEnvironment);
    const issuerId = environment?.ISSUER_ID;
    const dispatch = useDispatch();

    function requestAutoSupply() {
        const { active = false, price = 0, supplyId } = entity;

        if (!entity.supplyCreated) {
            const deviceId = entity.externalDeviceIds.find((id) => id.type === issuerId).id;
            dispatch(createSupply({ deviceId, active, price }));
        } else {
            dispatch(updateSupply({ supplyId, supplyData: { active, price } }));
        }

        setShowModal(false);
    }

    return (
        <Dialog open={showModal}>
            <DialogTitle>{t('exchange.supply.updateSupply')}</DialogTitle>
            <DialogContent>
                <TextField
                    label={t('exchange.supply.type')}
                    value={entity.deviceType}
                    className="mt-4"
                    disabled={true}
                    fullWidth
                />

                <TextField
                    label={t('exchange.supply.facility')}
                    value={entity.facilityName}
                    className="mt-4"
                    disabled={true}
                    fullWidth
                />

                <TextField
                    label={t('exchange.supply.price')}
                    value={entity.price || 0}
                    className="mt-4"
                    type="number"
                    onChange={(e) =>
                        setEntity({
                            ...entity,
                            price: Number(e.target.value)
                        })
                    }
                    fullWidth
                />

                <TextField
                    label={t('exchange.supply.status')}
                    value={entity.active ? SupplyStatus.Active : SupplyStatus.Paused}
                    className="mt-4"
                    fullWidth
                    onChange={(e) =>
                        setEntity({
                            ...entity,
                            active: e.target.value === SupplyStatus.Active
                        })
                    }
                    select
                >
                    <MenuItem value={SupplyStatus.Active}>{t('exchange.supply.active')}</MenuItem>
                    <MenuItem value={SupplyStatus.Paused}>{t('exchange.supply.paused')}</MenuItem>
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowModal(false)} color="secondary">
                    {t('exchange.supply.cancel')}
                </Button>
                <Button onClick={requestAutoSupply} disabled={entity.price < 1} color="primary">
                    {t('exchange.supply.update')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
