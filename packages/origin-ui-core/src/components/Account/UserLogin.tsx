import React from 'react';
import { showNotification, NotificationType } from '../../utils/notifications';
import {
    Paper,
    FormControl,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Field, Form, FormikActions } from 'formik';
import * as Yup from 'yup';
import { TextField } from 'formik-material-ui';
import { setLoading } from '../../features/general/actions';
import { FormInput } from '../Form/FormInput';
import { getUserClient } from '../../features/general/selectors';
import { setAuthenticationToken } from '../../features/users/actions';

interface IFormValues {
    email: string;
    password: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    email: '',
    password: ''
};

const VALIDATION_SCHEMA = Yup.object().shape({
    email: Yup.string()
        .email()
        .label('Email')
        .required(),
    password: Yup.string()
        .label('Password')
        .required()
});

export function UserLogin() {
    const userClient = useSelector(getUserClient);
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
            const loginResponse = await userClient.login(values.email, values.password);

            dispatch(setAuthenticationToken(loginResponse.accessToken));

            showNotification('User logged in.', NotificationType.Success);
        } catch (error) {
            console.warn('Could not log in.', error);
            showNotification('Could not log in with supplied credentials.', NotificationType.Error);
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
                    const { isValid, isSubmitting } = formikProps;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid;

                    return (
                        <Form>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormInput
                                        label="Email"
                                        property="email"
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
                                            label="Password"
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
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                Login
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
