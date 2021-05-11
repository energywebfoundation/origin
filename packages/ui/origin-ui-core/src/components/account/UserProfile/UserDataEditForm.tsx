import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, Paper, Typography, TextField } from '@material-ui/core';
import { Form, Formik, FormikHelpers, yupToFormErrors, Field, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { IUser, UserStatus, KYCStatus } from '@energyweb/origin-backend-core';
import { NotificationTypeEnum, showNotification } from '../../../utils';
import { useValidation, BackendClient } from '../../../utils';
import { FormInput } from '../../Form';
import {
    fromGeneralActions,
    fromGeneralSelectors,
    fromUsersActions,
    fromUsersSelectors
} from '../../../features';

const INITIAL_FORM_VALUES: IUser = {
    id: 0,
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    blockchainAccountAddress: '',
    blockchainAccountSignedMessage: '',
    notifications: null,
    organization: null,
    rights: 0,
    status: UserStatus.Pending,
    kycStatus: KYCStatus.Pending,
    emailConfirmed: false
};

export const UserDataEditForm = (): JSX.Element => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const backendClient: BackendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const userClient = backendClient?.userClient;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { Yup } = useValidation();
    const [isEditing, setIsEditing] = useState(false);

    if (!user) {
        return null;
    }

    const VALIDATION_SCHEMA_PROFILE = Yup.object().shape({
        firstName: Yup.string().label(t('user.properties.firstName')).required(),
        lastName: Yup.string().label(t('user.properties.lastName')).required(),
        telephone: Yup.string().label(t('user.properties.telephone')).required()
    });

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(fromGeneralActions.setLoading(true));

        try {
            await userClient.updateOwnProfile({
                firstName: values?.firstName,
                lastName: values?.lastName,
                telephone: values?.telephone,
                email: values?.email
            });
            showNotification(t('user.profile.updateProfile'), NotificationTypeEnum.Success);
            dispatch(fromUsersActions.refreshUserOffchain());
            setIsEditing(false);
            formikActions.setTouched({}, false);
        } catch (error) {
            showNotification(t('user.profile.errorUpdateProfile'), NotificationTypeEnum.Error);
        }

        dispatch(fromGeneralActions.setLoading(false));
        formikActions.setSubmitting(false);
    }

    const INITIAL_VALUES: IUser = {
        ...user
    };

    async function ValidationHandler(values: typeof INITIAL_VALUES) {
        try {
            await VALIDATION_SCHEMA_PROFILE.validate(values, {
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
                const { isSubmitting, touched, values } = formikProps;
                const fieldDisabled = isSubmitting || !isEditing;

                return (
                    <Form translate="no">
                        <Paper className="container">
                            <Typography variant="h5">
                                {t('user.profile.subtitle.basicInformation')}
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        data-cy="first-name"
                                        label={t('user.properties.firstName')}
                                        property="firstName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <Field
                                        label={t('user.properties.status')}
                                        type="status"
                                        name="status"
                                        component={TextField}
                                        variant="filled"
                                        fullWidth
                                        disabled={true}
                                        value={values.status}
                                        className="mt-3"
                                    />

                                    <FormInput
                                        data-cy="telephone"
                                        label={t('user.properties.telephone')}
                                        property="telephone"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        data-cy="last-name"
                                        label={t('user.properties.lastName')}
                                        property="lastName"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    {values.emailConfirmed ? (
                                        <Field
                                            label={t('user.properties.emailConfirmed')}
                                            type="emailConfirmed"
                                            name="emailConfirmed"
                                            component={TextField}
                                            variant="filled"
                                            fullWidth
                                            disabled={true}
                                            value={t('general.responses.yes')}
                                            className="mt-3"
                                        />
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="contained"
                                            color="primary"
                                            className="mt-4 mb-2 right"
                                            onClick={async () => {
                                                const {
                                                    data: { success }
                                                } = await userClient.reSendEmailConfirmation();

                                                const message = t(
                                                    success
                                                        ? 'user.feedback.confirmationEmailResent'
                                                        : 'user.feedback.confirmationEmailResentFailed'
                                                );

                                                showNotification(
                                                    message,
                                                    success
                                                        ? NotificationTypeEnum.Success
                                                        : NotificationTypeEnum.Error
                                                );
                                            }}
                                        >
                                            {t('user.actions.resendConfirmationEmail')}
                                        </Button>
                                    )}

                                    <Field
                                        label={t('user.properties.kycStatus')}
                                        type="kycStatus"
                                        name="kycStatus"
                                        component={TextField}
                                        variant="filled"
                                        fullWidth
                                        disabled={true}
                                        value={values.kycStatus}
                                        className="mt-3"
                                    />
                                </Grid>
                            </Grid>
                            {isEditing && (
                                <Button
                                    data-cy="info-save-button"
                                    style={{ marginRight: 10 }}
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={
                                        !(
                                            touched.firstName ||
                                            touched.lastName ||
                                            touched.telephone
                                        )
                                    }
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
                                    data-cy="info-cancel-button"
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
                                    data-cy="info-edit-button"
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {t('user.actions.edit')}
                                </Button>
                            )}
                        </Paper>
                    </Form>
                );
            }}
        </Formik>
    );
};
