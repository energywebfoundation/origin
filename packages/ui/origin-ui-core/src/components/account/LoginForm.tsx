import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikHelpers, Form, Field } from 'formik';
import { Paper, Button, Theme, makeStyles, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { setLoading, getBackendClient } from '../../features/general';
import { setAuthenticationToken } from '../../features/users';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useValidation } from '../../utils/validation';
import { useLinks } from '../../utils/routing';
import { InputFixedHeight } from '../Form/InputFixedHeight';
import { OriginConfigurationContext } from '../../PackageConfigurationProvider';

interface IFormValues {
    email: string;
    password: string;
}

const INITIAL_VALUES: IFormValues = {
    email: '',
    password: ''
};

export const LoginForm = () => {
    const dispatch = useDispatch();
    const originConfiguration = useContext(OriginConfigurationContext);
    const authClient = useSelector(getBackendClient)?.authClient;
    const history = useHistory();
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const { getAccountLink } = useLinks();

    const useStyles = makeStyles((theme: Theme) => ({
        form: {
            padding: theme.spacing(2)
        },
        button: {
            textTransform: 'none',
            marginTop: theme.spacing(1)
        },
        logo: {
            paddingBottom: theme.spacing(3)
        },
        link: {
            textDecoration: 'none',
            color: theme.palette.text.primary
        }
    }));
    const styles = useStyles();

    const initialFormValues: IFormValues = INITIAL_VALUES;

    async function submitForm(
        values: typeof INITIAL_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            const { data: loginResponse } = await authClient.login({
                username: values.email,
                password: values.password
            });
            dispatch(setAuthenticationToken(loginResponse.accessToken));
        } catch (error) {
            console.warn('Could not log in.', error);
            showNotification(t('user.feedback.couldNotLogIn'), NotificationType.Error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    const VALIDATION_SCHEMA = Yup.object().shape({
        email: Yup.string().email().label(t('user.properties.email')).required(),
        password: Yup.string().label(t('user.properties.password')).required()
    });

    return (
        <Paper elevation={1} className="LoginForm" classes={{ root: styles.form }}>
            <div className={styles.logo}>{originConfiguration.logo}</div>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                validateOnMount={true}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, handleBlur, validateField } = formikProps;
                    const buttonDisabled = isSubmitting || !isValid;

                    return (
                        <Form translate="no">
                            <Field
                                data-cy="email"
                                label={t('user.properties.email')}
                                name="email"
                                type="text"
                                required
                                component={InputFixedHeight}
                                onBlur={(e) => {
                                    handleBlur(e);
                                    validateField(e.target.name);
                                }}
                            />

                            <Field
                                data-cy="password"
                                label={t('user.properties.password')}
                                name="password"
                                required
                                type="password"
                                component={InputFixedHeight}
                                onBlur={(e) => {
                                    handleBlur(e);
                                    validateField(e.target.name);
                                }}
                            />
                            <Box px={1} textAlign="right">
                                <Button className={styles.button}>
                                    {t('user.actions.forgotPasswordAsk')}
                                </Button>
                            </Box>
                            <Button
                                data-cy="login-button"
                                type="submit"
                                variant="contained"
                                color="primary"
                                className={styles.button}
                                disabled={buttonDisabled}
                                fullWidth
                            >
                                {t('user.actions.login')}
                            </Button>
                            <Box pt={2} textAlign="left">
                                {t('user.dialog.dontHaveAccAsk')}
                            </Box>
                            <Box pt={1} textAlign="left">
                                <Button
                                    data-cy="register-now-button"
                                    className={styles.button}
                                    onClick={() =>
                                        history.push(`${getAccountLink()}/user-register`)
                                    }
                                >
                                    {t('user.actions.registerNow')}
                                </Button>
                            </Box>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
};
