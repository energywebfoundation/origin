import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
    Paper,
    Grid,
    Button,
    useTheme,
    makeStyles,
    createStyles,
    FormControl,
    InputLabel,
    Select,
    FilledInput,
    MenuItem
} from '@material-ui/core';
import { Role } from '@energyweb/origin-backend-core';
import { showNotification, NotificationTypeEnum, roleNames } from '../../../utils';

import { FormInput } from '../../Form';
import { InvitationDTO } from '@energyweb/origin-backend-client';
import { Skeleton } from '@material-ui/lab';
import { fromGeneralActions, fromGeneralSelectors, fromUsersSelectors } from '../../../features';

interface IFormValues {
    email: string;
    role: number;
}

const INITIAL_FORM_VALUES: IFormValues = {
    email: '',
    role: Role.OrganizationUser
};

const VALIDATION_SCHEMA = Yup.object({
    email: Yup.string().email().required().label('Email')
});

export function OrganizationInvite() {
    const { t } = useTranslation();

    const backendClient = useSelector(fromGeneralSelectors.getBackendClient);
    const invitationClient = backendClient?.invitationClient;
    const organizationClient = backendClient?.organizationClient;
    const userOffchain = useSelector(fromUsersSelectors.getUserOffchain);
    const [invitations, setInvitations] = useState<InvitationDTO[]>(null);
    const dispatch = useDispatch();

    const getInvitations = async (): Promise<void> => {
        const orgId = userOffchain.organization.id;
        const {
            data: orgInvitations
        }: { data: InvitationDTO[] } = await organizationClient.getInvitationsForOrganization(
            orgId
        );
        setInvitations(orgInvitations);
    };

    useEffect(() => {
        if (organizationClient && userOffchain.organization.id) {
            getInvitations();
        }
    }, [organizationClient, userOffchain]);

    const useStyles = makeStyles(() =>
        createStyles({
            container: {
                padding: '10px'
            }
        })
    );

    const classes = useStyles(useTheme());

    async function submitForm(
        values: IFormValues,
        formikActions: FormikHelpers<IFormValues>
    ): Promise<void> {
        formikActions.setSubmitting(true);
        dispatch(fromGeneralActions.setLoading(true));

        const inviteAlreadySent = invitations.find((invite) => invite.email === values.email);
        try {
            if (inviteAlreadySent) {
                throw new Error();
            }
            await invitationClient.invite({
                email: values.email,
                role: values.role
            });
            formikActions.resetForm();
            showNotification(
                t('organization.invitations.notification.invitationSent'),
                NotificationTypeEnum.Success
            );
            getInvitations();
        } catch (error) {
            console.warn(t('organization.invitations.notification.errorInvitingUser'), error);
            const _error = { ...error };
            if (error?.response?.status === 401) {
                showNotification('Unauthorized.', NotificationTypeEnum.Error);
                showNotification(
                    t('organization.invitations.notification.unauthorized'),
                    NotificationTypeEnum.Error
                );
            } else if (inviteAlreadySent) {
                showNotification(
                    t('organization.invitations.notification.alreadySent'),
                    NotificationTypeEnum.Error
                );
            } else if (_error.response.status === 412) {
                showNotification(
                    `Only active users can perform this action. Your status is ${userOffchain.status}`,
                    NotificationTypeEnum.Error
                );
            } else {
                showNotification(
                    t('organization.invitations.notification.unableToInvite'),
                    NotificationTypeEnum.Error
                );
            }
        }

        dispatch(fromGeneralActions.setLoading(false));
        formikActions.setSubmitting(false);
    }

    const initialFormValues = INITIAL_FORM_VALUES;

    if (invitations === null) {
        return <Skeleton height={200} />;
    }

    return (
        <Paper className={classes.container}>
            <Formik
                initialValues={initialFormValues}
                onSubmit={submitForm}
                validationSchema={VALIDATION_SCHEMA}
                validateOnMount={true}
            >
                {(formikProps) => {
                    const { isValid, isSubmitting, values, setFieldValue } = formikProps;

                    const fieldDisabled = isSubmitting;
                    const buttonDisabled = isSubmitting || !isValid;

                    const selectedRole: Role = values.role;
                    return (
                        <Form translate="no">
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <FormInput
                                        data-cy="invitation-email"
                                        label="Email"
                                        property="email"
                                        disabled={fieldDisabled}
                                        className="mt-3"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl
                                        data-cy="invitation-role"
                                        fullWidth={true}
                                        variant="filled"
                                        className="mt-3"
                                    >
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={selectedRole}
                                            onChange={(e) =>
                                                setFieldValue('role', e.target.value as number)
                                            }
                                            fullWidth
                                            variant="filled"
                                            input={<FilledInput />}
                                        >
                                            {roleNames.map((role) => (
                                                <MenuItem key={role.label} value={role.value}>
                                                    {t(role.label)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Button
                                data-cy="invitation-submit"
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="mt-3 right"
                                disabled={buttonDisabled}
                            >
                                Invite
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Paper>
    );
}
