import React from 'react';
import { Button, Modal, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LightenColor } from '../../../utils';
import { useOriginConfiguration } from '../../../utils/configuration';
import { useTranslation } from 'react-i18next';
import SyncAltIcon from '@material-ui/icons/SyncAlt';

export function CertificateImportConfirmModal(props: {
    open: boolean;
    setOpen: (state: boolean) => void;
    onConfirm: () => void;
}): JSX.Element {
    const configuration = useOriginConfiguration();

    const useStyles = makeStyles({
        modalContent: {
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            pointerEvents: 'none'
        },
        modalWindow: {
            background: LightenColor(configuration?.styleConfig?.MAIN_BACKGROUND_COLOR, 2),
            boxShadow: '0 2px 4px rgba(255,255,255,.13)',
            width: '100%',
            maxWidth: '550px',
            borderRadius: 4,
            padding: '24px 21px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'all'
        },
        modalButton: {
            margin: '0px 10px'
        },
        modalButtons: {
            margin: '50px -10px 0 -10px',
            display: 'flex',
            justifyContent: 'flex-end',
            textTransform: 'uppercase'
        },
        row: {
            display: 'flex',
            flexDirection: 'row'
        },
        icon: {
            fontSize: '90px',
            opacity: '.5',
            marginRight: '32px',
            color: configuration?.styleConfig?.SIMPLE_TEXT_COLOR
        }
    });

    const { open, setOpen, onConfirm } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className={classes.modalContent}>
                    <div className={classes.modalWindow} style={{ position: 'relative' }}>
                        <div className={classes.row}>
                            <SyncAltIcon className={classes.icon} />
                            <div className="text">
                                <Typography variant={'h6'}>
                                    Transferring certificates in the I-REC registry.
                                </Typography>

                                <br />

                                <Typography variant={'body2'}>
                                    Certificates are transferred in the I-REC registry from your
                                    participant account to the marketplace account in order to trade
                                    them on the marketplace.
                                </Typography>

                                <br />

                                <Typography variant={'body2'}>
                                    You will always be able to export them back to your participant
                                    account.
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.modalButtons}>
                            <Button
                                className={classes.modalButton}
                                variant="outlined"
                                onClick={() => setOpen(false)}
                                color="primary"
                            >
                                {t('certificate.actions.cancel')}
                            </Button>
                            <Button
                                className={classes.modalButton}
                                variant="contained"
                                onClick={() => {
                                    setOpen(false);
                                    onConfirm();
                                }}
                                color="primary"
                            >
                                {t('certificate.actions.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
