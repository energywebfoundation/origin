import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import {
    Button,
    Checkbox,
    Grid,
    Typography,
    FormControlLabel,
    makeStyles
} from '@material-ui/core';
import { FormSelect } from '@energyweb/origin-ui-core';
import { useOriginConfiguration } from '../../utils/configuration';
import {
    CertificateImportConfirmModal,
    CertificateImportSuccessModal
} from '../../components/Modal';
import {
    CertificateImportSelectedItem,
    CertificateImportItem
} from '../../components/certificates/import';

// for mock purposes
export interface ICertificate {
    id: number;
    name: string;
    date: string;
}

// for mock purposes
export interface IDevice {
    id: number;
    name: string;
    country: string;
    capacity: number;
    imported?: boolean;
    certificates?: ICertificate[];
}

const devices: IDevice[] = [
    {
        id: 1,
        name: 'test1',
        country: 'poland',
        capacity: 300,
        certificates: [
            {
                name: 'test-0001',
                date: '01-01-2021',
                id: 1
            },
            {
                name: 'test-0002',
                date: '01-01-2021',
                id: 2
            }
        ]
    },
    {
        id: 2,
        name: 'test2',
        country: 'germany',
        capacity: 250,
        certificates: [
            {
                name: 'test-0001',
                date: '01-01-2021',
                id: 1
            }
        ]
    }
];

export function CertificateImport(): JSX.Element {
    const configuration = useOriginConfiguration();
    const { t } = useTranslation();

    // for mock
    const selected: Record<number, number[]> = {
        1: [2],
        2: [1]
    };

    const mainBgColor = configuration?.styleConfig?.MAIN_BACKGROUND_COLOR;
    const defaultTextColor = configuration?.styleConfig?.TEXT_COLOR_DEFAULT;

    const useStyles = makeStyles({
        box: {
            background: mainBgColor,
            borderRadius: '2px',
            padding: '21px 24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 4px rgba(0,0,0,.2)'
        },
        header: {
            marginBottom: '29px',
            textTransform: 'uppercase'
        },
        pagination: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        selectAll: {
            padding: '11px 0 2px 29px'
        },
        selectedItemsEmpty: {
            padding: '64px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: defaultTextColor
        }
    });

    const classes = useStyles();

    const INITIAL_VALUES = {};

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    return (
        <div>
            <CertificateImportConfirmModal
                open={confirmOpen}
                setOpen={setConfirmOpen}
                onConfirm={() => setSuccessOpen(true)}
            />
            <CertificateImportSuccessModal open={successOpen} setOpen={setSuccessOpen} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('certificate.info.certificatesToImport')}
                        </Typography>
                        <Formik initialValues={INITIAL_VALUES} onSubmit={() => null}>
                            {() => {
                                return (
                                    <Form translate="no">
                                        <FormSelect
                                            property="account"
                                            currentValue={null}
                                            label={t('certificate.actions.selectAccount')}
                                            options={[
                                                { value: 1, label: 'a' },
                                                { value: 2, label: 'b' },
                                                { value: 3, label: 'c' }
                                            ]}
                                        />

                                        <div className={classes.selectAll}>
                                            <FormControlLabel
                                                control={<Checkbox color={'primary'} />}
                                                label={t('certificate.actions.selectAll')}
                                            />
                                        </div>

                                        {devices.map((device) => (
                                            <CertificateImportItem
                                                device={device}
                                                key={device.id}
                                                selected={selected[device.id]}
                                            />
                                        ))}
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                </Grid>
                <Grid item xs={12} md={5}>
                    <div className={classes.box}>
                        <Typography className={classes.header}>
                            {t('certificate.info.selectedForImport')}
                        </Typography>

                        <CertificateImportSelectedItem cert={devices[0].certificates[0]} />
                        <CertificateImportSelectedItem cert={devices[1].certificates[0]} />

                        <div className={classes.selectedItemsEmpty}>
                            {t('certificate.info.selectCertificate')}
                        </div>

                        <Button
                            color="primary"
                            variant="contained"
                            size="small"
                            style={{ marginTop: '14px' }}
                            onClick={() => setConfirmOpen(true)}
                        >
                            {t('certificate.actions.importNCertificates', { count: 2 })}
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}
