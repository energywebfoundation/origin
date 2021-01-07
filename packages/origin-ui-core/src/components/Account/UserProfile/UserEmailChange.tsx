import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { Form, Formik, FormikHelpers, yupToFormErrors, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { setLoading, getBackendClient } from '../../../features/general';
import { refreshUserOffchain, getUserOffchain } from '../../../features/users';
import { NotificationType, showNotification, useValidation, BackendClient } from '../../../utils';
import { FormInput } from '../../Form';
import { useHistory } from 'react-router-dom';

const INITIAL_FORM_VALUES = {
    email: ''
};

export function UserEmailChange(): JSX.Element {
    const user = useSelector(getUserOffchain);
    const backendClient: BackendClient = useSelector(getBackendClient);
    const userClient = backendClient?.userClient;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const [isEditing, setIsEditing] = useState(false);
    const history = useHistory();

    if (!user) {
        return null;
    }

    const VALIDATION_SCHEMA = Yup.object().shape({
        email: Yup.string().email().label(t('user.properties.email')).required()
    });

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            await userClient.updateOwnProfile({
                ...user,
                email: values?.email
            });
            showNotification(t('user.profile.updateProfile'), NotificationType.Success);
            dispatch(refreshUserOffchain());
            setIsEditing(false);
            formikActions.resetForm();
            history.push('/');
        } catch (error) {
            showNotification(t('user.profile.errorUpdateProfile'), NotificationType.Error);
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    const INITIAL_VALUES = {
        email: user.email
    };

    async function ValidationHandler(values: typeof INITIAL_VALUES) {
        try {
            await VALIDATION_SCHEMA.validate(values, {
                abortEarly: false
            });
            return {};
        } catch (err) {
            return yupToFormErrors(err);
        }
    }

    return (
        <Formik
            initialValues={INITIAL_VALUES}
            validateOnMount={true}
            onSubmit={submitForm}
            validate={ValidationHandler}
        >
            {(formikProps: FormikProps<typeof INITIAL_VALUES>) => {
                const { isSubmitting, touched } = formikProps;
                const fieldDisabled = isSubmitting || !isEditing;

                return (
                    <Form translate="no">
                        <Paper className="container">
                            <Typography variant="h5">{t('user.profile.subtitle.email')}</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        label={t('user.properties.email')}
                                        property="email"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                            </Grid>
                            {isEditing && (
                                <Button
                                    style={{ marginRight: 10 }}
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={!touched.email}
                                    onClick={async () => {
                                        await formikProps.validateForm();
                                        await formikProps.submitForm();
                                    }}
                                >
                                    {t('user.actions.save')}
                                </Button>
                            )}
                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    onClick={() => {
                                        formikProps.resetForm();
                                        setIsEditing(false);
                                    }}
                                >
                                    {t('user.actions.cancel')}
                                </Button>
                            )}
                            {!isEditing && (
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {t('user.profile.actions.changeEmail')}
                                </Button>
                            )}
                        </Paper>
                    </Form>
                );
            }}
        </Formik>
    );
}
