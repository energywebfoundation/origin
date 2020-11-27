import { IUser, UserStatus, KYCStatus } from '@energyweb/origin-backend-core';
import {
    Button,
    createStyles,
    Grid,
    makeStyles,
    Paper,
    Typography,
    useTheme,
    TextField
} from '@material-ui/core';
import { signTypedMessage } from '@energyweb/utils-general';
import { Skeleton } from '@material-ui/lab';
import { Form, Formik, FormikHelpers, yupToFormErrors, Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../features/general/actions';
import { getBackendClient, getEnvironment } from '../../features/general/selectors';
import { refreshUserOffchain } from '../../features/users/actions';
import { NotificationType, showNotification } from '../../utils/notifications';
import { useValidation } from '../../utils/validation';
import { FormInput } from '../Form/FormInput';
import { ICoreState } from '../../types';
import { getWeb3 } from '../../features/selectors';
import { getActiveBlockchainAccountAddress } from '../../features/users/selectors';
import { providers } from 'ethers';

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
    status: UserStatus.Pending,
    kycStatus: KYCStatus.Pending,
    emailConfirmed: false
};

export const getUserOffchain = (state: ICoreState) => state.usersState.userOffchain;

export function UserProfile() {
    const user = useSelector(getUserOffchain);
    const userClient = useSelector(getBackendClient)?.userClient;
    const dispatch = useDispatch();
    const web3 = useSelector(getWeb3);
    const environment = useSelector(getEnvironment);
    const activeBlockchainAccountAddress = useSelector(getActiveBlockchainAccountAddress);

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
        blockchainAccountAddress: Yup.string()
            .label(t('user.properties.blockchainAddress'))
            .required()
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
                await userClient.updateOwnPassword({
                    oldPassword: values.currentPassword,
                    newPassword: values.newPassword
                });
                showNotification(t('user.profile.updatePassword'), NotificationType.Success);
            } else if (values.isProfile) {
                await userClient.updateOwnProfile(values);
                showNotification(t('user.profile.updateProfile'), NotificationType.Success);
            } else if (values.isBlockchain) {
                await userClient.updateOwnProfile(values);
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

    async function signAndSend(blockchainAccountAddress: string): Promise<boolean> {
        try {
            if (activeBlockchainAccountAddress === null) {
                throw Error(t('user.profile.noBlockchainConnection'));
            } else if (blockchainAccountAddress === activeBlockchainAccountAddress.toLowerCase()) {
                throw Error(t('user.profile.blockchainAlreadyLinked'));
            }
            const signedMessage = await signTypedMessage(
                activeBlockchainAccountAddress,
                environment.REGISTRATION_MESSAGE_TO_SIGN,
                web3 as providers.JsonRpcProvider
            );

            await userClient.updateOwnBlockchainAddress({ ...user, blockchainAccountAddress: '' });
            await userClient.update({ blockchainAccountSignedMessage: signedMessage });

            showNotification(
                t('settings.feedback.blockchainAccountLinked'),
                NotificationType.Success
            );

            return true;
        } catch (error) {
            if (error?.data?.message) {
                showNotification(error?.data?.message, NotificationType.Error);
            } else if (error?.message) {
                console.log(error);
                showNotification(error?.message, NotificationType.Error);
            } else {
                console.warn('Could not log in.', error);
                showNotification(t('general.feedback.unknownError'), NotificationType.Error);
            }
        }
        return false;
    }

    const initialFormValues: IFormValues = {
        ...user,
        blockchainAccountAddress: user.blockchainAccountAddress ? user.blockchainAccountAddress : ''
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
                const { isSubmitting, touched, values } = formikProps;
                const fieldDisabled = isSubmitting;

                console.log({
                    values
                });

                return (
                    <>
                        <Form translate="no">
                            <Paper className={classes.container}>
                                <Typography variant="h5">
                                    {t('user.profile.subtitle.basicInformation')}
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label={t('user.properties.firstName')}
                                            property="firstName"
                                            disabled={fieldDisabled}
                                            className="mt-3"
                                            required
                                        />

                                        <FormInput
                                            label={t('user.properties.email')}
                                            property="email"
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
                                            label={t('user.properties.telephone')}
                                            property="telephone"
                                            disabled={fieldDisabled}
                                            className="mt-3"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormInput
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
                                                value={t(
                                                    values.emailConfirmed
                                                        ? 'general.responses.yes'
                                                        : 'general.responses.no'
                                                )}
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
                                                            ? NotificationType.Success
                                                            : NotificationType.Error
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
                        <Form translate="no">
                            <Paper className={classes.container}>
                                <Typography variant="h5">
                                    {t('user.profile.subtitle.security')}
                                </Typography>
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
                        <Form translate="no">
                            <Paper className={classes.container}>
                                <Typography variant="h5">
                                    {t('user.properties.blockchainAddress')}
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <FormInput
                                            label={t('user.properties.blockchainAddress')}
                                            property="blockchainAccountAddress"
                                            disabled={true}
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
                                    onClick={() => {
                                        formikProps.validateForm().then(async () => {
                                            formikProps.values.isBlockchain = true;
                                            formikProps.values.isPassword = false;
                                            formikProps.values.isProfile = false;

                                            const result = await signAndSend(
                                                values.blockchainAccountAddress
                                            );
                                            if (result) {
                                                formikProps.values.blockchainAccountAddress = activeBlockchainAccountAddress;
                                                formikProps.submitForm();
                                            }
                                        });
                                    }}
                                >
                                    {t('user.actions.save')} &{' '}
                                    {t('settings.actions.verifyBlockchainAccount')}
                                </Button>
                            </Paper>
                        </Form>
                    </>
                );
            }}
        </Formik>
    );
}
