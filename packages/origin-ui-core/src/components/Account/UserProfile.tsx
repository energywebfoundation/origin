import { IUser } from '@energyweb/origin-backend-core';
import {
    Button,
    createStyles,
    Grid,
    makeStyles,
    Paper,
    Typography,
    useTheme
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Form, Formik, FormikHelpers, yupToFormErrors } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../features/general/actions';
import { getOffChainDataSource } from '../../features/general/selectors';
import { refreshUserOffchain } from '../../features/users/actions';
import { NotificationType, showNotification } from '../../utils/notifications';
import { useValidation } from '../../utils/validation';
import { KeyKYCStatus, KeyStatus } from '../AdminUsersTable';
import { FormInput } from '../Form/FormInput';
import { IStoreState } from '../../types';

interface IFormValues extends IUser {
    isBlockchain?: boolean;
    isPassword?: boolean;
    isProfile?: boolean;
    currentPassword?: string;
    newPassword?: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
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
    status: 0,
    kycStatus: 0
};

export const getUserOffchain = (state: IStoreState) => state.users.userOffchain;

export function UserProfile() {
    const user = useSelector(getUserOffchain);
    const userClient = useSelector(getOffChainDataSource)?.userClient;
    const dispatch = useDispatch();

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

    if (!user) {
        return null;
    }

    const VALIDATION_SCHEMA_ADDRESS = Yup.object().shape({
        blockchainAccountAddress: Yup.string().label('Address').required()
    });

    const VALIDATION_SCHEMA_PROFILE = Yup.object().shape({
        firstName: Yup.string().label(t('user.properties.firstName')).required(),
        lastName: Yup.string().label(t('user.properties.lastName')).required(),
        telephone: Yup.string().label(t('user.properties.telephone')).required(),
        email: Yup.string().email().label(t('user.properties.email')).required()
    });

    const VALIDATION_SCHEMA_PASSWORD = Yup.object().shape({
        currentPassword: Yup.string().label('Current Password').required(),
        newPassword: Yup.string().label('New Password').required()
    });

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            if (values.isPassword) {
                await userClient.updatePassword({
                    email: values.email,
                    oldPassword: values.currentPassword,
                    newPassword: values.newPassword
                });
                showNotification(t('user.profile.updatePassword'), NotificationType.Success);
            } else if (values.isProfile) {
                await userClient.updateProfile(values);
                showNotification(t('user.profile.updateProfile'), NotificationType.Success);
            } else if (values.isBlockchain) {
                await userClient.updateChainAddress(values);
                showNotification(t('user.profile.updateChainAddress'), NotificationType.Success);
            }
            dispatch(refreshUserOffchain());
        } catch (error) {
            if (values.isPassword) {
                showNotification(t('user.profile.errorUpdatePassword'), NotificationType.Error);
            } else if (values.isProfile) {
                showNotification(t('user.profile.errorUpdateProfile'), NotificationType.Error);
            } else if (values.isBlockchain) {
                showNotification(t('user.profile.errorUpdateChainAddress'), NotificationType.Error);
            }
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    const initialFormValues: IFormValues = {
        ...user,
        status: KeyStatus[user.status] ?? 'N/A',
        kycStatus: KeyKYCStatus[user.kycStatus] ?? 'N/A'
    };

    return (
        <Formik
            initialValues={initialFormValues}
            isInitialValid={false}
            onSubmit={submitForm}
            validate={async (values) => {
                const context = {};
                let errors = {};
                if (values.isBlockchain) {
                    await VALIDATION_SCHEMA_ADDRESS.validate(values, {
                        abortEarly: false,
                        context
                    }).catch((err) => {
                        errors = yupToFormErrors(err);
                    });
                } else if (values.isPassword) {
                    await VALIDATION_SCHEMA_PASSWORD.validate(values, {
                        abortEarly: false,
                        context
                    }).catch((err) => {
                        errors = yupToFormErrors(err);
                    });
                } else if (values.isProfile) {
                    await VALIDATION_SCHEMA_PROFILE.validate(values, {
                        abortEarly: false,
                        context
                    }).catch((err) => {
                        errors = yupToFormErrors(err);
                    });
                }
                return errors;
            }}
        >
            {(formikProps) => {
                const { isSubmitting, touched } = formikProps;
                const fieldDisabled = isSubmitting;
                return (
                    <>
                        <Form translate="">
                            <Paper className={classes.container}>
                                <Typography variant="h5">Basic Information</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label="First Name"
                                            property="firstName"
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
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label="Last Name"
                                            property="lastName"
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
                                    </Grid>

                                    <Grid item xs={6}>
                                        <FormInput
                                            label="Status"
                                            property="status"
                                            disabled={true}
                                            className="mt-3"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label="KYC Status"
                                            property="kycStatus"
                                            disabled={true}
                                            className="mt-3"
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={
                                        !(
                                            touched.firstName ||
                                            touched.lastName ||
                                            touched.email ||
                                            touched.telephone
                                        )
                                    }
                                    onClick={() => {
                                        formikProps.validateForm().then(() => {
                                            formikProps.values.isBlockchain = false;
                                            formikProps.values.isPassword = false;
                                            formikProps.values.isProfile = true;
                                            formikProps.submitForm();
                                        });
                                    }}
                                >
                                    {t('user.actions.save')}
                                </Button>
                            </Paper>
                        </Form>
                        <br />
                        <Form translate="">
                            <Paper className={classes.container}>
                                <Typography variant="h5">Security</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label="Current Password"
                                            property="currentPassword"
                                            disabled={fieldDisabled}
                                            className="mt-3"
                                            type="password"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label="New Password"
                                            property="newPassword"
                                            disabled={fieldDisabled}
                                            className="mt-3"
                                            type="password"
                                            required
                                        />
                                    </Grid>
                                </Grid>

                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={!(touched.currentPassword || touched.newPassword)}
                                    onClick={() => {
                                        formikProps.validateForm().then(() => {
                                            formikProps.values.isBlockchain = false;
                                            formikProps.values.isPassword = true;
                                            formikProps.values.isProfile = false;
                                            formikProps.submitForm();
                                        });
                                    }}
                                >
                                    {t('user.actions.save')}
                                </Button>
                            </Paper>
                        </Form>
                        <br />
                        <Form translate="">
                            <Paper className={classes.container}>
                                <Typography variant="h5">Blockchain Address</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label="Address"
                                            property="blockchainAccountAddress"
                                            disabled={fieldDisabled}
                                            className="mt-3"
                                            required
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={!touched.blockchainAccountAddress}
                                    onClick={() => {
                                        formikProps.validateForm().then(() => {
                                            formikProps.values.isBlockchain = true;
                                            formikProps.values.isPassword = false;
                                            formikProps.values.isProfile = false;
                                            formikProps.submitForm();
                                        });
                                    }}
                                >
                                    {t('user.actions.save')}
                                </Button>
                            </Paper>
                        </Form>
                    </>
                );
            }}
        </Formik>
    );
}
