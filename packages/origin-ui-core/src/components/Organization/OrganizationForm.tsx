import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { IOrganization, OrganizationPostData } from '@energyweb/origin-backend-core';
import { Countries } from '@energyweb/utils-general';

import { Paper, Grid, Button, useTheme, makeStyles, createStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { showNotification, NotificationType } from '../../utils/notifications';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { FormCountrySelect } from '../Form/FormCountrySelect';
import { FormBusinessTypeSelect } from '../Form/FormBusinessTypeSelect';
import { FormCountryMultiSelect } from '../Form/FormCountryMultiSelect';
import { getOffChainDataSource } from '../../features/general/selectors';
import { useLinks } from '../../utils/routing';
import { IAutocompleteMultiSelectOptionType } from '../MultiSelectAutocomplete';
import { setUserOffchain } from '../../features/users/actions';
import { getUserOffchain } from '../../features/users/selectors';

interface IProps {
    entity: IOrganization;
    readOnly: boolean;
}

interface IFormValues {
    code: string;
    name: string;
    contact: string;
    telephone: string;
    email: string;
    address: string;
    shareholders: string;
    ceoPassportNumber: string;
    ceoName: string;
    companyNumber: string;
    vatNumber: string;
    postcode: string;
    headquartersCountry: number | '';
    country: number | '';
    businessTypeSelect: string;
    businessTypeInput: string;
    yearOfRegistration: number | '';
    numberOfEmployees: number | '';
    website: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    code: '',
    name: '',
    contact: '',
    telephone: '',
    email: '',
    address: '',
    shareholders: '',
    ceoPassportNumber: '',
    ceoName: '',
    companyNumber: '',
    vatNumber: '',
    postcode: '',
    headquartersCountry: '',
    country: '',
    businessTypeSelect: '',
    businessTypeInput: '',
    yearOfRegistration: '',
    numberOfEmployees: '',
    website: ''
};

const ERRORS = {
    COMPANY_NUMBER_OR_CEO_PASSPORT: 'You must provide company number or CEO passport number.'
};

const VALIDATION_SCHEMA = Yup.object({
    code: Yup.string().required().label('Code'),
    name: Yup.string().required().label('Name'),
    contact: Yup.string().required().label('Contact'),
    telephone: Yup.string().required().label('Telephone'),
    email: Yup.string().email().required().label('Email'),
    address: Yup.string().required().label('Address'),
    shareholders: Yup.string().required().label('Shareholders'),
    ceoPassportNumber: Yup.string().label('CEO passport number'),
    ceoName: Yup.string().required().label('CEO name'),
    companyNumber: Yup.string().label('Company number'),
    vatNumber: Yup.string().required().label('VAT number'),
    postcode: Yup.string().required().label('Postcode'),
    headquartersCountry: Yup.string().required().label('Headquarters country'),
    country: Yup.string().required().label('Country'),
    yearOfRegistration: Yup.number().min(1900).label('Year of registration').required(),
    numberOfEmployees: Yup.number().positive().label('Approximate number of employees').required(),
    website: Yup.string().url().label('Website').required(),
    businessTypeSelect: Yup.string().label('Business type').required(),
    businessTypeInput: Yup.string().label('Business type').when('businessTypeSelect', {
        is: 'Other',
        then: Yup.string().required()
    }),
    atLeastOneProp: Yup.mixed().test(
        'atLeastOneProperty',
        ERRORS.COMPANY_NUMBER_OR_CEO_PASSPORT,
        function (this: Yup.TestContext): boolean {
            const objectToValidate: IFormValues = this.parent;

            if (!objectToValidate) {
                return false;
            }

            return !!(objectToValidate.companyNumber || objectToValidate.ceoPassportNumber);
        }
    )
});

export function OrganizationForm(props: IProps) {
    const { entity, readOnly } = props;
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const [activeCountries, setActiveCountries] = useState<IAutocompleteMultiSelectOptionType[]>(
        []
    );
    const [initialFormValuesFromExistingEntity, setInitialFormValuesFromExistingEntity] = useState<
        IFormValues
    >(null);
    const { getOrganizationViewLink } = useLinks();
    const history = useHistory();
    const user = useSelector(getUserOffchain);

    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    useEffect(() => {
        function setupFormBasedOnExistingEntity() {
            setInitialFormValuesFromExistingEntity(entity);

            const activeCountriesParsed: string[] = JSON.parse(entity.activeCountries);

            setActiveCountries(
                Countries.filter((c) => activeCountriesParsed.includes(c.id.toString())).map(
                    (country) => ({
                        value: country.id.toString(),
                        label: country.name
                    })
                )
            );
        }

        if (entity && readOnly) {
            setupFormBasedOnExistingEntity();
        }
    }, [entity]);

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        if (values.headquartersCountry === '' || values.country === '') {
            return;
        }

        dispatch(setLoading(true));

        try {
            formikActions.setSubmitting(true);

            const formData: OrganizationPostData = {
                ...values,
                activeCountries: JSON.stringify(activeCountries.map((i) => i.value)),
                numberOfEmployees: Number(values.numberOfEmployees),
                yearOfRegistration: Number(values.yearOfRegistration),
                headquartersCountry: values.headquartersCountry,
                country: values.country
            };

            const organization = await organizationClient.add(formData);
            dispatch(setUserOffchain({ ...user, organization }));
            formikActions.setSubmitting(false);

            history.push(getOrganizationViewLink(organization?.id?.toString()));

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
    }

    let initialFormValues: IFormValues = null;

    if (entity && readOnly) {
        initialFormValues = initialFormValuesFromExistingEntity;
    } else {
        initialFormValues = INITIAL_FORM_VALUES;
    }

    if (!initialFormValues) {
        return <Skeleton variant="rect" height={200} />;
    }

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, values, errors } = formikProps;

                    const otherErrors = (errors as any)?.atLeastOneProp;

                    const fieldDisabled = isSubmitting || readOnly;
                    const buttonDisabled = isSubmitting || !isValid || activeCountries.length === 0;

                    return (
                        <Form translate="">
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        label="Code"
                                        property="code"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Name"
                                        property="name"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormCountrySelect
                                        label="Headquarters Country"
                                        property="headquartersCountry"
                                        currentValue={values.headquartersCountry}
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Contact"
                                        property="contact"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Email"
                                        property="email"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Telephone"
                                        property="telephone"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Company number"
                                        property="companyNumber"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                    />

                                    <FormInput
                                        label="VAT number"
                                        property="vatNumber"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="CEO name"
                                        property="ceoName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="CEO passport number"
                                        property="ceoPassportNumber"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormBusinessTypeSelect
                                        label="Business type"
                                        selectProperty="businessTypeSelect"
                                        selectCurrentValue={values.businessTypeSelect}
                                        inputProperty="businessTypeInput"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Year of registration"
                                        property="yearOfRegistration"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Approximate number of employees"
                                        property="numberOfEmployees"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Shareholders"
                                        property="shareholders"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Website"
                                        property="website"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormCountryMultiSelect
                                        label="Active countries"
                                        placeholder="Select active countries"
                                        onChange={(value) => setActiveCountries(value)}
                                        selectedValues={activeCountries}
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        max={3}
                                    />

                                    <FormInput
                                        label="Address"
                                        property="address"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        label="Postcode"
                                        property="postcode"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormCountrySelect
                                        label="Country"
                                        property="country"
                                        currentValue={values.country}
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                            </Grid>

                            {otherErrors && <div className="mt-3">{otherErrors}</div>}

                            {!readOnly && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={buttonDisabled}
                                >
                                    Register
                                </Button>
                            )}
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
