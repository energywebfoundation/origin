import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    createStyles,
    Grid,
    makeStyles,
    Paper,
    Typography,
    useTheme,
    TextField,
    Box
} from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import { Form, Formik, FormikHelpers, yupToFormErrors, Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { IUser, UserStatus, KYCStatus } from '@energyweb/origin-backend-core';
import { setLoading } from '../../features/general/actions';
import { getBackendClient, getLoading } from '../../features/general/selectors';
import {
    refreshUserOffchain,
    updateUserBlockchain,
    createExchangeDepositAddress
} from '../../features/users';
import { NotificationType, showNotification } from '../../utils/notifications';
import { useValidation } from '../../utils/validation';
import { FormInput } from '../Form/FormInput';
import {
    getActiveBlockchainAccountAddress,
    getUserOffchain,
    getExchangeDepositAddress
} from '../../features/users/selectors';
import { IconPopover } from '../IconPopover';
import { BackendClient } from '../../utils';

interface IFormValues extends IUser {
    isBlockchain?: boolean;
    isPassword?: boolean;
    isProfile?: boolean;
    currentPassword?: string;
    newPassword?: string;
    exchangeDepositAddress: string;
}

const INITIAL_FORM_VALUES: IFormValues = {
    id: 0,
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    exchangeDepositAddress: '',
    blockchainAccountAddress: '',
    blockchainAccountSignedMessage: '',
    notifications: null,
    organization: null,
    rights: 0,
    status: UserStatus.Pending,
    kycStatus: KYCStatus.Pending,
    emailConfirmed: false
};

const useStyles = makeStyles(() =>
    createStyles({
        container: {
            padding: '20px'
        },
        buttonAndIconHolder: {
            paddingTop: '1rem',
            display: 'flex',
            alignItems: 'center'
        },
        infoIcon: {
            marginLeft: '1rem'
        }
    })
);

export function UserProfile() {
    const user = useSelector(getUserOffchain);
    const backendClient: BackendClient = useSelector(getBackendClient);
    const userClient = backendClient?.userClient;
    const dispatch = useDispatch();
    const isLoading = useSelector(getLoading);
    const activeBlockchainAccountAddress = useSelector(getActiveBlockchainAccountAddress);
    const exchangeAddres = useSelector(getExchangeDepositAddress);
    const { t } = useTranslation();
    const { Yup, yupLocaleInitialized } = useValidation();
    let changeFieldValue: (name: string, value: any) => void;

    useEffect(() => {
        if (typeof changeFieldValue === 'function') {
            changeFieldValue('exchangeDepositAddress', exchangeAddres);
        }
    }, [exchangeAddres]);

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
                await userClient.updateOwnProfile({
                    firstName: values?.firstName,
                    lastName: values?.lastName,
                    telephone: values?.telephone,
                    email: values?.email
                });
                showNotification(t('user.profile.updateProfile'), NotificationType.Success);
            } else if (values.isBlockchain) {
                await userClient.updateOwnBlockchainAddress({
                    blockchainAccountAddress: values.blockchainAccountAddress
                });
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

    function createExchangeAddress() {
        try {
            if (user.status !== UserStatus.Active) {
                throw Error(t('user.feedback.onlyActiveUsersCan'));
            }
            dispatch(createExchangeDepositAddress());
        } catch (error) {
            if (error?.message) {
                showNotification(error?.message, NotificationType.Error);
            }
        }
    }

    function updateBlockchainAccount(callback: () => void): void {
        try {
            if (activeBlockchainAccountAddress === null) {
                throw Error(t('user.profile.noBlockchainConnection'));
            } else if (
                user?.blockchainAccountAddress === activeBlockchainAccountAddress.toLowerCase()
            ) {
                throw Error(t('user.feedback.thisAccountAlreadyConnected'));
            }
            dispatch(
                updateUserBlockchain({
                    user,
                    activeAccount: activeBlockchainAccountAddress,
                    callback
                })
            );
        } catch (error) {
            if (error?.message) {
                showNotification(error?.message, NotificationType.Error);
            }
        }
    }

    const initialFormValues: IFormValues = {
        ...user,
        blockchainAccountAddress: user.blockchainAccountAddress || '',
        exchangeDepositAddress: exchangeAddres || ''
    };

    return (
        <Formik
            initialValues={initialFormValues}
            validateOnMount={true}
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
                const { isSubmitting, touched, values, setFieldValue } = formikProps;
                const fieldDisabled = isSubmitting;
                changeFieldValue = setFieldValue;

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
                                    {t('user.properties.blockchainAddresses')}
                                </Typography>
                                <Grid style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                                    <Typography variant="h6">
                                        {t('user.properties.exchangeAddressTitle')}
                                    </Typography>
                                    <Box className={classes.buttonAndIconHolder}>
                                        {exchangeAddres ? (
                                            <Grid item xs={4}>
                                                <FormInput
                                                    property="exchangeDepositAddress"
                                                    disabled={true}
                                                />
                                            </Grid>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="contained"
                                                color="primary"
                                                disabled={isLoading}
                                                onClick={createExchangeAddress}
                                            >
                                                {t('user.actions.createDepositAddress')}
                                            </Button>
                                        )}
                                        <IconPopover
                                            icon={Info}
                                            popoverText={[
                                                t('user.popover.exchangeAddressWhatFor'),
                                                t('user.popover.exchangeAddressHowTo')
                                            ]}
                                            className={classes.infoIcon}
                                        />
                                    </Box>
                                </Grid>
                                <Grid style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                                    <Typography variant="h6">
                                        {t('user.properties.userBlockchainAddress')}
                                    </Typography>

                                    {user?.blockchainAccountAddress && (
                                        <Grid container>
                                            <Grid item xs={4}>
                                                <FormInput
                                                    property="blockchainAccountAddress"
                                                    disabled={true}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}
                                    <Box className={classes.buttonAndIconHolder}>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            color="primary"
                                            disabled={isLoading}
                                            onClick={() =>
                                                updateBlockchainAccount(() => {
                                                    setFieldValue(
                                                        'blockchainAccountAddress',
                                                        activeBlockchainAccountAddress
                                                    );
                                                })
                                            }
                                        >
                                            {!user?.blockchainAccountAddress
                                                ? t('user.actions.connectBlockchain')
                                                : t('user.actions.connectNewBlockchain')}
                                        </Button>
                                        <IconPopover
                                            icon={Info}
                                            popoverText={[
                                                t('user.popover.blockchainWhatIs'),
                                                t('user.popover.blockchainWhatFor'),
                                                t('user.popover.blockchainHowTo')
                                            ]}
                                            className={classes.infoIcon}
                                        />
                                    </Box>
                                </Grid>
                            </Paper>
                        </Form>
                    </>
                );
            }}
        </Formik>
    );
}
