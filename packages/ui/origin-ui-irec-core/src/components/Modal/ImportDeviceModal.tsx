import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import { Button, Modal, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import { FormInput, FormSelect, LightenColor, Upload } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';

export function ImportDeviceModal(props: {
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
        modalButton: {
            margin: '0px 10px'
        },
        modalButtons: {
            margin: '0px -10px',
            display: 'flex',
            justifyContent: 'flex-end',
            textTransform: 'uppercase'
        },
        closeButton: {
            float: 'right',
            color: 'inherit'
        },
        header: {
            textTransform: 'uppercase',
            opacity: '0.75'
        },
        filesLabel: {
            opacity: '0.75'
        }
    });

    const { open, setOpen } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    const INITIAL_VALUES = {
        api_id: 1,
        project_story: 2
    };

    return (
        <>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className={classes.modalContent}>
                    <div className={classes.modalWindow} style={{ position: 'relative' }}>
                        <Formik initialValues={INITIAL_VALUES} onSubmit={() => null}>
                            {() => {
                                return (
                                    <Form translate="no">
                                        <Typography>
                                            <span className={classes.header}>
                                                {t('device.info.attachDeviceData')}
                                            </span>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOpen(false);
                                                }}
                                                className={classes.closeButton}
                                            >
                                                <Close fontSize="small" />
                                            </a>
                                        </Typography>
                                        <br />
                                        <FormInput
                                            property="api_id"
                                            label={'Smart meter readings API ID'}
                                        />
                                        <br />
                                        <FormSelect
                                            property="project_story"
                                            currentValue={0}
                                            label={'Project Story'}
                                            options={[{ value: 0, label: '0' }]}
                                        />
                                        <br />
                                        <br />
                                        <Typography className={classes.filesLabel}>
                                            {t('device.properties.projectImages')}
                                        </Typography>
                                        <Upload onChange={() => null} />
                                    </Form>
                                );
                            }}
                        </Formik>

                        <div className={classes.modalButtons}>
                            <Button
                                className={classes.modalButton}
                                variant="outlined"
                                onClick={() => setOpen(false)}
                                color="primary"
                            >
                                {t('device.actions.cancel')}
                            </Button>
                            <Button
                                className={classes.modalButton}
                                variant="contained"
                                onClick={() => setOpen(false)}
                                color="primary"
                            >
                                {t('device.actions.saveData')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
