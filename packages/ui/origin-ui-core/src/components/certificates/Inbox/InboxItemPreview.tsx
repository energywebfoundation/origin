import { Button, Modal } from '@material-ui/core';
import React from 'react';
import { useOriginConfiguration } from '../../../utils/configuration';
import { makeStyles } from '@material-ui/core/styles';
import { EnergyFormatter, formatDate, LightenColor, moment } from '../../../utils';
import { ICertificateViewItem } from '../../../features/certificates';
import { useTranslation } from 'react-i18next';

export function InboxItemPreview(props: {
    open: boolean;
    setOpen: (state: boolean) => void;
    data: ICertificateViewItem;
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
        }
    });
    const classes = useStyles();
    const { t } = useTranslation();

    const { open, setOpen, data } = props;

    return (
        <>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className={classes.modalContent}>
                    {data && (
                        <div className={classes.modalWindow} style={{ position: 'relative' }}>
                            <p>{data.deviceId}</p>
                            <p>${EnergyFormatter.format(data.energy.publicVolume, true)}</p>
                            <p>
                                {formatDate(moment.unix(data.generationStartTime))}
                                {' - '}
                                {formatDate(moment.unix(data.generationEndTime))}
                            </p>

                            <Button>{t('certificate.actions.close')}</Button>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
