import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Field, Form, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { TextField, Select } from 'formik-material-ui';
import {
    Paper,
    FormControl,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles,
    InputLabel,
    FilledInput,
    MenuItem
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { setLoading, getBackendClient } from '../../features/general';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useValidation } from '../../utils/validation';
import { FormInput } from '../Form';
import { UserRegisteredModal } from '../Modal';

interface IFormValues {
    titleSelect: string;
    titleInput: string;
    firstName: string;
    lastName: string;
    telephone: string;
    email: string;
    password: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    titleSelect: '',
    titleInput: '',
    firstName: '',
    lastName: '',
    telephone: '',
    email: '',
    password: ''
};

const TITLE_OPTIONS = ['Dr', 'Mr', 'Mrs', 'Ms', 'Other'];

export function UserRegister() {
    const userClient = useSelector(getBackendClient)?.userClient;
    const dispatch = useDispatch();
    const [showUserRegisteredModal, setShowUserRegisteredModal] = useState<boolean>(false);

    const { t } = useTranslation();
    const { Yup, yupLocaleInitialized } = useValidation();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    if (!yupLocaleInitialized) {
        return <Skeleton variant="rect" height={200} />;
    }

    const VALIDATION_SCHEMA = Yup.object().shape({
        titleSelect: Yup.string().label(t('user.properties.title')).required(),
        titleInput: Yup.string().label(t('user.properties.title')),
        firstName: Yup.string().label(t('user.properties.firstName')).required(),
        lastName: Yup.string().label(t('user.properties.lastName')).required(),
        telephone: Yup.string().label(t('user.properties.telephone')).required(),
        email: Yup.string().email().label(t('user.properties.email')).required(),
        password: Yup.string().label(t('user.properties.password')).required()
    });

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            await userClient.register({
                ...values,
                title: values.titleSelect === 'Other' ? values.titleInput : values.titleSelect
            });
            setShowUserRegisteredModal(true);

            showNotification(t('user.feedback.userRegistered'), NotificationType.Success);
        } catch (error) {
            const userExists = parseFloat(error.message.match(/\d/g).join('')) === 409;
            const message = userExists
                ? t('user.feedback.errorUserExists', {
                      userEmail: values.email
                  })
                : t('user.feedback.errorWhileRegisteringUser');
            console.warn('Error while registering user', error);
            showNotification(message, NotificationType.Error);
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
                validateOnMount={true}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, values } = formikProps;

                    const isTitleValid =
                        values.titleSelect === 'Other'
                            ? Boolean(values.titleInput)
                            : Boolean(values.titleSelect);

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid || !isTitleValid;

                    return (
                        <Form translate="no">
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <InputLabel required>
                                            {t('user.properties.title')}
                                        </InputLabel>
                                        <Field
                                            data-cy="title-select"
                                            name="titleSelect"
                                            label={t('user.properties.title')}
                                            component={Select}
                                            input={<FilledInput value={values.titleSelect} />}
                                            fullWidth
                                            variant="filled"
                                            required
                                            disabled={fieldDisabled}
                                        >
                                            {TITLE_OPTIONS.map((option) => (
                                                <MenuItem value={option} key={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </FormControl>

                                    {values.titleSelect === 'Other' && (
                                        <FormControl
                                            fullWidth
                                            variant="filled"
                                            className="mt-3"
                                            required
                                        >
                                            <Field
                                                data-cy="other-title-input"
                                                label={t('user.properties.title')}
                                                name="titleInput"
                                                component={TextField}
                                                variant="filled"
                                                fullWidth
                                                required
                                                disabled={fieldDisabled}
                                            />
                                        </FormControl>
                                    )}

                                    <FormInput
                                        data-cy="first-name"
                                        label={t('user.properties.firstName')}
                                        property="firstName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        data-cy="last-name"
                                        label={t('user.properties.lastName')}
                                        property="lastName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        data-cy="email"
                                        label={t('user.properties.email')}
                                        property="email"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormInput
                                        data-cy="telephone"
                                        label={t('user.properties.telephone')}
                                        property="telephone"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormControl
                                        fullWidth
                                        variant="filled"
                                        className="mt-3"
                                        required
                                    >
                                        <Field
                                            data-cy="password"
                                            label={t('user.properties.password')}
                                            name="password"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            required
                                            disabled={fieldDisabled}
                                            type="password"
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Button
                                data-cy="register-button"
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                {t('user.actions.register')}
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
            <UserRegisteredModal
                showModal={showUserRegisteredModal}
                setShowModal={setShowUserRegisteredModal}
            />
        </Paper>
    );
}
