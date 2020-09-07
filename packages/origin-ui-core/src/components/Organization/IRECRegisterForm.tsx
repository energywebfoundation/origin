import React from 'react';
import { Paper, Theme, useTheme, Grid, Box, Button } from '@material-ui/core';
import { useTranslation } from '../..';
import { Formik, Form, FormikHelpers } from 'formik';
import { useValidation } from '../../utils';
import { FormInput, FormCountrySelect, FormCountryMultiSelect } from '../Form';
import { IAutocompleteMultiSelectOptionType } from '../MultiSelectAutocomplete';
import irecLogo from '../../../assets/logo-i-rec.svg';
import { FormSelect } from '../Form/FormSelect';

enum IRECActor {
    Participant = 0,
    Registrant = 1
}

interface IFormValues {
    accountType: string;
    headquatersCompany: string;
    yearOfRegistration: number | '';
    numberOfEmployees: string;
    shaholderNames: string[];
    orgWebsite: string;
    activeCountries: IAutocompleteMultiSelectOptionType[];
    mainBusiness: string;
    ceoName: string;
    ceoPassport: string;
    lastBalance: number | '';
    existingIRECOrg: string;
}

const INITIAL_VALUES: IFormValues = {
    accountType: '',
    headquatersCompany: '',
    yearOfRegistration: '',
    numberOfEmployees: '',
    shaholderNames: [],
    orgWebsite: '',
    activeCountries: [],
    mainBusiness: '',
    ceoName: '',
    ceoPassport: '',
    lastBalance: '',
    existingIRECOrg: ''
};

export const IRECRegisterForm = () => {
    const { spacing }: Theme = useTheme();
    const { t } = useTranslation();
    const { Yup } = useValidation();

    const accountTypeOptions = [
        {
            value: IRECActor.Participant,
            label: t('organization.registration.irecParticipantDescription')
        },
        {
            value: IRECActor.Registrant,
            label: t('organization.registration.irecRegistrantDescription')
        }
    ];

    const numberOfEmployeesOptions = [
        {
            value: '1-50',
            label: '1-50'
        },
        {
            value: '50-100',
            label: '50-100'
        },
        {
            value: '100-300',
            label: '100-300'
        },
        {
            value: '300+',
            label: '300+'
        }
    ];

    const onRegister = (
        values: typeof INITIAL_VALUES,
        { setSubmitting }: FormikHelpers<typeof INITIAL_VALUES>
    ) => {
        setSubmitting(true);
        /**
         * Send email notification to admin
         *
         * Show successfull application message window
         */
        setSubmitting(false);
    };

    const VALIDATION_SCHEME = Yup.object({
        accountType: Yup.string().required().label(t('organization.registration.IRECAccountType')),
        headquatersCompany: Yup.string()
            .required()
            .label(t('organization.registration.orgHeadquatersCompany')),
        yearOfRegistration: Yup.number()
            .min(1900)
            .required()
            .label(t('organization.registration.yearRegistration')),
        numberOfEmployees: Yup.string()
            .required()
            .label(t('organization.registration.numberOfEmployees')),
        shareholderNames: Yup.string()
            .required()
            .label(t('organization.registration.shareholderNames')),
        orgWebsite: Yup.string().required().label(t('organization.registration.orgWebsite')),
        activeCountries: Yup.array()
            .required()
            .label(t('organization.registration.activeCountries')),
        mainBusiness: Yup.string().required().label(t('organization.registration.mainBusiness')),
        ceoName: Yup.string().required().label(t('organization.registration.ceoName')),
        ceoPassport: Yup.string().required().label(t('organization.registration.ceoPassport')),
        lastBalance: Yup.number().required().label(t('organization.registration.lastBalance')),
        existingIRECOrg: Yup.string()
            .required()
            .label(t('organization.registration.existingIRECOrg'))
    });

    return (
        <Paper elevation={1} style={{ padding: spacing(2) }}>
            <Formik
                onSubmit={onRegister}
                initialValues={INITIAL_VALUES}
                validationSchema={VALIDATION_SCHEME}
            >
                {(formikProps) => {
                    const { values, isValid, isSubmitting, setFieldValue } = formikProps;
                    const buttonDisabled = isSubmitting || !isValid;
                    return (
                        <Form translate="">
                            <Grid container direction="column">
                                <Grid item container>
                                    <Grid item container direction="column" xs={6}>
                                        <Grid item>
                                            <Box
                                                fontWeight="fontWeightBold"
                                                style={{ textTransform: 'uppercase' }}
                                                pb={2}
                                            >
                                                {t('organization.registration.titleRegisterIREC')}
                                            </Box>
                                        </Grid>
                                        <Grid item style={{ paddingLeft: spacing(1) }}>
                                            <FormSelect
                                                options={accountTypeOptions}
                                                label={t(
                                                    'organization.registration.IRECAccountType'
                                                )}
                                                property="accountType"
                                                currentValue={values.accountType}
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />

                                            <FormCountrySelect
                                                label={t(
                                                    'organization.registration.orgHeadquatersCompany'
                                                )}
                                                property="headquatersCompany"
                                                currentValue={values.headquatersCompany}
                                                disabled={isSubmitting}
                                                className="mt-3"
                                                required
                                            />
                                            <Grid container>
                                                <Grid item xs={6}>
                                                    <FormInput
                                                        label={t(
                                                            'organization.registration.yearOfRegistration'
                                                        )}
                                                        property="yearOfRegistration"
                                                        disabled={isSubmitting}
                                                        className="mt-3"
                                                        required
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <FormSelect
                                                        options={numberOfEmployeesOptions}
                                                        label={t(
                                                            'organization.registration.numberOfEmployees'
                                                        )}
                                                        property="numberOfEmployees"
                                                        currentValue={values.numberOfEmployees}
                                                        disabled={isSubmitting}
                                                        className="mt-3"
                                                        required
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.shareholderNames'
                                                    )}
                                                    property="shareholderNames"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.orgWebsite'
                                                    )}
                                                    property="orgWebsite"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                            <Grid>
                                                <FormCountryMultiSelect
                                                    onChange={(value) =>
                                                        setFieldValue(
                                                            'activeCountries',
                                                            value,
                                                            true
                                                        )
                                                    }
                                                    label={t(
                                                        'organization.registration.activeCountries'
                                                    )}
                                                    placeholder="Select active countries"
                                                    selectedValues={values.activeCountries}
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    max={3}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.mainBusiness'
                                                    )}
                                                    property="mainBusiness"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t('organization.registration.ceoName')}
                                                    property="ceoName"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.ceoPassport'
                                                    )}
                                                    property="ceoPassport"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.lastBalance'
                                                    )}
                                                    property="lastBalance"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                            <Grid item>
                                                <FormInput
                                                    label={t(
                                                        'organization.registration.existingIRECOrg'
                                                    )}
                                                    property="existingIRECOrg"
                                                    disabled={isSubmitting}
                                                    className="mt-3"
                                                    required
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={6} style={{ position: 'relative' }}>
                                        <Box position="absolute" top="10%" left="50%">
                                            <Box position="relative" left="-50%">
                                                <img src={irecLogo} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid item container justify="flex-end">
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            disabled={buttonDisabled}
                                        >
                                            {t(
                                                'organization.registration.actions.registerOrganization'
                                            )}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
};
