import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { Button, IconButton, TextField, makeStyles } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { Unit } from '@energyweb/utils-general';
import { useOriginConfiguration } from '../../../utils/configuration';
import { LightenColor } from '../../../utils/colors';
import { EnergyFormatter } from '../../../utils/EnergyFormatter';
import { DeviceIcon } from '../../Icons';
import { IInboxCertificateData, IInboxItemData } from './InboxItem';

export function InboxSelectedItem(props: {
    cert: IInboxCertificateData;
    device: IInboxItemData;
    setEnergy: (value: BigNumber) => void;
}): JSX.Element {
    const { cert, device, setEnergy } = props;
    const configuration = useOriginConfiguration();

    const { MAIN_BACKGROUND_COLOR, SIMPLE_TEXT_COLOR, PRIMARY_COLOR } = configuration?.styleConfig;

    const useStyles = makeStyles({
        item: {
            padding: '16px',
            marginBottom: '10px',
            background: LightenColor(MAIN_BACKGROUND_COLOR, 1)
        },

        top: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },

        icon: {
            width: 32,
            height: 32,
            color: LightenColor(PRIMARY_COLOR, 3),
            marginRight: '25px'
        },

        text_1: {
            fontSize: '16px',
            color: SIMPLE_TEXT_COLOR
        },

        text_2: {
            fontSize: '14px',
            color: SIMPLE_TEXT_COLOR
        },

        text_3: {
            fontSize: '12px',
            color: SIMPLE_TEXT_COLOR,
            opacity: '.5'
        },

        editButton: {
            marginLeft: '11px'
        },

        form: {
            marginTop: '18px',
            display: 'flex'
        }
    });

    const classes = useStyles();

    const [editMode, setEditMode] = useState(false);
    const [MWhValue, setMWh] = useState<number>(cert.energy.toNumber() / Unit.MWh);
    const { t } = useTranslation();

    function saveForm() {
        setEnergy(BigNumber.from(MWhValue).mul(Unit.MWh));
        setEditMode(false);
    }

    return (
        <div className={classes.item}>
            <div className={classes.top}>
                <DeviceIcon type={device.type} className={classes.icon} />
                <div style={{ flex: '1' }}>
                    <div className={classes.text_3}>{cert.id}</div>
                    <div className={classes.text_1}>{device.name}</div>
                </div>

                {!editMode && (
                    <div className={classes.text_2}>
                        {EnergyFormatter.format(cert.energy, true)}
                    </div>
                )}

                {!editMode && (
                    <IconButton
                        className={classes.editButton}
                        size={'small'}
                        onClick={(event) => {
                            event.preventDefault();
                            setEditMode(true);
                        }}
                    >
                        <EditIcon color={'primary'} />
                    </IconButton>
                )}

                {editMode && (
                    <Button
                        className={classes.editButton}
                        size={'small'}
                        onClick={(event) => {
                            event.preventDefault();
                            setMWh(cert.energy.toNumber() / Unit.MWh);
                            setEditMode(false);
                        }}
                    >
                        <span>{t('certificate.actions.cancel')}</span>
                    </Button>
                )}
            </div>
            {editMode && (
                <div className={classes.form}>
                    <TextField
                        type={'number'}
                        style={{ flex: '1', marginRight: '10px', background: '#292929' }}
                        value={MWhValue}
                        onChange={(event) => {
                            const max = cert.maxEnergy.toNumber() / Unit.MWh;
                            let value = parseInt(event.target.value, 10);
                            value = Math.min(max, Math.max(value, 1));
                            setMWh(value);
                        }}
                    />
                    <Button color="primary" variant="contained" size="small" onClick={saveForm}>
                        {t('certificate.actions.save')}
                    </Button>
                </div>
            )}
        </div>
    );
}
