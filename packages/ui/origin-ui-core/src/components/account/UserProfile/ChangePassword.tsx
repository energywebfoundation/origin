import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Form, Formik, FormikHelpers, FormikProps, yupToFormErrors } from 'formik';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import {
    NotificationTypeEnum,
    showNotification,
    useValidation,
    BackendClient
} from '../../../utils';

import { FormInput } from '../../Form';
import { fromGeneralActions, fromGeneralSelectors, fromUsersActions } from '../../../features';

export const ChangePasswordForm = (): ReactElement => {
    const backendClient: BackendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const userClient = backendClient?.userClient;
    const { Yup } = useValidation();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const history = useHistory();

    const VALIDATION_SCHEMA_PASSWORD = Yup.object().shape({
        currentPassword: Yup.string().label('Current Password').required(),
        newPassword: Yup.string().label('New Password').required(),
        newPasswordConfirm: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], "Entered value doesn't match new password")
            .label('Confirm Password')
            .required()
    });

    const INITIAL_VALUES = {
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    };

    async function submitForm(
        values: typeof INITIAL_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(fromGeneralActions.setLoading(true));

        try {
            await userClient.updateOwnPassword({
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            showNotification(t('user.profile.updatePassword'), NotificationTypeEnum.Success);
            dispatch(fromUsersActions.refreshUserOffchain());
            setIsEditing(false);
            dispatch(fromUsersActions.clearAuthenticationToken());
            history.push('/');
        } catch (error) {
            showNotification(t('user.profile.errorUpdatePassword'), NotificationTypeEnum.Error);
        }

        formikActions.resetForm();
        dispatch(fromGeneralActions.setLoading(false));
        formikActions.setSubmitting(false);
    }

    async function ValidationHandler(values: typeof INITIAL_VALUES) {
        try {
            await VALIDATION_SCHEMA_PASSWORD.validate(values, {
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
                            <Typography variant="h5">
                                {t('user.profile.subtitle.security')}
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={4}>
                                    <FormInput
                                        data-cy="current-password"
                                        label="Current Password"
                                        property="currentPassword"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        type="password"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormInput
                                        data-cy="new-password"
                                        label="New Password"
                                        property="newPassword"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        type="password"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormInput
                                        data-cy="confirm-password"
                                        label="Confirm Password"
                                        property="newPasswordConfirm"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        type="password"
                                        required
                                    />
                                </Grid>
                            </Grid>

                            {isEditing && (
                                <Button
                                    data-cy="password-save-button"
                                    style={{ marginRight: 10 }}
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={!(touched.currentPassword || touched.newPassword)}
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
                                    data-cy="password-cancel-button"
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
                                    data-cy="password-edit-button"
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {t('user.profile.actions.changePassword')}
                                </Button>
                            )}
                        </Paper>
                    </Form>
                );
            }}
        </Formik>
    );
};
