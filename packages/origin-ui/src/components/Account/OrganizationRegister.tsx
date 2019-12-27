import React, { useState } from 'react';
import { showNotification, NotificationType } from '../../utils/notifications';
import { Paper, Grid, Button, useTheme, makeStyles, createStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { FormCountrySelect } from '../Form/FormCountrySelect';
import { FormBusinessTypeSelect } from '../Form/FormBusinessTypeSelect';
import {
    FormCountryMultiSelect,
    IFormCountryMultiSelectOption
} from '../Form/FormCountryMultiSelect';
import { getEnvironment } from '../../features/general/selectors';
import axios from 'axios';

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
    code: Yup.string()
        .required()
        .label('Code'),
    name: Yup.string()
        .required()
        .label('Name'),
    contact: Yup.string()
        .required()
        .label('Contact'),
    telephone: Yup.string()
        .required()
        .label('Telephone'),
    email: Yup.string()
        .email()
        .required()
        .label('Email'),
    address: Yup.string()
        .required()
        .label('Address'),
    shareholders: Yup.string()
        .required()
        .label('Shareholders'),
    ceoPassportNumber: Yup.string().label('CEO passport number'),
    ceoName: Yup.string()
        .required()
        .label('CEO name'),
    companyNumber: Yup.string().label('Company number'),
    vatNumber: Yup.string()
        .required()
        .label('VAT number'),
    postcode: Yup.string()
        .required()
        .label('Postcode'),
    headquartersCountry: Yup.string()
        .required()
        .label('Headquarters country'),
    country: Yup.string()
        .required()
        .label('Country'),
    yearOfRegistration: Yup.number()
        .positive()
        .label('Year of registration')
        .required(),
    numberOfEmployees: Yup.number()
        .positive()
        .label('Approximate number of employees')
        .required(),
    website: Yup.string()
        .url()
        .label('Website')
        .required(),
    businessTypeSelect: Yup.string()
        .label('Business type')
        .required(),
    businessTypeInput: Yup.string()
        .label('Business type')
        .when('businessTypeSelect', {
            is: 'Other',
            then: Yup.string().required()
        })
}).test({
    name: 'at-least-one-property',
    message: ERRORS.COMPANY_NUMBER_OR_CEO_PASSPORT,
    test: value => !!(value.companyNumber || value.ceoPassportNumber)
});

export function OrganizationRegister() {
    const environment = useSelector(getEnvironment);
    const [activeCountries, setActiveCountries] = useState<IFormCountryMultiSelectOption[]>([]);

    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikActions<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            await axios.post(`${environment.BACKEND_URL}/api/Organization`, values);

            showNotification('Organization registered.', NotificationType.Success);
        } catch (error) {
            console.warn('Error while registering an organization', error);
            showNotification('Organization could not be created.', NotificationType.Error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    const initialFormValues: IFormValues = INITIAL_FORM_VALUES;

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {formikProps => {
                    const { isValid, isSubmitting, values, errors } = formikProps;

                    const undefinedErrors = (errors as any).undefined;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid || activeCountries.length === 0;

                    return (
                        <Form>
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
                                        onChange={value => setActiveCountries(value)}
                                        selectedValues={activeCountries}
                                        disabled={fieldDisabled}
                                        className="mt-3"
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

                            {undefinedErrors && <div className="mt-3">{undefinedErrors}</div>}

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                Register
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
