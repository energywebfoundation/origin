import { IUser, UserUpdateData } from '@energyweb/origin-backend-core';
import { Button, createStyles, Grid, makeStyles, Paper, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { setLoading } from '../features/general/actions';
import { getOffChainDataSource } from '../features/general/selectors';
import { NotificationType, showNotification } from '../utils/notifications';
import { KeyKYCStatus, KeyStatus } from './AdminUsersTable';
import { FormInput } from './Form/FormInput';
import { FormSelect } from './Form/FormSelect';

interface IProps {
    entity: IUser;
    readOnly: boolean;
}

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
    status: 0,
    kycStatus: 0
};

const VALIDATION_SCHEMA = Yup.object({
    title: Yup.string().required().label('Mr'),
    firstName: Yup.string().required().label('First Name'),
    lastName: Yup.string().required().label('Last Name'),
    telephone: Yup.string().required().label('Telephone'),
    email: Yup.string().email().required().label('Email')
});

export function AdminUserForm(props: IProps) {
    const { entity, readOnly } = props;
    const adminClient = useSelector(getOffChainDataSource)?.adminClient;

    const [initialFormValuesFromExistingEntity, setInitialFormValuesFromExistingEntity] = useState<
        IUser
    >(null);

    const history = useHistory();

    const dispatch = useDispatch();

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    useEffect(() => {
        if (entity) {
            setInitialFormValuesFromExistingEntity(entity);
        }
    }, [entity]);

    async function submitForm(
        values: typeof INITIAL_FORM_VALUES,
        formikActions: FormikHelpers<typeof INITIAL_FORM_VALUES>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(setLoading(true));

        try {
            const formData: UserUpdateData = {
                ...values
            };

            await adminClient.update(formData);

            history.push('manage-user');

            showNotification('User updated.', NotificationType.Success);
        } catch (error) {
            console.warn('Error while update an user', error);

            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationType.Error);
            } else {
                showNotification('User could not be updated.', NotificationType.Error);
            }
        }

        dispatch(setLoading(false));
        formikActions.setSubmitting(false);
    }

    let initialFormValues: IUser = null;

    if (entity) {
        initialFormValues = initialFormValuesFromExistingEntity;
    }

    if (!initialFormValues) {
        return <Skeleton variant="rect" height={200} />;
    }

    const STATUS_OPTIONS = Object.keys(KeyStatus).map((key) => ({
        value: key,
        label: KeyStatus[key]
    }));

    const KYC_STATUS_OPTIONS = Object.keys(KeyKYCStatus).map((key) => ({
        value: key,
        label: KeyKYCStatus[key]
    }));

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                isInitialValid={false}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, errors } = formikProps;

                    const otherErrors = (errors as any)?.atLeastOneProp;

                    const fieldDisabled = isSubmitting || readOnly;
                    const buttonDisabled = isSubmitting || !isValid;
                    return (
                        <Form translate="">
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        label="Mr"
                                        property="title"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}></Grid>
                                <Grid item xs={6}>
                                    <FormInput
                                        label="First Name"
                                        property="firstName"
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
                                        label="Last Name"
                                        property="lastName"
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
                                    <FormSelect
                                        options={STATUS_OPTIONS}
                                        currentValue=""
                                        label="Status"
                                        property="status"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />

                                    <FormSelect
                                        options={KYC_STATUS_OPTIONS}
                                        currentValue=""
                                        label="KYC Status"
                                        property="kycStatus"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}></Grid>
                            </Grid>

                            {otherErrors && <div className="mt-3">{otherErrors}</div>}

                            {!readOnly && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className="mt-3 right"
                                    disabled={buttonDisabled}
                                >
                                    Update
                                </Button>
                            )}
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
