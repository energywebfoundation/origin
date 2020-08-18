import React, { useEffect } from 'react';
import { Paper, Button, Theme, makeStyles, Box } from '@material-ui/core';
import { Formik, FormikHelpers, Form, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { IUserClient } from '@energyweb/origin-backend-core';
import { getOffChainDataSource, showNotification, NotificationType, useTranslation } from '../..';
import { setLoading } from '../../features/general';
import { getUserOffchain } from '../../features/users/selectors';
import { useHistory } from 'react-router-dom';
import { setAuthenticationToken } from '../../features/users/actions';
import { useLinks, useValidation } from '../../utils';
import { InputFixedHeight } from '../Form/InputFixedHeight';
import EnergyWebOriginLogo from '../../../assets/EW-Origin-WhiteText.svg';

interface IFormValues {
    email: string;
    password: string;
}

const INITIAL_VALUES: IFormValues = {
    email: '',
    password: ''
};

interface IOwnProps {
    redirect?: string;
}

export const LoginForm = (props: IOwnProps) => {
    const dispatch = useDispatch();
    const userClient: IUserClient = useSelector(getOffChainDataSource)?.userClient;
    const user = useSelector(getUserOffchain);
    const history = useHistory();
    const { t } = useTranslation();
    const { getCertificatesLink } = useLinks();
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
            const loginResponse = await userClient.login(values.email, values.password);

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

    useEffect(() => {
        if (user) {
            history.push(props.redirect || getCertificatesLink());
        }
    }, [user]);

    return (
        <Paper elevation={1} className="LoginForm" classes={{ root: styles.form }}>
            <div className={styles.logo}>
                <img src={EnergyWebOriginLogo} />
            </div>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting } = formikProps;
                    const buttonDisabled = isSubmitting || !isValid;

                    return (
                        <Form translate="">
                            <Field
                                label={t('user.properties.email')}
                                name="email"
                                type="text"
                                required
                                component={InputFixedHeight}
                            />

                            <Field
                                label={t('user.properties.password')}
                                name="password"
                                required
                                type="password"
                                component={InputFixedHeight}
                            />
                            <Box px={1} textAlign="right">
                                <Button className={styles.button}>
                                    {t('user.actions.forgotPasswordAsk')}
                                </Button>
                            </Box>
                            <Button
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
