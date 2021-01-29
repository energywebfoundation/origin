import React from 'react';
import { Button, Modal, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LightenColor } from '../../../utils';
import { useOriginConfiguration } from '../../../utils/configuration';
import { useTranslation } from 'react-i18next';
import SyncAltIcon from '@material-ui/icons/SyncAlt';

export function CertificateImportSuccessModal(props: {
    open: boolean;
    setOpen: (state: boolean) => void;
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

    const { open, setOpen } = props;
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
                                    Certificates were imported successfully and are available in
                                    your inbox.
                                </Typography>
                            </div>
                        </div>
                        <div>
                            <Button
                                style={{ float: 'right' }}
                                variant="contained"
                                onClick={() => setOpen(false)}
                                color="primary"
                            >
                                {t('certificate.actions.ok')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
