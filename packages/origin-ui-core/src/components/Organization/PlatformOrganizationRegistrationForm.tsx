/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { getOffChainDataSource, showNotification, NotificationType, useTranslation } from '../..';
import React, { useState } from 'react';
import {
    makeStyles,
    createStyles,
    useTheme,
    Paper,
    Grid,
    Button,
    Box,
    Divider,
    Theme,
    Typography
} from '@material-ui/core';
import { FormikHelpers, Formik, Form } from 'formik';
import { setLoading } from '../../features/general';
import { FormInput, FormCountrySelect, FormBusinessTypeSelect } from '../Form';
import { Upload, IUploadedFile } from '../Upload';

interface IFormValues {
    organizationName: string;
    organizationAddress: string;
    organizationZip: string;
    organizationCountry: string;
    organizationCity: string;
    businessTypeSelect: string;
    businessTypeInput: string;
    tradeRegistryNumber: string;
    vatNumber: string;
    uploadCompanyProof: boolean;
    signatoryName: string;
    signatoryAddress: string;
    signatoryZip: string;
    signatoryCountry: string;
    signatoryCity: string;
    signatoryEmail: string;
    signatoryTelephone: string;
    uploadSignatoryId: boolean;
}

const INITIAL_FORM_VALUES: IFormValues = {
    organizationName: '',
    organizationAddress: '',
    organizationZip: '',
    organizationCountry: '',
    organizationCity: '',
    businessTypeSelect: '',
    businessTypeInput: '',
    tradeRegistryNumber: '',
    vatNumber: '',
    uploadCompanyProof: false,
    signatoryName: '',
    signatoryAddress: '',
    signatoryZip: '',
    signatoryCountry: '',
    signatoryCity: '',
    signatoryEmail: '',
    signatoryTelephone: '',
    uploadSignatoryId: false
};

const VALIDATION_SCHEMA = Yup.object({
    organizationName: Yup.string().required().label('Organization name'),
    organizationAddress: Yup.string().required().label('Organization address'),
    organizationZip: Yup.string().required().label('Zip Code'),
    organizationCity: Yup.string().required().label('City'),
    organizationCountry: Yup.string().required().label('Country'),
    businessTypeSelect: Yup.string().required().label('Business type'),
    businessTypeInput: Yup.string().label('Business type').when('businessTypeSelect', {
        is: 'Other',
        then: Yup.string().required()
    }),
    tradeRegistryNumber: Yup.string().label('Trade registry number'),
    vatNumber: Yup.string().required().label('Organization VAT number'),
    signatoryName: Yup.string().required().label('Signatory full name'),
    signatoryAddress: Yup.string().required().label('Signatory address'),
    signatoryEmail: Yup.string().email().required().label('Signatory email'),
    signatoryTelephone: Yup.string().required().label('Signatory telephone'),
    signatoryZip: Yup.string().required().label('Zip Code'),
    signatoryCity: Yup.string().required().label('City'),
    signatoryCountry: Yup.string().required().label('Country')
});

export function PlatformOrganizationRegistrationForm() {
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const [companyProofs, setCompanyProofs] = useState<IUploadedFile[]>([]);
    const [signatoryId, setSignatoryId] = useState<IUploadedFile[]>([]);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());
    const { spacing }: Theme = useTheme();
    async function submitForm(
        orgProps: IFormValues,
        formikActions: FormikHelpers<IFormValues>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            /**
             * const organization = await organizationClient.registerPlatformOrganization({...orgProps, companyProofs, signatoryId});
             */
            showNotification('Organization registered.', NotificationType.Success);
        } catch (error) {
            console.warn('Error while registering an organization', error);

            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationType.Error);
            } else {
                showNotification('Organization could not be created.', NotificationType.Error);
            }
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    return (
        <Paper
            classes={{ root: classes.container }}
            className="PlatformOrganizationRegistrationForm"
        >
            <Formik
                initialValues={INITIAL_FORM_VALUES}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, values, errors } = formikProps;
                    const otherErrors = (errors as any)?.atLeastOneProp;
                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid;

                    return (
                        <div>
                            <Box style={{ textTransform: 'uppercase', marginBottom: spacing(1) }}>
                                {t('organization.registration.registerOrganization')}
                            </Box>
                            <Divider className="divider" />
                            <Form translate="" style={{ marginTop: spacing(1) }}>
                                <Grid container direction="column">
                                    <Grid container style={{ paddingBottom: spacing(2) }}>
                                        <Grid item xs={6}>
                                            <Box>
                                                {t(
                                                    'organization.registration.organizationInformation'
                                                )}
                                            </Box>
                                            <Box style={{ paddingLeft: spacing(1) }}>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.organizationName'
                                                    )}
                                                    property="organizationName"
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormInput
                                                    label={t(
                                                        'organization.registration.organizationAddress'
                                                    )}
                                                    property="organizationAddress"
                                                    className="mt-3"
                                                    required
                                                />

                                                <Grid container>
                                                    <Grid
                                                        item
                                                        xs={6}
                                                        style={{ paddingRight: spacing(1) }}
                                                    >
                                                        <FormInput
                                                            label={t(
                                                                'organization.registration.zipCode'
                                                            )}
                                                            property="organizationZip"
                                                            className="mt-3"
                                                            required
                                                        />
                                                    </Grid>

                                                    <Grid
                                                        item
                                                        xs={6}
                                                        style={{ paddingLeft: spacing(1) }}
                                                    >
                                                        <FormInput
                                                            label={t(
                                                                'organization.registration.city'
                                                            )}
                                                            property="organizationCity"
                                                            className="mt-3"
                                                            required
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <FormCountrySelect
                                                    label={t('organization.registration.country')}
                                                    property="organizationCountry"
                                                    currentValue={values.organizationCountry}
                                                    disabled={fieldDisabled}
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormBusinessTypeSelect
                                                    label={t(
                                                        'organization.registration.businessType'
                                                    )}
                                                    selectProperty="businessTypeSelect"
                                                    selectCurrentValue={values.businessTypeSelect}
                                                    inputProperty="businessTypeInput"
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormInput
                                                    label={t(
                                                        'organization.registration.tradeRegistryNumber'
                                                    )}
                                                    property="tradeRegistryNumber"
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormInput
                                                    label={t('organization.registration.vatNumber')}
                                                    property="vatNumber"
                                                    className="mt-3"
                                                    required
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} style={{ paddingLeft: spacing(2) }}>
                                            <Typography className="mt-3">
                                                {t('organization.registration.uploadCompanyProof')}
                                            </Typography>
                                            <Upload
                                                onChange={(newFiles) => setCompanyProofs(newFiles)}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Divider className="divider" />
                                    <Grid container style={{ paddingTop: spacing(1) }}>
                                        <Grid item xs={6}>
                                            <Box>
                                                {t(
                                                    'organization.registration.signatoryInformation'
                                                )}
                                            </Box>
                                            <Box style={{ paddingLeft: spacing(1) }}>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.signatoryName'
                                                    )}
                                                    property="signatoryName"
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormInput
                                                    label={t(
                                                        'organization.registration.signatoryAddress'
                                                    )}
                                                    property="signatoryAddress"
                                                    className="mt-3"
                                                    required
                                                />

                                                <Grid container>
                                                    <Grid
                                                        item
                                                        xs={6}
                                                        style={{ paddingRight: spacing(1) }}
                                                    >
                                                        <FormInput
                                                            label={t(
                                                                'organization.registration.zipCode'
                                                            )}
                                                            property="signatoryZip"
                                                            className="mt-3"
                                                            required
                                                        />
                                                    </Grid>

                                                    <Grid
                                                        item
                                                        xs={6}
                                                        style={{ paddingLeft: spacing(1) }}
                                                    >
                                                        <FormInput
                                                            label={t(
                                                                'organization.registration.city'
                                                            )}
                                                            property="signatoryCity"
                                                            className="mt-3"
                                                            required
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <FormCountrySelect
                                                    label={t('organization.registration.country')}
                                                    property="signatoryCountry"
                                                    currentValue={values.signatoryCountry}
                                                    disabled={fieldDisabled}
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormInput
                                                    label={t(
                                                        'organization.registration.signatoryEmail'
                                                    )}
                                                    property="signatoryEmail"
                                                    className="mt-3"
                                                    required
                                                />

                                                <FormInput
                                                    label={t(
                                                        'organization.registration.signatoryTelephone'
                                                    )}
                                                    property="signatoryTelephone"
                                                    className="mt-3"
                                                    required
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} style={{ paddingLeft: spacing(2) }}>
                                            <Typography className="mt-3">
                                                {t('organization.registration.uploadSignatoryId')}
                                            </Typography>
                                            <Upload
                                                onChange={(newFiles) => setSignatoryId(newFiles)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={buttonDisabled}
                                >
                                    {t('organization.registration.registerOrganization')}
                                </Button>
                                {otherErrors && <div className="mt-3">{otherErrors}</div>}
                            </Form>
                        </div>
                    );
                }}
            </Formik>
        </Paper>
    );
}
