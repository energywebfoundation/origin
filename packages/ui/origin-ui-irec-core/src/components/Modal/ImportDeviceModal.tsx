import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { Button, Modal, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import {
    FormInput,
    IUploadedFile,
    LightenColor,
    NotificationTypeEnum,
    showNotification,
    Upload
} from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils';
import { ComposedDevice } from '../../types';
import { useSelector } from 'react-redux';
import { getDeviceClient } from '../../features';

const INITIAL_VALUES = {
    timezone: '',
    gridOperator: '',
    smartMeterId: '',
    description: ''
};

export function ImportDeviceModal(props: {
    device: ComposedDevice;
    open: boolean;
    setOpen: (state: boolean) => void;
}): JSX.Element {
    const configuration = useOriginConfiguration();
    const iRecClient = useSelector(getDeviceClient)?.iRecClient;
    const originClient = useSelector(getDeviceClient)?.originClient;
    const [files, setFiles] = useState<IUploadedFile[]>([]);
    const uploadedFiles = files.filter((f) => !f.removed && f.uploadedName);

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

    const { open, setOpen, device } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    const initialFormikValues: typeof INITIAL_VALUES = {
        description: device?.description ?? '',
        smartMeterId: device?.smartMeterId ?? '',
        gridOperator: device?.gridOperator ?? '',
        timezone: device?.timezone ?? ''
    };

    async function submitForm(
        values: typeof INITIAL_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);

        try {
            let localIrecDevice;
            if (!device.id) {
                const irecResponse = await iRecClient.importIrecDevice({
                    code: device.code,
                    timezone: values.timezone,
                    gridOperator: values.gridOperator
                });

                localIrecDevice = irecResponse.data;
            }

            if (!device.externalRegistryId) {
                await originClient.createDevice({
                    externalRegistryId: device.id || localIrecDevice.id,
                    smartMeterId: values.smartMeterId,
                    description: values.description,
                    externalDeviceIds: [],
                    imageIds: uploadedFiles.map((f) => f.uploadedName)
                });
            }

            showNotification(t('user.profile.updateProfile'), NotificationTypeEnum.Success);
            formikActions.setTouched({}, false);
        } catch (error) {
            showNotification(t('general.feedback.unknownError'), NotificationTypeEnum.Error);
        }

        formikActions.setSubmitting(false);
    }

    return (
        <>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className={classes.modalContent}>
                    <div className={classes.modalWindow} style={{ position: 'relative' }}>
                        <Formik initialValues={initialFormikValues} onSubmit={submitForm}>
                            {(formikProps) => {
                                return (
                                    <>
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
                                                property="smartMeterId"
                                                label={'Smart meter readings API ID'}
                                            />
                                            <br />

                                            <FormInput
                                                property="description"
                                                label={'Description'}
                                            />
                                            <br />

                                            {!device?.timezone && (
                                                <>
                                                    <FormInput
                                                        property="timezone"
                                                        label={'Timezone'}
                                                    />
                                                    <br />
                                                </>
                                            )}

                                            {!device?.gridOperator && (
                                                <>
                                                    <FormInput
                                                        property="gridOperator"
                                                        label={'Grid operator'}
                                                    />
                                                    <br />
                                                </>
                                            )}

                                            <Typography className={classes.filesLabel}>
                                                {t('device.properties.projectImages')}
                                            </Typography>
                                            <Upload onChange={(newFiles) => setFiles(newFiles)} />
                                        </Form>

                                        <div className={classes.modalButtons}>
                                            <Button
                                                className={classes.modalButton}
                                                variant="outlined"
                                                onClick={() => setOpen(false)}
                                                color="primary"
                                            >
                                                {t('device.actions.cancel')}
                                            </Button>
                                            {!device?.externalRegistryId && (
                                                <Button
                                                    className={classes.modalButton}
                                                    variant="contained"
                                                    onClick={async () => {
                                                        await formikProps.validateForm();
                                                        await formikProps.submitForm();
                                                        setOpen(false);
                                                    }}
                                                    color="primary"
                                                >
                                                    {t('device.actions.saveData')}
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                );
                            }}
                        </Formik>
                    </div>
                </div>
            </Modal>
        </>
    );
}
